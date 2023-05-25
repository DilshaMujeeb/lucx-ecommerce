const adminhelpers = require("../helpers/adminHelpers");
const userhelpers = require("../helpers/userHelpers");
const { category, order } = require("../model/connection");

// const { validationResult } = require('express-validator');

const authentication = require("../middleware/middlewares");

const { response } = require("../app");

var loginheader, loginStatus;

module.exports = {
  getHome: async (req, res) => {
    let cat = [];
    if (req.session.user) {
      let user = req.session.user._id;
      let username = req.session.user.username;

      console.log(user, "loggedin user");
      cat = await adminhelpers.findAllcategories();
      userhelpers.getCartCount(user).then((proCount) => {
        console.log("cartcount", proCount);

        res.render("user/userhome", {
          loginheader: true,
          header:true,
          proCount,
          username,
          cat: cat,
        });
      });
    } else {
      cat = await adminhelpers.findAllcategories();
      res.render("user/userhome", {
        loginheader: false,
        header: true,
        cat: cat,
      });
    }
  },
  showLogin: (req, res) => {
    //back akumbol logout aavarathu
    if (req.session.user) {
      let username = req.session.user.username;
      res.render("user/userhome", {
        loginheader: true,
        header: true,
        loginStatus: true,
        username,
      });
    } else {
      res.render("user/login");
    }
    console.log("User Logged In!");
    console.log(req.session.user);
  },

  postLogin: (req, res) => {
    console.log(req.body, "reeeeeeeeeeeeeee");
    userhelpers.dologin(req.body).then((response) => {
      const [user, status, errorMessage] = response;

      if (status) {
        req.session.user = user;
        req.session.userIn = true;
        const blockedStatus = false;
        const loginStatus = req.session.userIn;
        let username = req.session.user.username;
        let header = true;
        res.redirect("/");
      } else {
        const blockedStatus = errorMessage === "Your account has been blocked";
        const loginStatus = req.session.userIn;

        res.render("user/login", { loginStatus, blockedStatus, login: false });
      }
    });
  },

  shopView: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const searchQuery = req.query.search || "";
      const sortCriteria = req.query.sort;
      const filters = req.query.filters;
      let products = [];
      let cat = [];

      if (req.session.userIn) {
        const user = req.session.user?._id;
        const proCount = await userhelpers.getCartCount(user);

        products = await userhelpers.listProductShop(
          page,
          searchQuery,
          sortCriteria,
          filters
        );
        cat = await adminhelpers.findAllcategories();
        for (let i = 0; i < products.length; i++) {
          let product = products[i];
          if (product.offer && product.offer.offerType === "product") {
            let startDate = new Date(product.offer.startDate);
            let endDate = new Date(product.offer.endDate);
            let currentDate = new Date();

            if (currentDate >= startDate && currentDate <= endDate) {
              let discount = (product.offer.offerValue / 100) * product.Price;
              product.discountedPrice = product.Price - discount;
              product.hasDiscount = true;
            } else {
              product.hasDiscount = false;
            }
          }
        }
        res.render("user/shop", {
          products,
          cat: cat,
          loginheader: true,
          header: true,
          username: req.session.user.username,
          proCount,
          currentPage: page,
          totalPages: products.totalPages, // Set the total pages based on the actual total count of filtered products
          searchQuery,
          sortCriteria,
          filters,
        });
      } else {
        products = await userhelpers.listProductShop(
          page,
          searchQuery,
          sortCriteria,
          filters
        );
        console.log("products", products);
        cat = await adminhelpers.findAllcategories();
        for (let i = 0; i < products.length; i++) {
          let product = products[i];
          if (product.offer && product.offer.offerType === "product") {
            let startDate = new Date(product.offer.startDate);
            let endDate = new Date(product.offer.endDate);
            let currentDate = new Date();

            if (currentDate >= startDate && currentDate <= endDate) {
              let discount = (product.offer.offerValue / 100) * product.Price;
              product.discountedPrice = product.Price - discount;
              product.hasDiscount = true;
            } else {
              product.hasDiscount = false;
            }
            await userhelpers.updateField(product._id, product.discountedPrice);
          }
        }
        res.render("user/shop", {
          products,
          cat: cat,
          loginheader: false,
          header: true,
          currentPage: page,
          totalPages: products.totalPages, // Set the total pages based on the actual total count of filtered products
          searchQuery,
          sortCriteria,
          filters,
        });
      }
    } catch (err) {
      console.log(err);
      // Handle the error appropriately
    }
  },

  category: async (req, res) => {
    let username
    if (req.session.user) {
      username = req.session.user.username
       let cat = [];
       cat = await adminhelpers.findAllcategories();
       const products = await userhelpers.categoryMatch(req.params.id);
       console.log(products, "cat");
       res.render("user/cat-shop", {
         products,
         cat,
         header: true,
         loginheader:true,username
       });
    }
    else {
       let cat = [];
       cat = await adminhelpers.findAllcategories();
       const products = await userhelpers.categoryMatch(req.params.id);
       console.log(products, "cat");
       res.render("user/cat-shop", {
         products,
         cat,
         header: true,
         loginheader: false
       });
    }
   
  },

  //list and unslist
  getProductList: (req, res) => {
    userhelpers
      .productList()
      .then((product) => {
        // filter out unlisted products
        const filteredProductList = productList.filter(
          (product) => !product.unlist
        );
        res.render("user/shop", { productList: filteredProductList });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  showSignup: (req, res) => {
    res.render("user/signup", { emailStatus: true });
  },

  postSignup: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {
      console.log(response);
      var emailStatus = response.status;
      if (emailStatus) {
        res.redirect("/login");
      } else {
        res.render("user/signup", { emailStatus });
      }
    });
  },

  userlogout: (req, res) => {
    (loginheader = false), (header = true), (loginStatus = false);
    req.session.user.username = false;
    req.session.userIn = false;
    req.session.user = false;

    res.redirect("/");
  },
  showotp: (req, res) => {
    res.render("user/otplogin");
  },
  postotp: (req, res) => {
    userhelpers.otpverification(req.body).then((response) => {
      if (response.blocked) {
        loginStatus = false;
        res.redirect("/otplogin");
      } else {
        req.session.userIn = true;
        loginStatus = true;
        res.redirect("/");
      }
    });
  },
  zoomshopView:async (req, res) => {
    let cat=[]
    if (req.session.user) {
      let user = req.session.user._id;
      let username = req.session.user.username;
       cat = await adminhelpers.findAllcategories()
      userhelpers.getCartCount(user).then((proCount) => {
        userhelpers.zoomlistProductShop(req.params.id).then((response) => {
          console.log(response, "zooooooom");
          res.render("user/imagezoom", {
            response,
            proCount,
            loginheader: true,
            header: true,
            username,
            cat
          });
        });
      });
    } else {
      let cat = [];
      cat = await adminhelpers.findAllcategories();
      userhelpers.zoomlistProductShop(req.params.id).then((response) => {
        console.log(response, "zooooooom");
        res.render("user/imagezoom", {
          response,
          loginheader: false,
          header: true,
          cat
        });
      });
    }
  },

  //productid and userid is present in the
  // mongodb database so to take that we use userhelpers
  addTocart: (req, res) => {
    console.log("api called");
    let user = req.session.user._id;
    //user is given as an array so to take single user and objects are pushed into that single array thats y user[0]
    const productId = req.params.id;
    console.log(user);
    console.log(productId);
    console.log("addTocart");

    userhelpers.getCartCount(user).then((proCount) => {
      userhelpers.addCart(user, productId).then((response) => {
        console.log("product count:", proCount);
        if (response.status) {
          // res.redirect('/shop')//redirect to shop-cart after creating a shop-cart page
          res.json({ status: true, proCount: proCount });
        } else {
          res.json({ status: false, proCount: proCount });
        }
      });
    });
  },
  userCart: async (req, res) => {
    let user, username;
    let cat = [];
    if (req.session.user) {
      user = req.session.user._id;
      username = req.session.user.username;
      console.log("user session details :", user);
    }

    userhelpers.getCartProducts(user).then(async (response) => {
      console.log("aggregation response : ", response);
      // console.log(response[0].proDetails, "prrrrrrrrrrrrrrrroooo");
      console.log("you caaaan doi it");
      cat = await adminhelpers.findAllcategories();
      console.log(cat, "caaaaaaaaaaaaaaaaaaaaaaatttttttt");
      let cartTotal = await userhelpers.getTotalAmount(user);
      await userhelpers.getCartCount(user, req.params.id).then((proCount) => {
        if (proCount) {
          res.render("user/cart", {
            productExist: true,
            response,
            proCount,
            cat: cat,
            cartTotal,
            loginheader: true,
            header: true,
            username,
          });
        } else {
          console.log(proCount, "procount:");
          res.render("user/cart", {
            productExist: false,
            loginheader: true,
            header: true,
            username,
            cat,
          });
        }
      });
    });
  },

  // cartCounts:(req,res)=>{
  //   let user=req.session.user._id
  //   console.log(user,"user in cartcount");
  //   userhelpers.getCartCount(user).then((cartCount)=>{
  //     console.log("cartcouint",cartCount)
  //     res.render('user/cart',{cartCount})

  //   })

  //   },

  // changeQuantity: async (req, res) => {
  //   if (req.session.user) {
  //     userId = req.session.user._id;
  //   }

  //   let count = parseInt(req.body.count);
  //   let qty = parseInt(req.body.quantity);
  //   console.log("count+qty", count + qty);
  //   if (count + qty != 0) {
  //     let response = await userhelpers.change_Quantity(req.body);
  //     if (response.removeProduct == true) {
  //       let removeResponse = true;

  //       res.json({ removeResponse });
  //     } else {
  //       let removeResponse = false;
  //       res.json({ removeResponse });
  //     }
  //   }
  // },
  changeQuantity: (req, res) => {
    console.log(req.body);
    userhelpers.changeProductQuantity(req.body).then(async (response) => {
      console.log(response);
      res.json(response);
    });
  },

  deleteCartProduct: (req, res) => {
    // console.log("deletttttttttttteeeeeeeee");
    userhelpers
      .removeitem(req.params.id, req.session.user._id)
      .then((response) => {
        res.redirect("/cart");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/cart");
      });
  },

  //USER PROFILE MANAGEMENT
  profilePage: async (req, res) => {
    let cat = [];
    let username
    if (req.session.user) {
      username = req.session.user.username
      cat = await adminhelpers.findAllcategories();

      res.render("user/user-dashpro", {
        loginheader: true,
        header: true,
        cat,username,
        isUserProfile: true,
        activeLink: "user-dash",
      });
    }
  },
  profileOrderPage: async (req, res) => {
    let userId;
    let cat = [];
    let username;
    if (req.session.user) {
      userId = req.session.user._id;
        username = req.session.user.username;
    }
    cat = await adminhelpers.findAllcategories();
    userhelpers.getOrderpage(userId).then((response) => {
      console.log("response in orderpage", response);
      const { order, orders, hashedId } = response;
      res.render("user/order-pageProfile", {
        loginheader: true,
        header: true,
        order,
        cat,
        orders,
        hashedId,
        username
      });
    });
  },
  userProfileDash: async (req, res) => {
    let cat = [];
    let username;
     if (req.session.user) {
       username = req.session.user.username;
     }
    
    cat = await adminhelpers.findAllcategories();
    res.render("user/user-dashpro1", { cat, header: true,loginheader:true,username });
  },

  walletDetails: async (req, res) => {
    try {
      let user;
      let username;
      let cat = [];
      if (req.session.user) {
        user = req.session.user._id;
         
         username = req.session.user.username;
         
      }
      cat = await adminhelpers.findAllcategories();
      userhelpers.balanceWallet(user).then((balance) => {
        // console.log(balance,"balamnce in waaaaaleettt");
        userhelpers.walletHistoty(user).then((history) => {
          console.log("historyy", history);
          res.render("user/wallet", { balance, history, cat, header: true ,loginheader:true,username});
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getProfileAddress:async (req, res) => {
    try {
      let cat = [];
      let user = req.session.user._id;
      let username;
      if (req.session.user) {
        user = req.session.user._id;

        username = req.session.user.username;
      }
       cat = await adminhelpers.findAllcategories()
      userhelpers.getProfileAddress(user).then((address) => {
        res.render("user/pro-address", {
          address,
          cat,
          loginheader: true,
          header: true,
          username
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  goToAddaddressPage:async (req, res) => {
    try {
      let cat = [];
     let username
      if (req.session.user) {
        user = req.session.user._id;

        username = req.session.user.username;
      }
        cat = await adminhelpers.findAllcategories();
      res.render("user/pro-add-address",{header:true,cat,loginheader:true,username});
    } catch (error) {
      console.log(error);
    }
  },

  postuserProfileAddress: async(req, res) => {
   
    try {
      let user; 
      let username
       if (req.session.user) {
         user = req.session.user._id;

         username = req.session.user.username;
       }
      
      console.log(user, "userprofile");
      console.log(req.body, "requestbody");
      userhelpers.postProfileAddress(req.body, user).then((address) => {
        console.log(address, "Data");
        res.redirect("/address");
      });
    } catch (error) {
      console.log(error);
    }
  },
  getEditAddress: async(req, res) => {
    console.log("lllllllllllllllllllllllll");
    let user
    let username;
    let cat=[]
    if (req.session.user) {
      user = req.session.user._id;

      username = req.session.user.username;
    }
     cat = await adminhelpers.findAllcategories()
    userhelpers.editUserAddress(req.params.id).then((address) => {
      res.render("user/pro-address-edit", {
        loginheader: true,
        username,
        header: true,
        address,
        cat
      });
    });
  },
  postEditaddress: (req, res) => {
    console.log("inside postEdIT");
    let user = req.session.user._id;

    userhelpers.postEdituseraddr(req.params.id, req.body, user).then(() => {
      res.redirect("/address");
    });
  },
  deleteAddress: (req, res) => {
    console.log("inside delete cart");
    let addressId = req.params.id;
    userhelpers.deleteUseraddress(addressId).then((response) => {
      res.json({ success: true });
    });
  },
  accountDetailsPage:async (req, res) => {
    try {
      let cat = [];
      let user;
      let username
      if (req.session.user) {
        user = req.session.user._id;
        username= req.session.user.username
      }
       cat = await adminhelpers.findAllcategories()
      userhelpers.getUserdetails(user).then((userDetails) => {
        res.render("user/account-details", { userDetails,header:true,loginheader:true ,username,cat});
      });
    } catch (error) {
      console.log(error);
    }
  },

  accountDetails: async (req, res) => {
    try {
      console.log(req.body, "reequest body in account details");
      let userId;
      if (req.session.user) {
        userId = req.session.user._id;
      }
      if (req.body.newPassword === req.body.confirmPassword) {
        const updatedUser = await userhelpers.accountDetail(userId, req.body);
        if (updatedUser) {
          req.session.user.Password = req.body.newPassword;
          loginheader = false;
          loginStatus = false;
          req.session.user.username = false;
          req.session.userIn = false;
          req.session.user = false;

          res.redirect("/login");
        } else {
          res.status(400).send("Failed to update password");
        }
      } else {
        res.status(400).send("New password and confirm password do not match");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  },
  //ORDER MANAGEMENT
  placeOrder: async (req, res) => {
    let user;
    if (req.session.user) {
      user = req.session.user._id;
    }
    let usern = "";
    if (req.session.user) {
      usern = req.session.user;
    }
    console.log(usern, "user details in place-order");
    console.log(usern._id, "userid in placeorder");
    let products = await userhelpers.getCartProducts(user);
    // console.log("aggregation response : ",products);
    // console.log(cartitems[0].proDetails);
    console.log("you caaaan doi it");
    let total;
    if (products.length > 0) {
      total = await userhelpers.getTotalAmount(user);
    }
    // let cartCount = null
    let count;
    if (user) {
      count = await userhelpers.getCartCount(user);
    }
    userhelpers.getProfileAddress(user).then((address) => {
      res.render("user/place-order", {
        products,
        total,
        count,
        address,
        usern,
        user,
        loginheader: true,
        
      });
      // console.log("helloooo",products,total,count,address,user);
    });

    // console.log(cartCount,"cartcount:");
    // console.log(cartTotal,"cartTotal");
  },

  addAddress: (req, res) => {
    try {
      res.render("user/place-addaddress");
    } catch (error) {
      console.log(error);
    }
  },
  placeAddress: (req, res) => {
    try {
      let user = req.session.user._id;
      console.log(user, "userprofile");
      console.log(req.body, "requestbody");
      userhelpers.postProfileAddress(req.body, user).then((address) => {
        console.log(address, "Data");
        res.redirect("/place-order");
      });
    } catch (error) {
      console.log(error);
    }
  },

  postPlaceorder: async (req, res) => {
    try {
      let user = req.session.user._id;
      console.log(req.body, "request body");
      //requestinte koode products and total cartil ninn ponm
      let products = await userhelpers.cartOrder(user);
      console.log(products, "ffffffff");
      console.log("***********");
      // let total = await userhelpers.getTotalAmount(user);
      let total = req.session.newTotal
        ? req.session.newTotal
        : await userhelpers.getTotalAmount(user);

      console.log(
        "555555555555555555555555555555555555555555555555555",
        req.body
      );

      userhelpers
        .postPlaceOrders(req.body, products, total, user)
        .then((response) => {
          let orderId = response._id;
          console.log("orderid", orderId);
          console.log("cod orderId", orderId);
          if (req.body.paymentMethod === "COD") {
            console.log("ggggggggggggggg");
            res.json({ codSuccess: true });
          } else if (req.body.paymentMethod === "ONLINE") {
            console.log(
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh"
            );
            userhelpers
              .generateRazorpay(orderId, total)
              .then((onlineResponse) => {
                console.log(
                  "resssssssssponse.................>",
                  onlineResponse
                );

                res.json(onlineResponse);
              });
          }
        });
    } catch (error) {
      console.log(error);
    }

    //all datas are stored in the database we need another function to take data from database to frontend+++++++
  },
  orderSuccess: (req, res) => {
    res.render("user/order-success", { loginheader: true });
  },

  //here in order page we need to take the data grpm db to front page
  getOrderlist:async (req, res) => {
    let cat=[]
    let userId;
    if (req.session.user) {
      userId = req.session.user._id;
    }
     cat = await adminhelpers.findAllcategories();
    userhelpers.getOrderpage(userId).then((response) => {
      console.log("response in orderpage", response);
      const { order, orders, hashedId } = response;
      res.render("user/order-page", {
        loginheader: true,
        header: true,
        order,
        orders,
        hashedId,
        cat
      });
    });
  },

  viewOrders:async(req, res) => {
    console.log("haaaaaaaaaaaaiiiiiiii");
    let user, username;
    let cat=[]
    if (req.session.user) {
      user = req.session.user._id;
      username = req.session.user.username;
    }
     cat = await adminhelpers.findAllcategories()
    userhelpers.getViewproducts(req.params.id).then(async (response) => {
      console.log("response in ordervoiew", response);

      const { orderDetail, orderDetails, hashedId } = response;

      userhelpers.getAddress(req.params.id).then(async (response) => {
        
        console.log("orderaddress", response[0].ordAddrs);
        res.render("user/view-order", {
          response,
          loginheader: true,
          header: true,
          username,
          orderDetail,
          orderDetails,
          hashedId,
          cat
        });
        console.log("response in orderpage........", response);
      });
    });
  },

  cancelOrder: (req, res) => {
    console.log("deleteeeee");
    userhelpers.Status(req.params.id).then(() => {
      userhelpers
        .getViewproducts(req.params.id)
        .then((orderDetails) => {
          console.log("oooooooorrrrdddeeeerdetails", orderDetails);
          const userId = orderDetails.userid;
          const total = orderDetails.total;
          const payment = orderDetails.paymentMethod;
          if (payment === "ONLINE") {
            userhelpers.addWallet(userId, total).then((response) => {
              console.log(response, "addWAllleeeeeet");
              res.redirect("/order-page");
            });
          } else {
            res.redirect("/order-page");
          }
        })
        .catch((error) => {
          console.error(`the operation failed with error`);
        });
    });

    // userhelpers
    //   .orderCancellation(req.params.id)
    //   .then((response) => {
    //      console.log("cancel orderrrrrrrrrrrrr", req.params.id);
    //     res.redirect("/order-page");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     res.redirect("/error");
    //   });
  },
  deleteCartOrder: (req, res) => {
    console.log("inssssssssoisdeeedeletecart");
    try {
      let user;
      if (req.session.user) {
        user = req.session.user._id;
      }
      userhelpers.deleteCart(user).then((response) => {
        console.log(response, "rrrrrrreeeeeeeeeeeeessssssssspoooooooonnnnnnse");

        res.status(200).json({ success: true });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  codStatus: (req, res) => {
    try {
      let user;
      if (req.session.user) {
        user = req.session.user._id;
      }
      console.log("reqqqqqqqqqqq", req.body);
      userhelpers.statusChange(order, user).then();
    } catch (error) {}
  },

  editAddress: (req, res) => {
    let user;
    if (req.session.user) {
      user = req.session.user._id;
      console.log("aaaaaaaaa");
    }
    userhelpers.editUserAddress(req.params.id).then((response) => {
      resolve(resolve);
      res.render("user/place-order", { response });
    });
  },

  //verify razorpay payment
  verifyPayment: (req, res) => {
    console.log(req.body);
    userhelpers
      .verifyPayment(req.body)
      .then((response) => {
        userhelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          console.log("Payment Successfull");
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" });
      });
  },
  getApplyCoupon: async (req, res) => {
    try {
      const couponCode = req.body.code;
      const total = req.body.total;
      const user = req.session.user._id;
      console.log(user, "uuuuuuuuuuusssssser");

      // const coupon = await userHelper.getCouponByCode(couponCode);
      console.log("inside apply coupon", total);

      console.log("inside apply coupon", couponCode);
      const coupon = await userhelpers.couponMatch(couponCode, user);
      console.log(coupon, "ccccoupioj");

      const currentDate = new Date();
      if (
        coupon &&
        coupon.isActive &&
        total >= coupon.minimumAmount &&
        total <= coupon.maximumDiscount &&
        currentDate >= coupon.startDate &&
        currentDate <= coupon.endDate
      ) {
        const discount = coupon.discountAmount;

        const newTotal = total - discount;

        userhelpers.usedCoupons(user, couponCode, currentDate);

        req.session.newTotal = newTotal; // store the newTotal in the session

        res.json({ success: true, newTotal, discount });
      } else {
        res.json({ success: false, message: "Invalid coupon code" });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Coupon already used" });
    }
  },
};
