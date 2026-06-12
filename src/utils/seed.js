/**
 * seed.js  –  run once to populate the DB with sample data
 * Usage:  node src/utils/seed.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import connectDB from '../config/db.js';
import User     from '../models/User.js';
import Product  from '../models/Product.js';

const users = [
  {
    userName: 'Admin User',
    email:    'admin@example.com',
    password: 'admin123',
    role:     'admin',
    phone:    '01012345678',
    gender:   'male',
  },
  {
    userName: 'Ahmed Ali',
    email:    'ahmed@example.com',
    password: 'user1234',
    phone:    '01098765432',
    gender:   'male',
  },
];

const products = [
  {
    title:       'Classic White T-Shirt',
    description: 'Premium cotton everyday tee',
    price:       199,
    discount:    10,
    stock:       50,
    category:    'clothing',
    image:       'https://via.placeholder.com/400x400?text=T-Shirt',
  },
  {
    title:       'Running Sneakers',
    description: 'Lightweight and comfortable running shoes',
    price:       850,
    discount:    20,
    stock:       30,
    category:    'shoes',
    image:       'https://via.placeholder.com/400x400?text=Sneakers',
  },
  {
    title:       'Wireless Headphones',
    description: 'Noise-cancelling Bluetooth headphones',
    price:       1299,
    discount:    15,
    stock:       20,
    category:    'electronics',
    image:       'https://via.placeholder.com/400x400?text=Headphones',
  },
  {
    title:       'Leather Wallet',
    description: 'Slim genuine leather wallet',
    price:       350,
    discount:    0,
    stock:       100,
    category:    'accessories',
    image:       'https://via.placeholder.com/400x400?text=Wallet',
  },
  {
    title:       'Sunglasses',
    description: 'UV400 polarised sunglasses',
    price:       450,
    discount:    5,
    stock:       60,
    category:    'accessories',
    image:       'https://via.placeholder.com/400x400?text=Sunglasses',
  },
  {
    title:       'Smart Watch',
    description: 'Fitness tracker with heart-rate monitor',
    price:       2499,
    discount:    25,
    stock:       15,
    category:    'electronics',
    image:       'https://via.placeholder.com/400x400?text=SmartWatch',
  },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database …');

  await User.deleteMany();
  await Product.deleteMany();

  // hash passwords manually since pre-save hook handles individual saves
  const createdUsers = await User.insertMany(
    await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 12),
      }))
    )
  );

  await Product.insertMany(products);

  console.log(`✅ Created ${createdUsers.length} users`);
  console.log(`✅ Created ${products.length} products`);
  console.log('\nAdmin credentials:');
  console.log('  Email:    admin@example.com');
  console.log('  Password: admin123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
