let conf = require("config").get("conf");

exports.loadUsers = async function loadUsers(req) {
  //get users from database
  await req.app.locals.db
    .collection(conf.db.c_user)
    .find({})
    .toArray(function (err, userlistres) {
      if (err) throw err;
      req.session.userlist = userlistres;
    });
};
