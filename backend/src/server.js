require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initRedis } = require('./config/redis');

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  // Connect database
  await connectDB();
  
  // Connect cache (optional)
  await initRedis();

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

startServer();
