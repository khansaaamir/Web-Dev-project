const express = require('express')
const path = require('path')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
    res.render('home')
})

app.get('/checkout', function(req, res) {
    res.render('checkout')
})

app.get('/success', function(req, res) {
    res.render('success')
})

app.listen(3000)
