const sequelize = require('../config/database');
const Member = require('./Member');
const Event = require('./Event');
const Contact = require('./Contact');

// Define associations here if needed
// Example: Member.hasMany(Event);

const models = {
    Member,
    Event,
    Contact,
    sequelize
};

module.exports = models;