const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    email: String,
    items: Array,
    total: Number,
    status: String,
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Order', orderSchema)
