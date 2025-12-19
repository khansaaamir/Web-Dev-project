function applyDiscount(req, res, next){
    let code = req.query.coupon || req.body.coupon || req.session.couponCode
    if(req.session.cart && req.session.cart.length > 0){
        let total = 0
        req.session.cart.forEach(item => {
            total += item.price * item.qty
        })
        if(code === 'SAVE10'){
            total = total - (total * 0.1)
            req.session.couponCode = code
        }
        req.session.discountedTotal = total
    }
    next()
}

module.exports = applyDiscount
