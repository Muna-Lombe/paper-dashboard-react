const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false // Set to console.log to see SQL queries
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        // console.log('SQLite Connected Successfully');
        
        // Sync all models
        await sequelize.sync({ alter: true });
        // console.log('Database models synchronized');
    } catch (error) {
        console.error('Database Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB }; 