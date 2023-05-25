var express = require("express");
var router = express.Router();
const controller = require("../controller/usercontrol");
const authentication = require("../middleware/middlewares");

/* GET home page. */
router.get("/", controller.getHome);
// router.all('/',controller.cartCounts)

// router.route("/login").get(controller.showLogin).post(controller.postLogin);
router.get('/login',controller.showLogin);
router.post('/login',controller.postLogin)
router
  .route("/signup")

  .get(controller.showSignup)
  .post(controller.postSignup);

router.get("/shop", controller.shopView);
router.get('/category/:id',controller.category)

//list and unlist
router.get("/product-list", controller.getProductList);

router.get("/logout", controller.userlogout);

router.get("/otplogin", controller.showotp);
router.post("/sendOtp", controller.postotp);

router.get('/zoomView/:id',controller.zoomshopView)

router.get('/cart',authentication.userAuth, controller.userCart)


router.get('/add-to-cart/:id',authentication.userAuth,controller.addTocart)
router.post('/change-product-quantity',authentication.userAuth,controller.changeQuantity)

router.get("/delete-cart-product/:id", controller.deleteCartProduct)

//USER PROFILE MANAGEMENT
router.get("/profile", authentication.userAuth, controller.profilePage);
router.get("/order-page1", authentication.userAuth, controller.profileOrderPage);
router.get("/user-dash", authentication.userAuth, controller.userProfileDash);
router.get("/wallet", authentication.userAuth, controller.walletDetails);
router.get("/address", authentication.userAuth, controller.getProfileAddress);
router.get( "/add-addresspro",authentication.userAuth,controller.goToAddaddressPage);
router.post( "/submit-address", authentication.userAuth,controller.postuserProfileAddress);



router.get("/account-details",authentication.userAuth,controller.accountDetailsPage);

router.post('/account',authentication.userAuth,controller.accountDetails)


router.get('/editAddress/:id',authentication.userAuth,controller.getEditAddress)
router.post('/edit-address/:id',authentication.userAuth, controller.postEditaddress)

router.get('/delete-address/:id',authentication.userAuth,controller.deleteAddress)
//place order
router.get('/place-order', authentication.userAuth, controller.placeOrder)
router.get("/placeorder-address", authentication.userAuth, controller.addAddress);


router.post("/placesubmit-address",authentication.userAuth,controller.placeAddress);

router.post('/place-order', authentication.userAuth, controller.postPlaceorder)
router.get('/edit-placeorder/:id',authentication.userAuth,controller.editAddress)

//razor pay verify
router.post('/verify-payment',authentication.userAuth,controller.verifyPayment)
router.get('/order-success',authentication.userAuth,controller.orderSuccess)

router.get('/order-page',authentication.userAuth,controller.getOrderlist)

router.get('/view-order-products/:id',authentication.userAuth,controller.viewOrders)

router.get('/order-cancel/:id', authentication.userAuth, controller.cancelOrder)

router.post(
  "/deleteCart",
  authentication.userAuth,
  controller.deleteCartOrder
);
router.post("/cod-status", authentication.userAuth, controller.codStatus);

// router.get("/cancel-status", authentication.userAuth, controller.cancelStatus);

router.post("/apply-coupon", authentication.userAuth, controller.getApplyCoupon);
// router.get('/coupon-validation', authentication.userAuth, userController.couponValidation);



module.exports = router;
