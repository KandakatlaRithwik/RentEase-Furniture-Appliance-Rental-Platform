// Run: node utils/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User    = require('../models/User');
const Product = require('../models/Product');

const products = [
  // ── Furniture ──────────────────────────────────────────
  { name: 'King Size Bed with Storage', category: 'furniture', subCategory: 'bed',
    description: 'Spacious king size bed with hydraulic storage underneath.',
    monthlyRent: 899, securityDeposit: 1800, tenureOptions: [3, 6, 12],
    totalQuantity: 5, availableQuantity: 5, brand: 'WoodCraft', condition: 'good', city: 'All' },
  { name: 'L-Shape Sofa Set', category: 'furniture', subCategory: 'sofa',
    description: '5-seater L-shape sofa with premium fabric.',
    monthlyRent: 699, securityDeposit: 1400, tenureOptions: [3, 6, 12],
    totalQuantity: 4, availableQuantity: 4, brand: 'ComfortLiving', condition: 'like_new', city: 'All' },
  { name: 'Study Table with Chair', category: 'furniture', subCategory: 'table',
    description: 'Ergonomic study table with height-adjustable chair.',
    monthlyRent: 299, securityDeposit: 600, tenureOptions: [1, 3, 6],
    totalQuantity: 10, availableQuantity: 10, brand: 'DeskPro', condition: 'good', city: 'All' },
  { name: '3-Door Wardrobe', category: 'furniture', subCategory: 'wardrobe',
    description: 'Spacious 3-door wardrobe with mirror.',
    monthlyRent: 499, securityDeposit: 1000, tenureOptions: [3, 6, 12],
    totalQuantity: 6, availableQuantity: 6, brand: 'SpaceMax', condition: 'good', city: 'All' },

  // ── Appliances ─────────────────────────────────────────
  { name: 'Double Door Refrigerator 350L', category: 'appliance', subCategory: 'fridge',
    description: 'Energy-efficient double door fridge with frost-free technology.',
    monthlyRent: 799, securityDeposit: 2000, tenureOptions: [3, 6, 12],
    totalQuantity: 8, availableQuantity: 8, brand: 'Samsung', condition: 'good', city: 'All' },
  { name: 'Fully Automatic Washing Machine 7kg', category: 'appliance', subCategory: 'washing_machine',
    description: 'Top load fully automatic washing machine with multiple wash programs.',
    monthlyRent: 599, securityDeposit: 1500, tenureOptions: [3, 6, 12],
    totalQuantity: 6, availableQuantity: 6, brand: 'LG', condition: 'good', city: 'All' },
  { name: '43" Smart LED TV', category: 'appliance', subCategory: 'tv',
    description: '4K Ultra HD Smart TV with built-in streaming apps.',
    monthlyRent: 699, securityDeposit: 1500, tenureOptions: [3, 6, 12],
    totalQuantity: 7, availableQuantity: 7, brand: 'Sony', condition: 'like_new', city: 'All' },
  { name: '1.5 Ton Split AC', category: 'appliance', subCategory: 'ac',
    description: '5-star rated inverter split AC with fast cooling.',
    monthlyRent: 999, securityDeposit: 2500, tenureOptions: [3, 6, 12],
    totalQuantity: 5, availableQuantity: 5, brand: 'Daikin', condition: 'good', city: 'All' },
  { name: 'Microwave Oven 25L', category: 'appliance', subCategory: 'microwave',
    description: 'Convection microwave with grill and solo modes.',
    monthlyRent: 249, securityDeposit: 500, tenureOptions: [1, 3, 6],
    totalQuantity: 10, availableQuantity: 10, brand: 'IFB', condition: 'good', city: 'All' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ✅ Clear ALL collections — no demo data left in production
  const Order       = mongoose.connection.collection('orders');
  const Maintenance = mongoose.connection.collection('maintenances');
  const Booking     = mongoose.connection.collection('bookings');
  const Notif       = mongoose.connection.collection('notifications');

  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Maintenance.deleteMany({});
  await Booking.deleteMany({});
  await Notif.deleteMany({});
  console.log('🗑️  Cleared ALL existing data (users, products, orders, maintenance, notifications)');

  // Admin user
  await User.create({
    name:     'Admin',
    email:    'admin@rentease.com',
    password: 'admin123',
    role:     'admin',
  });

  // Test user
  await User.create({
    name:     'Test User',
    email:    'user@rentease.com',
    password: 'user123',
    role:     'user',
    phone:    '9876543210',
  });

  await Product.insertMany(products);

  console.log('✅ Seed complete!');
  console.log('   Admin → admin@rentease.com / admin123');
  console.log('   User  → user@rentease.com  / user123');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
