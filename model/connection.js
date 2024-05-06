const dotenv = require("dotenv");
var mongoose = require("mongoose");
dotenv.config();

const {
  TrustProductsEvaluationsInstance,
} = require("twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEvaluations");
var ObjectId = require("mongodb").ObjectId;
const db = mongoose
  .connect(process.env.MONGO_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  access: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  usedCoupons: [
    {
      couponCode: {
        type: String,
        required: true,
      },
      orderId: {},
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const productSchema = new mongoose.Schema({
  Productname: {
    type: String,
  },
  ProductDescription: {
    type: String,
  },
  Quantity: {
    type: Number,
  },
  Image: {
    type: Array,
  },
  Price: {
    type: Number,
  },
  category: {
    type: String,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "offer",
  },
  hasDiscount: {
    type: Boolean,
    default: false,
  },
  discountedPrice: {
    type: Number,
  },
  unlist: { type: Boolean, default: false },

  // currentStockLevel: {
  //   type: Number,
  //   required: true,
  //   default: 0,
  // },
});

const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
  },
  unlist: {
    type: Boolean,
    default: false,
  },
});

const cartSchema = new mongoose.Schema({
  userid: mongoose.SchemaTypes.ObjectId,
  products: [],
});

const addressSchema = new mongoose.Schema({
  owner: mongoose.SchemaTypes.ObjectId,
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  homeAddress1: {
    type: String,
    required: true,
  },
  homeAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
  },
  products: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "placed"],
    default: "pending",

    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const walletHistorySchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["credit", "debit", "refund"],
    required: true,
  },
  description: {
    type: String,
    required: true, //A string describing the reason for the refund.
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  // discountType: {
  //   type: String,
  //   enum: ["percent", "fixed"],
  //   required: true,
  // },
  discountAmount: {
    type: Number,
    required: true,
  },
  //The minimum order amount required to use the coupon.
  minimumAmount: {
    type: Number,
    required: true,
  },
  // The maximum amount of discount
  maximumDiscount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//offer
//  const productOfferSchema = new mongoose.Schema(
//    {
//      offerType: {
//        type: String,
//        required: true,
//        enum: ["product"],
//      },
//      offerValue: {
//        type: Number,
//        required: true,
//      },
//      offerCode: {
//        type: String,
//        required: true,
//        unique: true,
//      },
//      product: {
//        type: mongoose.Schema.Types.ObjectId,
//        ref: "Product",
//        required: true,
//      },
//    },
//    { timestamps: true }
//  );

//  const categoryOfferSchema = new mongoose.Schema(
//    {
//      offerType: {
//        type: String,
//        required: true,
//        enum: ["category"],
//      },
//      offerValue: {
//        type: Number,
//        required: true,
//      },
//      offerCode: {
//        type: String,
//        required: true,
//        unique: true,
//      },
//      category: {
//        type: String,
//        required: true,
//      },
//    },
//    { timestamps: true }
//  );

const offerSchema = new mongoose.Schema({
  offerType: {
    type: String,
    enum: ["product", "category"],
    required: true,
  },
  offerValue: {
    type: Number,
    required: true,
  },
  offerCode: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: function () {
      return this.offerType === "product";
    },
  },
  category: {
    type: String,
    required: function () {
      return this.offerType === "category";
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
  user: mongoose.model("user", userschema),
  category: mongoose.model("category", categorySchema),
  products: mongoose.model("products", productSchema),
  cart: mongoose.model("cart", cartSchema),
  address: mongoose.model("address", addressSchema),
  order: mongoose.model("order", orderSchema),
  wallet: mongoose.model("wallet", walletSchema),
  wallethistory: mongoose.model("wallethistory", walletHistorySchema),
  coupon: mongoose.model("coupon", couponSchema),
  // productoffer: mongoose.model("productoffer", productOfferSchema),
  // categoryoffer: mongoose.model("categoryoffer", categoryOfferSchema),
  offer: mongoose.model("offer", offerSchema),
};
