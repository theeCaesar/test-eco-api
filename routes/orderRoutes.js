const exp = require('express');
const ordersControllers = require('../controllers/orderControllers');

router = exp.Router();

// router.route('/history').get(ordersControllers.getOrders);
router.route('/').post(ordersControllers.createOrder);

module.exports = router;
