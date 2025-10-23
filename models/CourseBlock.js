const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');

const CourseBlock = sequelize.define('CourseBlock', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'quiz'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

CourseBlock.belongsTo(Course, { foreignKey: 'courseId' });
Course.hasMany(CourseBlock, { foreignKey: 'courseId' });

module.exports = CourseBlock;
