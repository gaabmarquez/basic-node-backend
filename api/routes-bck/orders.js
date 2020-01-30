const expres = require('express');
const router = expres.Router();


const Order = require('../models/order.model.model');
const Product = require('../models/product.model.model');

const mongoose = require('mongoose');

const checkAuth = require('../middleware/check-auth')

const ordersController = require('../controllers/orders.controller')

router.get('/', checkAuth, ordersController.getAllOrders);

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId).exec().then(
        product => {
            if (!product) {
                return res.status(404).json({
                    message: `Product not found with id: ${req.body.productId}`
                })
            } else {
                const order = new Order({
                    _id: mongoose.Types.ObjectId(),
                    quantity: req.body.quantity,
                    product: req.body.productId
                });

                order.save().then(result => {
                    res.status(201).json({
                        message: "Order was created",
                        order: result
                    })
                }).catch(
                    err => {
                        res.status(500).json({
                            message: 'Something went really wrong',
                            error: err
                        })
                    }
                )

            }
        }
    ).catch(
        err => {
            res.status(500).json({
                message: 'Something went really wrong22',
                error: err
            })
        }
    );


});

router.get('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('product quantity _id')
        .populate('product', 'name price')
        .exec()
        .then((doc) => {
            console.log('doc', doc);
            if (doc) {
                res.status(200).json({
                    order: doc,
                    request: {
                        type: 'GET',
                        description: 'GET_ALL_ORDERS',
                        url: 'http://localhost:3000/orders'
                    }

                });
            } else {
                res.status(404).json({
                    message: 'Order not found'
                })
            }
        }).catch(err => {
            console.log('err', err);
            res.status(500).json({
                error: err
            });

        })

});


router.delete('/:orderId', checkAuth, (req, res, next) => {
    const orderId = req.params.orderId;
    Order.remove({ _id: orderId }).exec().then(
        result => {
            res.status(200).json({
                message: 'Deleted orders: ' + result.n,
            })
        }
    ).catch(err => {
        console.log('err', err);
        res.status(500).json({
            error: err
        });

    });
});


module.exports = router;