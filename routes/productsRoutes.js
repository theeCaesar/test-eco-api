const exp = require('express');
const productsControllers = require('../controllers/productControllers');

router = exp.Router({ mergeParams: true });

router.route('/').get(productsControllers.getProducts);
router.route('/:productId').get(productsControllers.getProduct);

module.exports = router;
