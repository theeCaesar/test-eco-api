const exp = require('express');
const productsControllers = require('../controllers/productControllers');
const authControllers = require('../controllers/authControllers');
const ordersControllers = require('../controllers/orderControllers');
const statesController = require('../controllers/statesController');

router = exp.Router({ mergeParams: true });

router.route('/signup').post(authControllers.signup('admin'));
router.route('/login').post(authControllers.login);

router.use(authControllers.protect);
router.use(authControllers.onlyPermission('admin'));

router
  .route('/products')
  .get(productsControllers.getProducts)
  .post(
    productsControllers.uploadProductImages,
    productsControllers.resizeProductImages,
    productsControllers.createProduct,
  );

router
  .route('/products/:productId')
  .get(productsControllers.getProduct)
  .patch(
    productsControllers.uploadProductImages,
    productsControllers.resizeProductImages,
    productsControllers.updateProduct,
  )
  .delete(productsControllers.deleteProduct);

//orders
router
  .route('/orders')
  .get(ordersControllers.getOrders)
  .post(ordersControllers.createOrder);

router
  .route('/orders/:orderId')
  .get(ordersControllers.getOrder)
  .patch(ordersControllers.updateOrder)
  .delete(ordersControllers.deleteOrder);

//states

router.route('/getTotalCustomers').get(statesController.getTotalCustomers);
router.route('/getTotalRevenue').get(statesController.getTotalRevenue);

module.exports = router;
