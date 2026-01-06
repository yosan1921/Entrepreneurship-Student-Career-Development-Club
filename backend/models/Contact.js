const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    subject: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 200]
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 2000]
        }
    },
    status: {
        type: DataTypes.ENUM('new', 'read', 'replied'),
        defaultValue: 'new'
    },
    submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'contacts',
    timestamps: true,
    createdAt: 'submittedAt',
    updatedAt: 'updatedAt'
});

module.exports = Contact;