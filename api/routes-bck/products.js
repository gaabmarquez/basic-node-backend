const expres = require('express');
const router = expres.Router();

const Product = require('../models/product.model.model');
const mongoose = require('mongoose');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname)
    }

});

const fileFilter = (req, file, cb) => {
    // reject a file

    if (file.mimetype === 'image/jpeg'
        || file.mimetype === 'image/png') {
        cb(null, true);

    } else {

        cb(new Error('File type not accepted, only accepts jpeg & png '), false);
    }

}
const upload = multer({
    storage, limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter
});
const checkAuth = require('../middleware/check-auth')

router.get('/', (req, res, next) => {
    // Product.find().where(20)

    Product.find()
        .limit(20)
        .select('name price _id productImage')
        .exec().then(
            docs => {
                const response = {
                    count: docs.length,
                    products: docs.map(doc => {
                        let { name, price, _id, productImage } = doc;

                        return {
                            _id,
                            name,
                            price,
                            productImage,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/products/' + doc._id
                            }
                        }
                    })
                }
                res.status(200).json(response);
            }
        ).catch(
            err => {
                console.log('err', err);
                res.status(500).json({
                    error: err
                });
            }
        )
});


router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then((doc) => {
            console.log('doc', doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        description: 'GET_ALL_PRODUCTS',
                        url: 'http://localhost:3000/products'
                    }

                });
            } else {
                res.status(404).json({
                    message: 'No valid entry found for provided ID'
                })
            }
        }).catch(err => {
            console.log('err', err);
            res.status(500).json({
                error: err
            });

        })

});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file)
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product.save().then(result => {
        console.log('>>>>>>>>>>>>>>result', result)
        let { name, price, _id, productImage } = result;
        res.status(201).json(
            {
                _id,
                name,
                price,
                productImage,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + _id
                }
            })
    }).catch(err => {
        res.status(500).json({ error: err })

    });


});



router.patch('/:productId', checkAuth,(req, res, next) => {
    const updateOps = {};
    const id = req.params.productId;
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    console.log(req.body, updateOps)
    Product.update({ _id: id }, {
        $set: updateOps
    }).exec()
        .then(result => {
            console.log('Result', result)
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err })
        });

});

router.delete('/:productId',checkAuth, (req, res, next) => {
    const id = req.params.productId;

    Product.deleteOne({ _id: id }).exec()
        .then(result => {
            console.log('SUCCESS')
            res.status(200).json({
                message: 'Product deteled'
            })
        })
        .catch(err => {
            console.error('ERROR')

            res.status(500).json({
                error: err
            });
        });


});

module.exports = router;