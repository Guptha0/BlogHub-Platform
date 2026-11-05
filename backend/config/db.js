const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    if (uri && uri.trim() !== '') {
      console.log(`Connecting to specified MongoDB URI...`);
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
    
    // Attempt local MongoDB default first
    try {
      console.log('Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/bloghub)...');
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/bloghub', {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log('Local MongoDB not running. Initializing in-memory MongoDB server for seamless zero-setup testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`In-Memory MongoDB Connected at: ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error(`MongoDB Disconnect Error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };

