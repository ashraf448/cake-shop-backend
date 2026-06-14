import crypto from 'crypto';
globalThis.crypto = crypto;
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

console.log("MONGO_URI:", process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    server.close(async () => {
      const mongoose = (await import('mongoose')).default;
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start();