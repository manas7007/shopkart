import mongoose from 'mongoose';

let mongod = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

  try {
    // 1. If remote URI (Atlas) provided, connect directly
    if (mongoUri.includes('mongodb+srv://') || process.env.USE_REMOTE_DB === 'true') {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(` MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    }

    // 2. Try local MongoDB first with short timeout
    try {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 });
      console.log(` MongoDB Connected to local daemon: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (localErr) {
      console.log(' Local MongoDB service not detected on port 27017.');
      console.log('⚡ Initializing embedded in-memory MongoDB engine for zero-configuration testing...');
    }

    // 3. Fallback to MongoMemoryServer
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(` In-Memory MongoDB running and connected at: ${uri}`);

    // Auto-seed sample catalog and demo account
    const { default: Product } = await import('../models/product.model.js');
    const { default: Customer } = await import('../models/customer.model.js');
    const count = await Product.countDocuments();
    if (count === 0) {
      const { sampleProducts } = await import('../seed-data.js');
      await Product.insertMany(sampleProducts);
      console.log(` Auto-seeded ${sampleProducts.length} catalog products!`);

      const demoUser = new Customer({
        fullName: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        phone: '9876543210',
      });
      await demoUser.save();
      console.log(` Auto-created demo customer: johndoe@example.com (password: password123)`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

export const closeDB = async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};
