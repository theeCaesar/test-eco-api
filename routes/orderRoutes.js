const exp = require('express');
const ordersControllers = require('../controllers/orderControllers');

router = exp.Router();

router.route('/').get(ordersControllers.getOrders);

module.exports = router;
