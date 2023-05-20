module.exports = {
  userAuth: (req, res, next) => {
    if (req.session.userIn) {
      next();
    } else {
      res.render("user/login");
    }
  },

  adminAuth: (req, res, next) => {
    if (req.session.adminIn) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  },
};

