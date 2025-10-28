const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');

const CourseCorrection = sequelize.define('CourseCorrection', {
  id: {
      type: DataTypes.UUID,
    defaultValue: UUIDV4,
    // autoIncrement: true,
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
  blockId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Correction can be for a whole course or a specific block
  },
  correctionText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // You can add more fields like 'userId' for who made the correction, 'status' etc.
});

CourseCorrection.belongsTo(Course, { foreignKey: 'courseId' });
Course.hasMany(CourseCorrection, { foreignKey: 'courseId' });

module.exports = CourseCorrection;
