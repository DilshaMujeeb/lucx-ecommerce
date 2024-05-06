var express = require("express");
const { getMaxListeners } = require("../app");
var router = express.Router();
const adminControl = require("../controller/admincontrol");
// const productControl = require('../controller/productcontrol')
const adminHelper = require("../helpers/adminHelpers");
const db = require("../model/connection");
const multer = require("multer");
const photoload = require("../multer/multer");
const authentication = require("../middleware/middlewares");

router.get("/", authentication.adminAuth, adminControl.showDashboard);

router
  .route("/login")
  .get(adminControl.getAdminLogin)
  .post(adminControl.postAdminLogin);

//router.use(adminControl.adminAuth)

router.get("/logout", adminControl.adminLogout);

router.get("/view-users", authentication.adminAuth, adminControl.getUserlist);

router.get("/block-users/:id", adminControl.blockTheUser);

router.get("/unblock-users/:id", adminControl.unblockTheUser);

router
  .route("/add-product")
  .all(authentication.adminAuth)
  .get(adminControl.addProducts)
  .post(photoload.uploads, adminControl.postProducts);

router.get(
  "/view-product",
  authentication.adminAuth,
  adminControl.viewProducts,
);

router
  .route("/edit-product/:id")
  .all(authentication.adminAuth)
  .get(adminControl.editProduct)

  .post(photoload.uploads, adminControl.post_EditProduct);

// router.get('/view-product',authentication.adminAuth, productControl.viewProducts)

// router.route('/edit-product/:id')
//         .all(authentication.adminAuth)
//         .get(productControl.editProduct)

//         .post(photoload.editeduploads,productControl.post_EditProduct)

router
  .route("/add-category")
  .all(authentication.adminAuth)
  .get(adminControl.getCategory)
  .post(adminControl.postCategory);

// router.get('/delete-product/:id',adminControl.deleteTheProduct)

router.get("/list-product/:id", adminControl.listProducts);
router.get("/unlist-product/:id", adminControl.unlistProducts);

// router.get("/delete-category/:id", adminControl.deleteCategory)
router.get("/list-category/:id", adminControl.listCategory);
router.get("/unlist-category/:id", adminControl.unlistCategory);

// router.get("/edit-category/:id")
//         .all(authentication.adminAuth)
//         .get(adminControl.editCategory)
//          .post(adminControl.postEdCtegory)

router.get("/vieworders", authentication.adminAuth, adminControl.viewOrders);

router.get(
  "/view-order-products/:id",
  authentication.adminAuth,
  adminControl.getorderDetails,
);

router.post(
  "/order-status/:id",
  authentication.adminAuth,
  adminControl.postOrderDetails,
);

//coupon management

router.get("/coupon", authentication.adminAuth, adminControl.getCouponPage);
router.post("/coupon", authentication.adminAuth, adminControl.postCouponPage);
router.get(
  "/coupon-view",
  authentication.adminAuth,
  adminControl.getCouponView,
);

//sales-report
router.get("/sales", authentication.adminAuth, adminControl.getSales);
router.post("/sales", authentication.adminAuth, adminControl.postSalesFilter);

//add offer modules
router.get("/add-offer", authentication.adminAuth, adminControl.getAddoffer);
router.post("/add-offer", authentication.adminAuth, adminControl.postAddoffer);

router.get("/offer-list", authentication.adminAuth, adminControl.getOfferList);

module.exports = router;
