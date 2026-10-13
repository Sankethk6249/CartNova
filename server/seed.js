require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const email = ADMIN_EMAIL.toLowerCase();
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.findOneAndUpdate(
    { email },
    { name: ADMIN_NAME || 'Admin', email, password: hashed, role: 'admin' },
    { upsert: true, new: true }
  );
  console.log(`Admin ready: ${email}`);

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany([
      { name: 'Wireless Headphones', description: 'Bluetooth over-ear headphones with 30h battery.', price: 1999, category: 'Electronics', stock: 25, image: 'https://picsum.photos/seed/headphones/400/300' },
      { name: 'Smart Watch', description: 'Fitness tracking and notifications.', price: 2999, category: 'Electronics', stock: 15, image: 'https://picsum.photos/seed/watch/400/300' },
      { name: 'Running Shoes', description: 'Lightweight shoes for daily running.', price: 1499, category: 'Fashion', stock: 40, image: 'https://picsum.photos/seed/shoes/400/300' },
      { name: 'Backpack', description: 'Water-resistant 25L laptop backpack.', price: 899, category: 'Fashion', stock: 30, image: 'https://picsum.photos/seed/backpack/400/300' },
      { name: 'Coffee Mug Set', description: 'Set of 4 ceramic mugs.', price: 499, category: 'Home', stock: 50, image: 'https://picsum.photos/seed/mug/400/300' },
      { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness.', price: 699, category: 'Home', stock: 20, image: 'https://picsum.photos/seed/lamp/400/300' },
    ]);
    console.log('Sample products added');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});