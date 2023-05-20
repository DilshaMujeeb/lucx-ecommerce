const db = require("../model/connection");
const ObjectId = require("mongoose").Types.ObjectId;
module.exports = {
  listUsers: () => {
    let userData = [];

    return new Promise(async (resolve, reject) => {
      db.user
        .find()
        .exec()
        .then((result) => {
          userData = result;
          resolve(result);
        });
      console.log(userData);
    });
  },

  //block and unblock users
  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userId }, { $set: { blocked: true } })
        .then((data) => {
          console.log("user blocked success");
          resolve();
        });
    });
  },

  UnblockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userId }, { $set: { blocked: false } })
        .then((data) => {
          console.log("user unblocked success");
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  //Dashboard
  totalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let revenue = await db.order.aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $project: {
              total: 1,
            },
          },
          {
            $group: {
              _id: "",
              totalRevenue: {
                $sum: {
                  $toInt: "$total",
                },
              },
            },
          },
        ]);
        console.log("revenue:::");
        resolve(revenue[0].totalRevenue);
      } catch (error) {
        console.log(error);
      }
    });
  },

  orderCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.order
          .countDocuments()
          .then((response) => {
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
  productCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.products
          .countDocuments()
          .then((response) => {
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
  categoryCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.category
          .countDocuments()
          .then((response) => {
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
  monthlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let monthly = await db.order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },
        {
          $project: {
            total: 1,
          },
        },
        {
          $group: {
            _id: {
              month: {
                $month: "$date",
              },
            },
            totalnum: {
              $sum: {
                $toInt: "$total",
              },
            },
          },
        },
        {
          $group: {
            _id: "_id",
            AverageValue: {
              $avg: "$totalnum",
            },
          },
        },
        {
          $project: {
            _id: 0,
            AverageValue: 1,
          },
        },
      ]);
      console.log("monthly:", monthly);
      resolve(monthly[0]);
    });
  },
  showChart: () => {
    return new Promise(async (resolve, reject) => {
      let chart = await db.order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },
        {
          $project: {
            date: 1,
            total: 1,
          },
        },
        {
          $group: {
            _id: {
              day: {
                $dayOfWeek: "$date",
              },
            },
            totalnum: {
              $sum: {
                $toInt: "$total",
              },
            },
          },
        },
        {
          $project: {
            daywise: "$_id.day",
            _id: 0,
            totalnum: 1,
          },
        },
        {
          $sort: {
            daywise: 1,
          },
        },
        {
          $project: {
            days: {
              $arrayElemAt: [
                ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                "$daywise",
              ],
            },
            totalnum: 1,
          },
        },
      ]);
      resolve(chart);
    });
  },

  //list and unlist products

  list: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .updateOne({ _id: prodId }, { $set: { unlist: false } })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  unList: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .updateOne({ _id: prodId }, { $set: { unlist: true } })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  //for finding all catagories available and making them to passable object

  findAllcategories: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const categories = await db.category.find({ unlist: false }).exec();
        resolve(categories);
      } catch (err) {
        reject(err);
      }
    });
  },

  //adding the product details into the database, by creating a new instance of products db that is uploadedImage, inside that product details are mentioned

  postAddProduct: (userData, filename) => {
    return new Promise((resolve, reject) => {
      uploadedImage = new db.products({
        Productname: userData.name,
        ProductDescription: userData.description,
        Quantity: userData.quantity,
        Image: filename,
        category: userData.category,
        Price: userData.Price,

      });
    
     
        uploadedImage.save().then((data) => {
          resolve(data);
        });
    });
  },

  getViewProducts: () => {
    return new Promise(async (resolve, reject) => {
      const products = await db.products.find({});
      // for (const product of products) {
      //   product.currentStockLevel = product.Quantity;
      //   await product.save();
      // }
      
          resolve(products);
          console.log("helooo", products);
        });
    
  },

  // here no file images so data is only needed
  addCategory: (data) => {
    console.log("mooooo");
    console.log(data);
    return new Promise(async (resolve, reject) => {
      // new instance of category is used to store the category details in database; catData
      try {
        const categoryExist = await db.category.findOne({
          CategoryName: data.categoryname,
        });
        if (categoryExist) {
          console.log("category exist");
          reject({ error: "Category already exists" });
        } else {
          const catData = new db.category({ CategoryName: data.categoryname });
          console.log(catData);
          // console.log("lucky");
          await catData.save().then((data) => {
            // console.log(data)
            resolve(data);
          });
        }
      } catch (err) {
        reject({ error: "Error occurred" });
      }
    });
  },
  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  listCat: (catId) => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .updateOne({ _id: catId }, { $set: { unlist: false } })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  unlistCat: (catId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await db.category.updateOne(
          { _id: ObjectId(catId) },
          { $set: { unlist: true } }
        );

        // Unlist all products under this category
        await db.products.updateMany(
          { category: ObjectId(catId) },
          { $set: { unlist: true } }
        );

        resolve(data);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  // delCategory: (delete_id) => {
  //   console.log(delete_id);
  //   return new Promise(async (resolve, reject) => {
  //     await db.category.deleteOne({ _id: delete_id }).then((response) => {
  //       resolve(response);
  //     });
  //   });
  // },
  // edCategory: (editId) => {
  //   console.log(editId);
  //   return new Promise(async (resolve, reject) => {
  //     await db.category.findOne({ _id: editId }).then((response) => {
  //       resolve(response);
  //     });
  //   });
  // },
  // postEditCategory:(categoryId,catName)=>{
  //     console.log("categoryId",categoryId);
  //   console.log("catName", catName);

  //   return new Promise(async (resolve, reject) => {
  //      try {
  //       await db.category
  //         .updateOne(
  //           { _id: categoryId },
  //           {
  //             $set: {
  //               CategoryName: catName.name,
  //             },
  //           }
  //         )
  //         .then(response);
  //       console.log("edit response:", response);
  //      } catch (error) {
  //       console.log(error);
  //      }

  //     })

  // },

  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  postEditProduct: (productId, editedData, filename) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .updateOne(
          { _id: productId },
          {
            $set: {
              Productname: editedData.name,
              ProductDescription: editedData.description,
              Quantity: editedData.quantity,
              Price: editedData.price,
              category: editedData.category,
              Image: filename,
            },
          }
        )
        .then((response) => {
          console.log(response);

          resolve(response);
        });
    });
  },
  // postEditProduct: (productId, editedData, files) => {
  //   return new Promise(async (resolve, reject) => {
  //     const imageArray = files.map((file) => file.filename);
  //     await db.products
  //       .updateOne(
  //         { _id: productId },
  //         {
  //           $set: {
  //             Productname: editedData.name,
  //             ProductDescription: editedData.description,
  //             Quantity: editedData.quantity,
  //             Price: editedData.Price,
  //             category: editedData.category,
  //             Image: imageArray,
  //           },
  //         }
  //       )
  //       .then((response) => {
  //         console.log(response);

  //         resolve(response);
  //       });
  //   });
  // },
  // deleteProduct:(productId)=>{
  //     return new Promise (async(resolve,reject)=>{
  //         await db.products.deleteOne({_id:productId}).then((response)=>{
  //             resolve (response)
  //         })
  //     })
  // },
  viewAllorders: () => {
    return new Promise(async (resolve, reject) => {
      await db.order
        .find({ status: { $ne: "pending" } })
        .sort({ date: -1 })
        .exec()
        .then((response) => {
          resolve(response);
        });
      {
        status: {
          $ne: "pending";
        }
      }
    });
  },
  updateStatus: (orderid, orderDetails) => {
    return new Promise(async (resolve, reject) => {
      await db.order
        .updateOne({ _id: orderid }, { $set: { status: orderDetails.status } })
        .then((response) => {
          console.log(response);
          resolve();
        })
        .catch((error) => {
          console.error(`the operation failed with error`);
        });
    });
  },
  addCoupon: (details) => {
    try {
      console.log("inside aaaddd coupon");
      return new Promise(async (resolve, reject) => {
        const couponDetails = new db.coupon({
          code: details.couponName,
          description: details.description,
          discountAmount: details.price,
          minimumAmount: details.minimum,
          maximumDiscount: details.maximum,
          startDate: details.start,
          endDate: details.expiry,
        });

        const response = await couponDetails.save();

        console.log(response, "response in coupon");
        resolve(response);
      });
    } catch (error) {
      console.log(error);
    }
  },
  listAllCoupons: () => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.coupon
          .find()
          .sort({ createdAt: -1 })
          .exec()
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },

  //sales

  getAllSales: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let sales = await db.order
          .find({ status: "Delivered" })
          .sort({ date: -1 });
        resolve(sales);
      } catch (error) {
        console.error(`Error fetching sales: ${error}`);
        throw error;
      }
    });
  },

  getAllSalesInDateRange: async (date1, date2) => {
    try {
      const sales = await db.order
        .find({
          status: "Delivered",
          date: {
            $gte: new Date(date1),
            $lte: new Date(date2),
          },
        })
        .sort({ date: -1 });
      console.log("Sales---", sales);
      return sales;
    } catch (error) {
      console.log("Error fetching sales: ", error);
      throw error;
    }
  },
  //offers
  postAddOffers: (details) => {
    return new Promise(async (resolve, reject) => {
      try {
        const offerDetails = new db.offer({
          offerType: details.offerType,
          offerValue: details.offerValue,
          offerCode: details.offerCode,
          product: details.product,
          category: details.category,
          startDate: details.start,
          endDate: details.expiry,
        });
        const response = await offerDetails.save();
        console.log(response);
        resolve(response);
      } catch (error) {
        console.log(error);
      }
    });
  },
  updateProOffer: (proId,offerId) => {
    return new Promise(async (resolve, reject) => { 
      try {
        await db.products.updateOne({ _id: proId }, { $set: { offer: offerId } }).then(response => {
          resolve()
        });
      } catch (error) {
        
      }
    })
  },

  getProductOffer: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const productOffers = await db.offer
          .aggregate([
            {
              $match: { offerType: "product" }, // filter documents with offerType = 'product'
            },
            {
              $lookup: {
                // join offer and product collections
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productDetails",
              },
            },
            {
              $project: {
                // get the required fields from the result
                _id: 1,
                offerType: 1,
                offerValue: 1,
                offerCode: 1,
                startDate: 1,
                endDate: 1,
                isActive: 1,
                createdAt: 1,
                updatedAt: 1,
                productDetails: { $arrayElemAt: ["$productDetails", 0] }, // get the first element of the productDetails array
              },
            },
          ])
          .sort({ createdAt: -1 })
          .exec();
        console.log(productOffers,"after aggreagation");
        resolve(productOffers);
      } catch (error) {
        console.log(error);
      }
    });
  },

  getCategoryOffer: () => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.offer.find({ offerType: "category" }).then((category) => {
          resolve(category);
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
};