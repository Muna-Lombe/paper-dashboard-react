
import { Sequelize } from 'sequelize';
// const path = require('path'); // Path is not available in Cloudflare Workers for file system operations

// Configure Sequelize for Cloudflare D1 or an external database.
// Direct SQLite file storage is not supported in Cloudflare Workers.
// You would typically use a D1 binding and interact with it via its API,
// or connect to an external SQL database (e.g., PostgreSQL, MySQL).
const sequelize = new Sequelize({
  // For D1, you would interact with the DB binding directly or use a compatible ORM/query builder.
  // Keeping 'sqlite' dialect as a placeholder for D1's SQLite compatibility, but 'storage' is not applicable.
  dialect: 'sqlite',
  // storage: path.join(__dirname, '../database.sqlite'), // Not supported in Cloudflare Workers
  logging: false,
  define: {
    timestamps: true
  }
});


const connectDB = async () => {
  try {
    // In a Cloudflare Worker, database connections are managed differently.
    // You would typically access the D1 binding from the 'env' object.
    // sequelize.authenticate() and sequelize.sync() are for traditional Node.js environments.
    // await sequelize.authenticate();
    // console.log('Database connection established');
    // await sequelize.sync({ alter: true });
    // console.log('Database synchronized');
    console.log('Database connection setup is placeholder for Cloudflare Workers.');
  } catch (error) {
    console.error('Database Connection Error:', error.message);
    // In a Worker, you might not want to exit the process, but rather return an error response.
    // process.exit(1);
    throw error; // Rethrow for error handling in the Worker's fetch handler
  }
};

export { sequelize, connectDB };
