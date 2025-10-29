const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database').default;
const User = require('./User'); // Assuming you have a User model

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Reference the User model
      key: 'id',
    },
  },
  lessonDays: {
    type: DataTypes.JSON, // Store as JSON to handle dynamic keys and array values
    allowNull: true,
  },
  holidayDays: {
    type: DataTypes.JSON, // Store as JSON
    allowNull: true,
  },
  holidayLessons: {
    type: DataTypes.JSON, // Store as JSON
    allowNull: true,
  },
  selectedMonths: {
    type: DataTypes.JSON, // Store as JSON array
    allowNull: true,
  },
  selectAll: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Establish association
Schedule.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Schedule, { foreignKey: 'userId' });

module.exports = Schedule;
