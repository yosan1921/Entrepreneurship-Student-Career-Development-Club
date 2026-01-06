const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 200]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('workshop', 'seminar', 'competition', 'training', 'meeting'),
        defaultValue: 'workshop'
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'ongoing', 'completed'),
        defaultValue: 'upcoming'
    }
}, {
    tableName: 'events',
    timestamps: true
});

module.exports = Event;