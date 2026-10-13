const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Place an order (price + stock are verified on the server)
router.post('/', protect, async (req, res) => {
  try {
    const { items, address } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    if (!address || !address.trim()) return res.status(400).json({ error: 'Delivery address is required' });

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const qty = parseInt(item.qty, 10);
      if (!qty || qty < 1) return res.status(400).json({ error: 'Invalid quantity' });

      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: 'A product in your cart no longer exists' });
      if (product.stock < qty) {
        return res.status(400).json({ error: `Only ${product.stock} left for "${product.name}"` });
      }

      orderItems.push({ product: product._id, name: product.name, price: product.price, qty });
      total += product.price * qty;
    }

    // Reduce stock atomically; roll back if any item fails
    const done = [];
    for (const it of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: it.product, stock: { $gte: it.qty } },
        { $inc: { stock: -it.qty } }
      );
      if (!updated) {
        for (const d of done) await Product.findByIdAndUpdate(d.product, { $inc: { stock: d.qty } });
        return res.status(409).json({ error: `"${it.name}" just went out of stock` });
      }
      done.push(it);
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      address: address.trim(),
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// My orders
router.get('/mine', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// Admin: all orders
router.get('/', protect, admin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// Admin: update status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Invalid order id' });
  }
});

module.exports = router;