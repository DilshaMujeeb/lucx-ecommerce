const bcrypt = require("bcrypt");
const { response } = require("../app");
const { user, cart } = require("../model/connection");
const db = require("../model/connection");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const Razorpay = require('razorpay');
const { resolve } = require("path");
const crypto = require("crypto");
const swal = require("sweetalert");

var instance = new Razorpay({ key_id: 'rzp_test_JVphB4kr5MLSJN', key_secret: '8jnXasIIogpC24le3C5Sp6in' })

module.exports = {
  doSignUp: (userData) => {
    //console.log(db);
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        email = userData.email;
        existingUser = await db.user.findOne({ email: email });
        if (existingUser) {
          response = { status: false };
          return resolve(response);
        } else {
          var hashPassword = await bcrypt.hash(userData.password, 10);
          const data = {
            username: userData.username,
            Password: hashPassword,
            email: userData.email,
            phoneNumber: userData.phonenumber,
          };
          console.log(data);
          await db.user.create(data).then((data) => {
            resolve({ data, status: true });
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await db.user.findOne({ email: userData.email });

        if (user) {
          const status = await bcrypt.compare(userData.password, user.Password);
          if (status) {
            if (!user.blocked) {
              resolve([user, true, null]);
            } else {
              resolve([null, false, "Your account has been blocked"]);
            }
          } else {
            resolve([null, false, "Invalid credentials"]);
          }
        } else {
          resolve([null, false, "Invalid credentials"]);
        }
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  listProductShop: async (page, searchQuery, filters, categoryId) => {
    console.log("ddddddddddiiiiiiiii",categoryId);
    try {
      const pageSize = 10; // Number of products to display per page
      const skip = (page - 1) * pageSize; // Calculate the number of products to skip based on the current page
      const query = { unlist: false };

      // Apply search query
      if (searchQuery) {
        query.$or = [
          { Productname: { $regex: searchQuery, $options: "i" } },
          { ProductDescription: { $regex: searchQuery, $options: "i" } },
        ];
      }

      // Apply filters
      // if (filters && filters.category) {
      //   query.category = filters.category;
      // }
      
      // if (categoryId) {
      //   console.log("category");
      //   const category = await db.products.find({ category: categoryId });
       
        
      // }
      const totalCount = await db.products.countDocuments(query);
      const totalPages = Math.ceil(totalCount / pageSize);

      const productList = await db.products
        .find(query)
        .populate("offer")
        .skip(skip)
        .limit(pageSize);
        

      return {
        productList,
        totalPages,
      };
    } catch (err) {
      throw new Error(err);
    }
  },



  //list and unlist
  productList: async () => {
    try {
      const productList = await db.products.find({ unlist: false });
      return productList;
    } catch (err) {
      throw new Error(err);
    }
  },
  
  categoryMatch: async (catid) => {
    return new Promise(async (resolve, reject) => {
      try {
        const category = await db.category.findOne({ _id: catid })
        if (category) {
          const productList = await db.products.find({ category: category.CategoryName })
          resolve(productList);
        } else {
          res.render("error", {
            message: "Category not found",
          });
        }
      } catch (error) {
        console.log(error);
        
      }
    })
  },

  otpverification: (otpvariable) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({
          phoneNumber: otpvariable,
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  zoomlistProductShop: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  addCart: (userId, prodId) => {
    return new Promise(async (resolve, reject) => {
      let product = await db.products.findOne({ _id: prodId });
      if (product.Quantity > 0) {
        const proobj = {
          product: ObjectId(prodId),
          quantity: 1,
        };
        const obj = {
          userid: userId,
          products: proobj,
        };

        const usercart = await db.cart.find({ userid: userId });
        console.log("usercart", usercart);
        if (usercart.length < 1) {
          db.cart.create(obj);
        } else {
          let proExist = await db.cart.findOne({
            userid: userId,
            "products.product": ObjectId(prodId),
          });
          console.log(proExist + "PRO EXIST TTT TTT");
          if (proExist) {
            db.cart.findOneAndUpdate(
              { userid: userId, "products.product": ObjectId(prodId) },
              { $inc: { "products.$.quantity": 1 } },
              function (err) {
                if (err) {
                  console.log(err);
                }
              }
            );
          } else {
            db.cart.findOneAndUpdate(
              { userid: userId },
              { $push: { products: proobj } },
              function (err) {
                if (err) {
                  console.log(err);
                }
              }
            );
          }
        }

        db.products.findOneAndUpdate(
          { _id: prodId },
          { $inc: { Quantity: -1 } },
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        resolve({ status: true });
      } else {
        resolve({ status: false });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let cartItems = await db.cart.aggregate([
        { $match: { userid: ObjectId(userId) } },
        // match the cart for the given userId
        { $unwind: "$products" }, // unwind the products array

        //  {$project:{
        //     item:"$products.item",
        //     quantity:"$products.quantity"
        //  }
        //  },

        {
          $lookup: {
            // perform a lookup on the Product collection
            from: "products", // name of the Product collection
            localField: "products.product",
            foreignField: "_id",
            as: "proDetails",
          },
        },
        {
          $project: {
            proDetails: 1,
            "products.quantity": "$products.quantity",
            product: "$products.product",
            sample: {
              $arrayElemAt: ["$proDetails", 0],
            },
          },
        }, //in sample the prodetails array is converted so elements are in sample and we can access using sample.price
        //in prodetails array elements are stores as array
        {
          $project: {
            product: 1,
            proDetails: 1,
            "products.quantity": 1,
            price: "$sample.Price",
            discountedPrice: "$sample.discountedPrice",
            hasDiscount: "$sample.hasDiscount",
          },
        },
        {
          $project: {
            proDetails: 1,
            "products.quantity": 1,
            _id: 1,
            subtotal: {
              $multiply: [
                {
                  $toInt: "$products.quantity",
                },
                {
                  $cond: {
                    if: "$hasDiscount",
                    then: { $toInt: "$discountedPrice" },
                    else: { $toInt: "$price" },
                  },
                },
              ],
            },
          },
        },
      ]);
      console.log("cartItems after aggregation :", cartItems);
      resolve(cartItems);

      //proDetails are moving as the details are in proDetails. this proDetails are moving to ejs
    });
  },
  getCartCount: (user, Id) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cartAvail = await db.cart.findOne({ userid: user });
      if (cartAvail) {
        count = cartAvail.products.length;
      }

      resolve(count);
      console.log(count);
    });
  },
  // change_Quantity: (details) => {
  //   details.count = parseInt(details.count);
  //   details.quantity = parseInt(details.quantity);

  //   return new Promise((resolve, reject) => {
  //     if (details.count == -1 && details.quantity == 1) {
  //       db.cart
  //         .findOneAndUpdate(
  //           { _id: details.cart },
  //           {
  //             $pull: { products: { product: ObjectId(details.product) } },
  //           }
  //         )
  //         .then((response) => {
  //           resolve({ removeProduct: true });
  //         });
  //     } else {
  //       db.cart
  //         .findOneAndUpdate(
  //           {
  //             _id: details.cart,
  //             "products.product": ObjectId(details.product),
  //           },
  //           { $inc: { "products.$.quantity": details.count } }
  //         )
  //         .then((response) => {
  //           resolve({ removeProduct: false });
  //         });
  //     }
  //   });
  // },
  changeProductQuantity: (details) => {
    count = parseInt(details.count);
    quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {
        db.cart
          .updateOne(
            { _id: ObjectId(details.cart) },
            {
              $pull: { products: { item: ObjectId(details.product) } },
            }
          )
          .then((response) => {
            db.products.updateOne(
              { _id: ObjectId(details.product) },
              { $inc: { Quantity: count } }
            );
            resolve({ removeProduct: true });
          })
          .catch((error) => {
            console.log(error);
            resolve({ removeProduct: false });
          });
      } else {
        db.products
          .findOne({ _id: ObjectId(details.product) })
          .then((product) => {
            if (product.Quantity >= count) {
              db.cart
                .updateOne(
                  {
                    _id: ObjectId(details.cart),
                    "products.product": ObjectId(details.product),
                  },
                  {
                    $inc: { "products.$.quantity": count },
                  }
                )
                .then((response) => {
                  db.products
                    .updateOne(
                      { _id: ObjectId(details.product) },
                      { $inc: { Quantity: -count } }
                    )
                    .then(() => {
                      resolve({ status: true });
                    })
                    .catch((error) => {
                      console.log(error);
                      resolve({ status: false });
                    });
                });
            } else {
              resolve({ stock: "full" });
            }
          })
          .catch((error) => {
            console.log(error);
            resolve({ status: false });
          });
      }
    });
  },

  //         // Removing the item from cart when quantity is one and when - button is clicked
  //          cont is -1 aavunna casil aanu remove cheyyendath
  getTotalAmount: (userId) => {
    console.log("inside total getTotalamount");
    return new Promise(async (resolve, reject) => {
      try {
        let uId = ObjectId(userId);
        console.log(uId, "userid in gettotal amount");
        let total = await db.cart.aggregate([
          {
            $match: {
              userid: uId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          // {
          //   $project: {
          //     cart: "$products.product",
          //     quantity: "$products.quantity",
          //   },
          // },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": "$products.quantity",
              product: "$products.product",
              sample: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },

          {
            $project: {
              product: 1,
              proDetails: 1,
              "products.quantity": 1,
              price: "$sample.Price",
              discountedPrice: "$sample.discountedPrice",
              hasDiscount: "$sample.hasDiscount",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": 1,
              _id: 1,
              total: {
                $sum: [
                  {
                    $multiply: [
                      {
                        $toInt: "$products.quantity",
                      },
                      {
                        $cond: {
                          if: "$hasDiscount",
                          then: { $toInt: "$discountedPrice" },
                          else: { $toInt: "$price" },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: "$_id",
              total: { $sum: "$total" },
            },
          },
        ]);
        console.log(total, "total amount");
        resolve(total[0].total);
      } catch {
        resolve(null);
      }
    });
  },
  // {
  //   $group: {
  //     _id: null,
  //     totalRevenue: { $sum: { $multiply: [ "$price", "$quantity" ] } }

  getSubTotal: (userId) => {
    console.log("33333333333333333333333333333333333333333");
    return new Promise(async (resolve, reject) => {
      try {
        let uId = ObjectId(userId);
        console.log(uId, "555555555555555555555555");
        let subTotal = await db.cart.aggregate([
          {
            $match: {
              userid: uId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $project: {
              cart: "$products.product",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "cart",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              price: "$proDetails.Price",
              quantity: 1,
            },
          },
          {
            $project: {
              _id: 0,
              price: { $arrayElemAt: ["$price", 0] },
              quantity: 1,
            },
          },
          {
            $group: {
              _id: null,
              total: { $multiply: ["$quantity", "$price"] },
            },
          },

          // }
        ]);
        console.log(subTotal, "total amount");
        resolve(subTotal[0].subTotal);
      } catch {
        resolve(null);
      }
    });
  },

  removeitem: (productid, userid) => {
    return new Promise(async (resolve, reject) => {
      const cartProduct = await db.cart.findOne(
        {
          userid: userid,
          "products.product": ObjectId(productid),
        },
        { "products.$": 1 }
      );

      const removedQuantity = cartProduct.products[0].quantity;
      db.cart
        .updateOne(
          { userid: userid, "products.product": ObjectId(productid) },
          { $pull: { products: { product: ObjectId(productid) } } }
        )
        .then((response) => {
          db.products
            .findOneAndUpdate(
              { _id: ObjectId(productid) },
              { $inc: { Quantity: removedQuantity } }
            )
            .then(() => {
              resolve(response);
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        })
        .catch((error) => {
          console.log(error);
          reject(error);
          resolve(response);
        });
    });
  },
  //PROFILE MANAGEMENT
  getProfileAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.address
        .find({ owner: ObjectId(userId) })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  postProfileAddress: (details, userId) => {
    return new Promise((resolve, reject) => {
      const userAddress = new db.address({
        owner: userId,
        name: details.name,
        phone: details.phone,
        homeAddress1: details.billing_address,
        homeAddress2: details.billing_address2,
        city: details.city,
        state: details.state,
        zip: details.zipcode,
      });
      userAddress.save().then((data) => {
        resolve(data);
      });
    });
  },
  editUserAddress: (addressId) => {
    console.log(addressId, "req.params.id");
    return new Promise(async (resolve, reject) => {
      await db.address
        .findOne({ _id: ObjectId(addressId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  postEdituseraddr: (addId, data, userId) => {
    console.log(addId, data);
    return new Promise(async (resolve, reject) => {
      try {
        const details = await db.address.findOne({ _id: ObjectId(addId) });
        console.log(details, "------------");
        const response = await db.address.updateOne(
          { _id: addId }, // added check for owner
          {
            $set: {
              name: data.name,
              phone: data.phone,
              homeAddress1: data.billing_address,
              homeAddress2: data.billing_address2,
              city: data.city,
              state: data.state,
              zip: data.zipcode,
            },
          }
        );
        console.log(response);
        resolve();
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },
  deleteUseraddress: (Id) => {
    return new Promise(async (resolve, reject) => {
      await db.address.deleteOne({ _id: Id });

      console.log("User deleted successfully");
    });
  },
  accountDetail: async (userId, details) => {
    console.log("iiiiiiiiiiiiinnnnnnnnnssssssssssiiiiiiddddddeeeeee");
    return new Promise(async (resolve, reject) => {
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
          details.newPassword,
          saltRounds
        );
        const updatedUser = await db.user.updateOne(
          { _id: userId },
          { Password: hashedPassword }
        );
        resolve(updatedUser);
        return updatedUser.nModified === 1;
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  //place order management

  postPlaceOrders: async (data, products, total, userId) => {
    try {
      //   const prodId = products[0];
      const status = data.paymentMethod === "COD" ? "placed" : "pending";

      const userOrder = new db.order({
        _id: new ObjectId(),
        userid: new ObjectId(userId),
        name: data.Name,
        phone: data.phone,
        email: data.Email,
        address: data.address,
        total: total,
        paymentMethod: data.paymentMethod,
        products: products,
        status: status,
        date: new Date(),
      });

      const response = await userOrder.save();

      for (const { product, quantity } of products) {
        const productId = product._id;
        const productDoc = await db.products.findOne({ _id: productId });
        productDoc.currentStockLevel -= quantity;
        await productDoc.save();
      }

      console.log(response._id, "response in order");
      console.log(response);

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  deleteCart: (userId) => {
    console.log("yyyyessssssssssssss");
    return new Promise((resolve, reject) => {
      cart.findOneAndDelete({ userid: userId }, (error, deletedCart) => {
        if (error) {
          reject(error);
        } else {
          resolve(deletedCart);
        }
      });
    });
  },

  statusChange: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.order.updateOne(
          { userid: ObjectId(userId) },
          { $set: { status: "pending" } }
        );
      } catch (error) {}
    });
  },

  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      const Razorpay = require("razorpay");
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("order razorpay::", order);
          resolve(order);
        }
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "8jnXasIIogpC24le3C5Sp6in");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.order
        .updateOne({ _id: ObjectId(orderId) }, { $set: { status: "placed" } })
        .then(() => {
          resolve();
        });
    });
  },

  //get products for orders
  cartOrder: async (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        const cartItems = await db.cart.aggregate([
          { $match: { userid: ObjectId(userId) } },
          { $unwind: "$products" },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "products.product",
            },
          },
          { $unwind: "$products.product" },
          {
            $group: {
              _id: "$_id",
              userid: { $first: "$userid" },
              products: { $push: "$products" },
            },
          },
          {
            $project: {
              _id: 0,
              userid: 1,
              products: {
                product: {
                  _id: 1,
                  Productname: 1,
                  ProductDescription: 1,
                  Image: 1,
                  Price: 1,

                  // include any other fields you want from the product collection
                },
                quantity: 1,
              },
            },
          },
        ]);
        console.log(cartItems);
        // console.log(cartItems[0].products)
        resolve(cartItems[0]?.products);
      });
    } catch (error) {
      console.log(error);
    }
  },
  // getOrderpage: (userId) => {
  //   return new Promise(async (resolve, reject) => {
  //     let orders = await db.order
  //       .find({
  //         $and: [{ userid: ObjectId(userId) }, { status: { $ne: "pending" } }],
  //       })
  //       .sort({ date: -1 });
  //     // console.log(orders, "resssponse on orderlist");

  //     resolve(orders);
  //   });
  // },
  getOrderpage: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.order
        .find({
          $and: [{ userid: ObjectId(userId) }, { status: { $ne: "pending" } }],
        })
        .sort({ date: -1 });
      // console.log(orders, "resssponse on orderlist");

      orders = orders.map((order) => {
        const idString = String(order._id);
        const hash = crypto.createHash("sha256").update(idString).digest("hex");
        const hashedId = hash.slice(0, 6);
        return { ...order.toObject(), hashedId };
      });

      const order = orders[0];
      const hashedId = order ? order.hashedId : "";
      resolve({ order, orders, hashedId });
    });
  },
  getUserdetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.user.find({ _id: userId }).then((userDetails) => {
          console.log("userDetails", userDetails);
          resolve(userDetails);
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
  getViewproducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await db.order.findOne({ _id: ObjectId(orderId) });
      console.log(orderDetails, "prroooooooo");
      // console.log(orderDetails.products[0]);
      //in productDetails address is in the form of objectId so we waant to find out the address in the order using aggregation and call it
      //in the controller
      resolve(orderDetails);
      console.log("order details in get view products:", orderDetails);
    });
  },
  getAddress: (orderId) => {
    return new Promise(async (resolve, reject) => {
      orderDetails = await db.order.aggregate([
        { $match: { _id: ObjectId(orderId) } },
        {
          $lookup: {
            from: "addresses", //from collection adddresses
            localField: "address",
            foreignField: "_id",
            as: "ordAddrs",
          },
        },
        // {
        //   $unwind: {
        //     path:"$ordAddrs"
        //   }
        // }
      ]);
      console.log("order details with order adress", orderDetails);
      resolve(orderDetails);
    });
  },
  orderCancellation: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.order.deleteOne({ _id: orderId });
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  },
  Status: (orderId, orderDetails) => {
    console.log("ordere cancel details", orderDetails);
    return new Promise(async (resolve, reject) => {
      await db.order
        .updateOne({ _id: orderId }, { $set: { status: "cancelled" } })
        .then((response) => {
          console.log("reeeee", response);
          resolve(response);
        })
        .catch((error) => {
          console.error(`the operation failed with error`);
        });
    });
  },
  addWallet: async (userId, total) => {
    try {
      const userWallet = await db.wallet.findOne({ userid: userId });
      if (userWallet) {
        const response = await db.wallet.updateOne(
          { userid: userId },
          { $inc: { balance: total } }
        );

        const historyObj = {
          userid: userId,
          type: "credit",
          amount: total,
          description: "Wallet recharge",
        };
        await db.wallethistory.create(historyObj);
        return { message: "Wallet updated successfully", response };
      } else {
        const walletObj = {
          userid: userId,
          balance: total,
        };
        const response = await db.wallet.create(walletObj);
        // Add wallet history record
        const historyObj = {
          userid: userId,
          type: "credit",
          amount: total,
          description: "Wallet recharge",
        };
        await db.wallethistory.create(historyObj);
        return { message: "New wallet created successfully", response };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },
  balanceWallet: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.wallet
          .find({ userid: ObjectId(userId) })
          .then((balance) => {
            resolve(balance);
          })
          .catch((err) => {
            // If there was an error retrieving the balance, reject the promise with the error message
            reject(err);
          });
      });
    } catch (err) {
      // If there was an error with the promise, reject the promise with the error message
      return Promise.reject(err);
    }
  },
  walletHistoty: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.wallethistory
          .find({ userid: userId })
          .sort({ date: -1 })
          .then((history) => {
            resolve(history);
          })
          .catch((err) => {
            reject(err);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },

  couponMatch: (couponCode,user) => {
    try {
      console.log("inside coupon,atch");
      return new Promise(async (resolve, reject) => {
        const couponExist = await db.coupon.findOne({ code: couponCode });
        const userExist = await db.user.find({ _id: user })
        if (couponExist&&userExist) {
          const couponAlreadyExist = await db.user.findOne({
            "usedCoupons.couponCode": couponCode,
          });

          if (couponAlreadyExist) {
            reject(new Error("Coupon already used by the user"));
          } else {
            resolve(couponExist);
          }
        } else {
          reject(new Error("Invalid coupon or user"));
        }
          
        
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error fetching coupon");
    }
  },
  newTotal: (userId, newTotal) => {
    return new Promise(async (req, res) => {
      try {
        await db.order.updateOne({});
      } catch (error) {}
    });
  },
  usedCoupons: (userid,couponCode, currentDate) => {
    return new Promise(async (resolve, reject) => {
      await db.user.findOneAndUpdate(
        { _id: userid },
        {
          $push: {
            usedCoupons: { couponCode: couponCode, appliedAt: currentDate },
          },
        }
      );
    })
  },

  updateField: (proId, discountedPrice) => {
    return new Promise(async (resolve, reject) => {
      await db.products.updateMany(
        { _id: proId },
        { $set: { hasDiscount: true, discountedPrice: discountedPrice } }
      );
    }).then((response) => {
      resolve();
    });
  },
};
