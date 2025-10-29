const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../config/database').default;

const TelegramRegistrationRequest = sequelize.define('TelegramRegistrationRequest', {
  id: {
      type: DataTypes.UUID,
    defaultValue: UUIDV4,
    // autoIncrement: true,
    primaryKey: true,
  },
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  reasons: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  useCase: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  apiToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = TelegramRegistrationRequest;
