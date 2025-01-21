const exp = require('express');
const ordersControllers = require('../controllers/orderControllers');

router = exp.Router();

router.route('/').get(ordersControllers.getOrders);
router.route('/').post(ordersControllers.createOrder);

module.exports = router;
