const adminHelper = require('../helpers/adminHelpers')
const userHelpers = require('../helpers/userHelpers')
const db =require('../model/connection')
const multer = require('multer')
const ObjectId = require("mongoose").Types.ObjectId;


const adminCredential={
    name:'superAdmin',
    email:'admin@gmail.com',
    password:'admin123'
   }
   let adminStatus

module.exports = {
  showDashboard: (req, res) => {
    try {
      let check = req.session.adminIn;
      let adminStatus = true;
      adminHelper
        .totalRevenue()
        .then((revenue) => {
          adminHelper.orderCount().then((ordersCount) => {
            adminHelper.productCount().then((productCount) => {
              adminHelper.categoryCount().then((categoryCount) => {
                adminHelper.monthlyRevenue().then((monthly) => {
                  adminHelper.showChart().then((chart) => {
                    console.log(chart, "chaaaaaaaaaaart");
                    let newArry = chart.map((chart) => chart.totalnum);
                    console.log(newArry, "new array isss");

                    if (adminStatus) {
                      res.render("admin/admin-dash", {
                        layout: "adminLayout",
                        check,
                        revenue,
                        adminStatus,
                        ordersCount,
                        productCount,
                        categoryCount,
                        monthly,
                        newArry,
                      });
                    } else {
                      res.redirect("/admin/login");
                    }
                  });
                });
              });
            });
          });
        })
        .catch((error) => {
          res.redirect("admin/admin-dash");
        });
    } catch (error) {
      console.log(error);
    }
  },

  getAdminLogin: (req, res) => {
    if (req.session.adminIn) {
      res.redirect("/admin?adminStatus=" + adminStatus);
    } else {
      res.render("admin/login", { layout: "adminLayout", adminStatus });
    }
  },

  postAdminLogin: (req, res) => {
    if (
      req.body.email == adminCredential.email &&
      req.body.password == adminCredential.password
    ) {
      req.session.admin = adminCredential;
      req.session.adminIn = true;

      adminStatus = req.session.adminIn;

      res.redirect("/admin");
    } else {
      adminloginErr = true;

      res.redirect("/admin/login");
    }
  },

  adminLogout: (req, res) => {
    req.session.admin = false;
    adminStatus = false;
    req.session.adminIn = false;
    res.redirect("/admin");
    //  res.render('admin/login',{ layout: "adminLayout", adminStatus})
  },

  getUserlist: (req, res) => {
    adminHelper.listUsers().then((user) => {
      res.render("admin/view-users", {
        layout: "adminLayout",
        user,
        adminStatus,
      });
    });
  },

  addProducts: (req, res) => {
    adminHelper.findAllcategories().then((availCategory) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        adminStatus,
        availCategory,
      });
    });
  },

  postProducts: (req, res) => {
    console.log("bodyyyyyy", req.body);

    let images = req.files.map((a) => a.filename);

    adminHelper.postAddProduct(req.body, images).then((response) => {
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
      console.log(response);
      res.redirect("/admin/view-product");
    });
  },

  viewProducts: (req, res) => {
    adminHelper.getViewProducts().then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",
        response,
        adminStatus,
      });
    });
  },

  getCategory: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      let viewCategory = response;
      console.log(viewCategory);
      console.log("dilsha");
      res.render("admin/add-category", {
        layout: "adminLayout",
        viewCategory,
        adminStatus,
      });
    });
  },

  postCategory: (req, res) => {
    adminHelper
      .addCategory(req.body)
      .then((response) => {
        res.redirect("/admin/add-category");
      })
      .catch((error) => {
        res.redirect("/admin/add-category"); // render the error message
      });
  },
  listCategory: (req, res) => {
    console.log("list category");
    adminHelper.listCat(req.params.id).then((response) => {
      res.redirect("/admin/add-category");
    });
  },
  unlistCategory: (req, res) => {
    console.log("unlilst category");
    console.log(req.params.id);
    adminHelper
      .unlistCat(req.params.id)
      .then((response) => {
        console.log(response, "resssssss");
        res.redirect("/admin/add-category");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  // deleteCategory: (req, res) => {
  //   adminHelper.delCategory(req.params.id).then((response) => {
  //     res.redirect("/admin/add-category");
  //   });
  // },
  // editCategory: (req, res) => {
  //   catId = req.params.id;
  //   console.log("catId", catId);
  //   adminHelper.edCategory(catId).then((response) => {
  //     console.log("category id in edit", req.session.params.id);
  //     let editCat = response;
  //     console.log(editCat);
  //     res.render("admin/edit-category", {
  //       layout: "adminLayout",
  //       editCat,
  //       adminStatus,
  //     });
  //     //print the details of the category we edited in the console
  //   });
  // },
  // postEdCtegory: (req, res) => {
  //   try {
  //     console.log("hhhhheeeeeelooooooooooooooooooooo");
  //     adminHelper.postEditCategory(req.params.id, req.body).then((response) => {
  //       res.render("admin/add-category", {
  //         layout: "adminLayout",
  //         viewCategory,
  //         adminStatus,
  //         response,
  //       });
  //       // console.log("categoryid",req.params.id)
  //       // console.log("req.body",req.body);
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }

  // },
  updateCategory: (req, res) => {
    adminHelper.addCategory().then((response) => {
      console.log(procategory);
      res.render("admin/add-category", {
        layout: "adminLayout",
        viewCategory,
        adminStatus,
      });
    });
  },

  //edit product

  editProduct: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      var procategory = response;
      adminHelper.editProduct(req.params.id).then((response) => {
        editproduct = response;

        console.log(editproduct);
        console.log(procategory);
        res.render("admin/edit-viewproduct", {
          layout: "adminLayout",
          editproduct,
          procategory,
          adminStatus,
        });
      });
    });
  },

  // //posteditaddproduct

  // post_EditProduct: (req, res) => {
  //   console.log(req.body);
  //   console.log(req.files, "files........");
  //   let id = req.params.id;
  //   console.log(req.body);

  //   adminHelper
  //     .postEditProduct(req.params.id, req.body, images)
  //     .then((response) => {
  //       console.log(response);
  //       res.redirect("/admin/view-product");
  //     });
  // },
  post_EditProduct: (req, res) => {
    console.log(req.body);
    console.log(req.file);

    adminHelper
      .postEditProduct(req.params.id, req.body, req?.file?.filename)
      .then((response) => {
        console.log(response);
        res.redirect("/admin/view-product");
      });
  },
  //unlist products
  listProducts: (req, res) => {
    adminHelper
      .list(req.params.id)
      .then((response) => {
        res.redirect("/admin/view-product");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  unlistProducts: (req, res) => {
    adminHelper
      .unList(req.params.id)
      .then((response) => {
        res.redirect("/admin/view-product");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  // deleteTheProduct: (req, res) => {
  //   adminHelper.deleteProduct(req.params.id).then((response) => {
  //     res.redirect("/admin/view-product");
  //   });
  // },

  // block user

  blockTheUser: (req, res) => {
    adminHelper.blockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  unblockTheUser: (req, res) => {
    adminHelper.UnblockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  viewOrders: (req, res) => {
    adminHelper.viewAllorders().then((response) => {
      console.log(response, "response in admin side");
      res.render("admin/vieworders", {
        layout: "adminLayout",
        response,
        adminStatus,
      });
    });
  },
  getorderDetails: (req, res) => {
    let products = userHelpers.getViewproducts(req.params.id);
    console.log("products......", products);
    console.log("products.product");
    userHelpers.getAddress(req.params.id).then(async (response) => {
      // console.log(response?.[0].products[0],"pppppppp");
      res.render("admin/order-details", {
        response,
        layout: "adminLayout",
        adminStatus,
      });
      console.log("response in orderpage........", response[0]);
    });
  },

  postOrderDetails: (req, res) => {
    adminHelper
      .updateStatus(req.params.id, req.body)
      .then(() => {
        res.redirect("/admin/vieworders");
      })
      .catch((error) => {
        console.error(`the operation failed with error`);
      });
  },

  //coupon management
  getCouponPage: (req, res) => {
    try {
      res.render("admin/coupon-page", { layout: "adminLayout", adminStatus });
    } catch (error) {}
  },

  postCouponPage: (req, res) => {
    try {
      console.log(req.body, "coupon");

      // check if the required fields are present in the request body

      adminHelper.addCoupon(req.body).then((response) => {
        console.log("resssssssssssssssponse", response);
        res.redirect("/admin/coupon-view");
        //   response,
        //   layout: "adminLayout",
        //   adminStatus,
        // });
      });
    } catch (error) {
      console.log(error);
      res.redirect("back");
    }
  },
  getCouponView: (req, res) => {
    try {
      adminHelper.listAllCoupons().then((response) => {
        res.render("admin/coupon-view", {
          response,
          layout: "adminLayout",
          adminStatus,
        });
      });
    } catch (error) {
      console.log(error);
    }
  },

  //sales

  getSales: async (req, res) => {
    try {
      const sales = await adminHelper.getAllSales();

      console.log(sales, "sayooj sreedhar");
      adminIn = req.session.loggedIn;
      res
        .render("admin/sales", {
          layout: "adminLayout",
          adminStatus,
          adminIn: true,
          sales,
        })
        .catch((error) => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    } catch (error) {}
  },
  postSalesFilter: (req, res) => {
    console.log("inside post");
    console.log("Date details", req.body);
    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);
    let sales = adminHelper
      .getAllSalesInDateRange(date1, date2)
      .then((sales) => {
        adminIn = req.session.loggedIn;
        res.render("admin/sales", {
          layout: "adminLayout",
          adminStatus,
          admin: true,
          adminIn: true,
          sales,
        });
      })
      .catch((error) => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  getAddoffer: async (req, res) => {
    try {
      const products = await adminHelper.getViewProducts();
      const categories = await adminHelper.findAllcategories();
      console.log(categories, "categoreis");
      res.render("admin/add-offer", {
        products,
        categories,
        layout: "adminLayout",
        adminStatus,
      });
    } catch (error) {
      console.log(error);
    }
  },
  postAddoffer: (req, res) => {
      try {
        // const { offerType, offerValue, offerCode, product, category } = req.body;
        console.log(req.body, "reqqqqqqqqqqq");
        let proId = req.body.product
        console.log(proId);
        adminHelper.postAddOffers(req.body).then((response) => {
          console.log("response._id", response._id);
          adminHelper.updateProOffer(proId, response._id).then((response) => {
            res.redirect("/admin/offer-list")
          })
          
        })

        // res.status(200).send("Offer added successfully");
      } catch (error) {
        console.log(error);
      }
    
  },
  getOfferList:async (req, res) => {
    try {
      console.log("jaaaaaaaaaaaaiiiiiii");
      const products = await adminHelper.getProductOffer()
      const categories = await adminHelper.getCategoryOffer()
      console.log(products, "product");
      console.log(categories, "categoryy ");
      res.render("admin/offer-list", {
        products,
        categories,
        layout: "adminLayout",
        adminStatus
      });
    } catch (error) {
      console.log(error);
    }
  }

};


    
