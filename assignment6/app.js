const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressLayouts)
app.set('layout', 'layout')

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bikerental')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err))


// Product Schema and Model
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    description: String
})
const Product = mongoose.model('Product', productSchema)

// Insert sample data if collection is empty
Product.countDocuments().then(count => {
    if(count === 0) {
        Product.insertMany([
            { name: 'Bike 1', price: 100, category: 'Mountain', image: '/assets/home_bikerental_bike2.jpg', description: 'Nice mountain bike' },
            { name: 'Bike 2', price: 200, category: 'Road', image: '/assets/home_bikerental_bike3.jpg', description: 'Fast road bike' },
            { name: 'Bike 3', price: 150, category: 'City', image: '/assets/home_bikerental_bike5.jpg', description: 'Comfortable city bike' },
            { name: 'Bike 4', price: 250, category: 'Mountain', image: '/assets/home_bikerental_bike4.jpg', description: 'Strong mountain bike' },
            { name: 'Bike 5', price: 180, category: 'Road', image: '/assets/home_bikerental_bike3.jpg', description: 'Light road bike' }
        ]).then(() => console.log('Sample products added'))
        .catch(err => console.log(err))
    }
}).catch(err => console.log(err))

// Home route with pagination & filters
app.get('/', function(req, res) {
    let page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 3
    let category = req.query.category || ''
    let minPrice = parseInt(req.query.minPrice) || 0
    let maxPrice = parseInt(req.query.maxPrice) || 10000

    let filter = {}
    if(category !== '') filter.category = category
    filter.price = { $gte: minPrice, $lte: maxPrice }

    Product.find(filter).skip((page-1)*limit).limit(limit).then(products => {
        Product.countDocuments(filter).then(count => {
            res.render('home', {
                products: products,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                category: category,
                minPrice: minPrice,
                maxPrice: maxPrice
            })
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
})

app.get('/checkout', function(req, res) {
    res.render('checkout')
})

app.get('/success', function(req, res) {
    res.render('success')
})

app.listen(3000, function() {
    console.log('Server running on http://localhost:3000')
})
