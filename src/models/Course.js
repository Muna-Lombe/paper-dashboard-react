const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../config/database').default;

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    // autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lastAccessed: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Course;
