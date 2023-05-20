const multer = require('multer');
const path = require('path');

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// const fileFilter = (req, file, cb) => {
//   // Accept only jpeg and png files
//   if (
//     file.mimetype === "image/jpeg" ||file.mimetype === "image/png"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const uploads = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });
const editedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

module.exports = {
  uploads: multer({ storage: Storage }).array("images", 4),
  editeduploads: multer({ storage: editedStorage }).fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  // bannerAdd:multer({storage:bannerAdd}).single('bannerImg'),

  // bannerEdit:multer({storage:bannerEdit}).single('bannerEditImg')
};