const path = require('path');
module.paths.push(path.join(__dirname, '../server/node_modules'));
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../server/src/models/User');
const Category = require('../server/src/models/Category');
const Product = require('../server/src/models/Product');
const Cart = require('../server/src/models/Cart');
const Order = require('../server/src/models/Order');

const seedData = require('./seedData.json');

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease';
  console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);

  await mongoose.connect(mongoUri);

  try {
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
    ]);

    // 1. Seed Users (with BCrypt log rounds = 10 matching reference project)
    console.log('[Seed] Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const customerHash = await bcrypt.hash('Customer@123', salt);

    const [adminUser, johnUser, janeUser] = await User.create([
      {
        name: 'System Administrator',
        email: 'admin@shoppingcart.com',
        passwordHash: adminHash,
        phone: '9876543210',
        role: 'ADMIN',
      },
      {
        name: 'John Customer',
        email: 'john@example.com',
        passwordHash: customerHash,
        phone: '9876543211',
        role: 'CUSTOMER',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: customerHash,
        phone: '9876543212',
        role: 'CUSTOMER',
      },
    ]);

    console.log(`[Seed] Created ${3} users (1 Admin, 2 Customers).`);

    // 2. Seed Categories
    console.log('[Seed] Seeding categories...');
    const createdCategories = await Category.insertMany(seedData.categories);
    const categoryMap = {};
    for (const cat of createdCategories) {
      categoryMap[cat.categoryId] = cat;
    }
    console.log(`[Seed] Created ${createdCategories.length} product categories.`);

    // 3. Seed Products
    console.log('[Seed] Seeding products...');
    const productDocs = seedData.products.map((p) => {
      const categoryDoc = categoryMap[p.categoryId] || createdCategories[0];
      return {
        name: p.name,
        category: categoryDoc._id,
        description: p.description,
        price: p.price,
        stockQty: p.stockQty,
        imagePath: p.imagePath,
        isActive: p.isActive !== false,
        productId: p.productId,
      };
    });

    const createdProducts = await Product.insertMany(productDocs);
    console.log(`[Seed] Created ${createdProducts.length} products across 10 categories.`);

    // 4. Seed Demonstration Orders for John and Jane
    console.log('[Seed] Seeding demonstration orders...');
    const p1 = createdProducts[0]; // Headphones
    const p2 = createdProducts[2]; // Smartwatch
    const p3 = createdProducts[9]; // Cotton T-Shirt

    const order1 = await Order.create({
      orderNumber: 1001,
      user: johnUser._id,
      customerName: johnUser.name,
      customerEmail: johnUser.email,
      customerPhone: johnUser.phone,
      shippingAddress: '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      paymentMethod: 'COD',
      status: 'PLACED',
      totalAmount: Math.round((p1.price * 1 + p3.price * 2) * 100) / 100,
      items: [
        {
          product: p1._id,
          productId: p1.productId,
          productName: p1.name,
          productImage: p1.imagePath,
          categoryName: 'Electronics and mobile accessories',
          quantity: 1,
          unitPrice: p1.price,
          subtotal: p1.price,
        },
        {
          product: p3._id,
          productId: p3.productId,
          productName: p3.name,
          productImage: p3.imagePath,
          categoryName: 'Fashion and clothing',
          quantity: 2,
          unitPrice: p3.price,
          subtotal: Math.round(p3.price * 2 * 100) / 100,
        },
      ],
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    });

    const order2 = await Order.create({
      orderNumber: 1002,
      user: johnUser._id,
      customerName: johnUser.name,
      customerEmail: johnUser.email,
      customerPhone: johnUser.phone,
      shippingAddress: '42 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      paymentMethod: 'MOCK',
      status: 'DELIVERED',
      totalAmount: p2.price,
      items: [
        {
          product: p2._id,
          productId: p2.productId,
          productName: p2.name,
          productImage: p2.imagePath,
          categoryName: 'Electronics and mobile accessories',
          quantity: 1,
          unitPrice: p2.price,
          subtotal: p2.price,
        },
      ],
      orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    });

    const order3 = await Order.create({
      orderNumber: 1003,
      user: janeUser._id,
      customerName: janeUser.name,
      customerEmail: janeUser.email,
      customerPhone: janeUser.phone,
      shippingAddress: '15 Park Street, Kolkata, West Bengal 700016',
      paymentMethod: 'COD',
      status: 'PACKED',
      totalAmount: p1.price,
      items: [
        {
          product: p1._id,
          productId: p1.productId,
          productName: p1.name,
          productImage: p1.imagePath,
          categoryName: 'Electronics and mobile accessories',
          quantity: 1,
          unitPrice: p1.price,
          subtotal: p1.price,
        },
      ],
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });

    console.log(`[Seed] Created ${3} demonstration orders (#1001, #1002, #1003).`);

    // 5. Seed Initial Carts
    await Cart.create([
      { user: johnUser._id, items: [] },
      { user: janeUser._id, items: [] },
      { user: adminUser._id, items: [] },
    ]);

    console.log('====================================================');
    console.log(' ShopEase Database Seeding Completed Successfully! ');
    console.log('====================================================');
    console.log(`  Users Provisioned:`);
    console.log(`    Admin    : admin@shoppingcart.com / Admin@123`);
    console.log(`    Customer : john@example.com / Customer@123`);
    console.log(`    Customer : jane@example.com / Customer@123`);
    console.log(`  Categories : ${createdCategories.length}`);
    console.log(`  Products   : ${createdProducts.length}`);
    console.log(`  Orders     : 3 sample orders`);
    console.log('====================================================');
  } catch (error) {
    console.error(`[Seed] Error during seeding: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
