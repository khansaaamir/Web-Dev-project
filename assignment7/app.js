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
const multer = require('multer')
const upload = multer({ dest: 'public/uploads/' })


mongoose.connect('mongodb://127.0.0.1:27017/bikerental')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err))



const Product = require('./models/Product')



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
app.get('/admin', function(req, res) {
    res.render('admin/dashboard')
})

app.get('/success', function(req, res) {
    res.render('success')
})

app.get('/admin', function(req, res){
    res.render('admin/dashboard', {
        layout: 'admin/layout'
    })
})

app.get('/admin/products', function(req, res){
    Product.find().then(function(products){
        res.render('admin/products', {
            products: products,
            layout: 'admin/layout'
        })
    })
})

app.get('/admin/products/add', function(req, res){
    res.render('admin/add', {
        layout: 'admin/layout'
    })
})

app.post('/admin/products/add', upload.single('image'), function(req, res){
    let imagePath = ''
    if(req.file){
        imagePath = '/uploads/' + req.file.filename
    }

    let product = new Product({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        image: imagePath,
        description: req.body.description
    })

    product.save().then(function(){
        res.redirect('/admin/products')
    })
})


app.get('/admin/products/edit/:id', function(req, res){
    Product.findById(req.params.id).then(function(product){
        res.render('admin/edit', {
            product: product,
            layout: 'admin/layout'
        })
    })
})

app.post('/admin/products/edit/:id', upload.single('image'), function(req, res){
    let updateData = {
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        description: req.body.description
    }

    if(req.file){
        updateData.image = '/uploads/' + req.file.filename
    }

    Product.findByIdAndUpdate(req.params.id, updateData)
    .then(function(){
        res.redirect('/admin/products')
    })
})


app.post('/admin/products/delete/:id', function(req, res){
    Product.findByIdAndDelete(req.params.id).then(function(){
        res.redirect('/admin/products')
    })
})


app.listen(3000, function() {
    console.log('Server running on http://localhost:3000')
})
