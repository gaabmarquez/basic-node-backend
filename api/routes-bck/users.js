const expres = require('express');
const router = expres.Router();
const bcrypt = require('bcrypt')
const User = require('../models/user.model.model');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                res.status(422).json({ message: 'User already exists with that email' })
            } else {

                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        })

                        user.save().then((resp) => {
                            console.log('RESSS', resp)
                            return res.status(201).json({
                                user: resp
                            });

                        }).catch(err => {
                            return res.status(500).json({
                                error: err
                            });
                        })
                    }



                })
            }
        });




});

router.get('/', (req, res, next) => {
    User.find()
        .limit(20)
        // .select('product quantity _id')
        .exec().then(result => {

            res.status(200).json({
                users: result,
                quantity: result.length
            })
        }).catch(err => {
            res.status(500).json({
                message: 'Something went really wrong',
                error: err
            })
        })

});

router.delete('/:userId', (req, resp, next) => {
    User.remove({ _id: req.params.userId }).exec().then(
        resp.status(200).json({
            message: 'User deleted'
        })
    ).catch(err => {
        return resp.status(500).json({
            error: err
        });
    });
})


router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (!user) {
                res.status(401).json({ message: 'Invalid email or password' })
            } else {
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (err) {
                        return res.status(401).json({ message: 'Invalid email or password' })

                    }
                    if (result) {
                        const token = jwt.sign(
                            {
                                email: user.email,
                                userId: user._id
                            },
                            process.env.JWT_KEY,
                            {
                                expiresIn: '1h'
                            }

                        )
                        return res.status(200).json({
                            message: 'Auth success',
                            token: token
                        });
                    } else {

                        return res.status(401).json({
                            message: 'Auth failed'

                        });
                    }

                });
            }
        });


})

module.exports = router;