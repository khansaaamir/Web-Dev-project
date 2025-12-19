const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')

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

app.use(session({
    secret: 'cart',
    resave: false,
    saveUninitialized: true
}))

app.get('/', function(req, res) {
    let page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 3
    let category = req.query.category || ''
    let minPrice = parseInt(req.query.minPrice) || 0
    let maxPrice = parseInt(req.query.maxPrice) || 1000000

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
    let cart = req.session.cart || []
    let total = 0

    cart.forEach(item => {
        total = total + (item.price * item.qty)
    })

    res.render('checkout', {
        cart: cart,
        total: total
    })
})



app.get('/success', function(req, res) {
    req.session.cart = []
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
        price: parseFloat(req.body.price) || 0,
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
        price: parseFloat(req.body.price) || 0,
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
app.get('/product/:id', async (req, res) => {
    const product = await Product.findById(req.params.id)
    res.render('product', { product })
})
app.get('/add-to-cart/:id', async (req, res) => {
    if (!req.session.cart) {
        req.session.cart = []
    }

    const product = await Product.findById(req.params.id)

    let found = false

    req.session.cart.forEach(item => {
        if (item._id == product._id) {
            item.qty = item.qty + 1
            found = true
        }
    })

    if (!found) {
        req.session.cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            qty: 1
        })
    }

    res.redirect('/cart')
})
app.get('/cart', (req, res) => {
    let cart = req.session.cart || []
    res.render('cart', { cart })
})
app.get('/remove-from-cart/:id', (req, res) => {
    req.session.cart = req.session.cart.filter(item => item._id != req.params.id)
    res.redirect('/cart')
})
app.get('/clear-cart', (req, res) => {
    req.session.cart = []
    res.redirect('/cart')
})


app.listen(3000, function() {
    console.log('Server running on http://localhost:3000')
})
