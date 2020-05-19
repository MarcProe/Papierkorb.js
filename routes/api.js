let express = require("express");
let router = express.Router();

let conf = require("config").get("conf");
let moment = require("moment");
let Jimp = require("jimp");
let fs = require("fs");

let inspect = require("eyes").inspector({ maxLength: 20000 });

const dbl = require("../modules/dbloader.js");

router.get("/:version/:func/:docid?/:genid?", function (req, res, next) {
  switch (req.params.func) {
    case "end":
      res.writeHead(200, {
        message: "process about to end",
      });
      res.end();
      process.exit(1);
      break;
    case "partners":
      getpartners(req, res, next)
        .then(function (result) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        })
        .catch(function (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(err));
        });
      break;
    case "user":
      getuser(req, res, next)
        .then(function (result) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        })
        .catch(function (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(err));
        });
      break;
    case "tags":
      gettags(req, res, next)
        .then(function (result) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        })
        .catch(function (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(err));
        });
      break;
    case "doc": {
      getdoc(req, res, next)
        .then(function (result) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        })
        .catch(function (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(err));
        });
      break;
    }
    case "docs": {
      getdocs(req, res, next)
        .then(function (result) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        })
        .catch(function (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(err));
        });
      break;
    }
    case "preview": {
      getpreview(req, res, next);
      break;
    }
    case "download": {
      download(req, res, next);
      break;
    }
    case "reload": {
      reload(req, res, next);
      break;
    }
  }
});

router.post("/:version/:func/:docid?/", function (req, res, next) {
  switch (req.params.func) {
    case "ocr":
      try {
        req.app.locals.db
          .collection(conf.db.c_doc)
          .updateOne(
            { _id: req.params.docid },
            { $set: req.body },
            { upsert: false },
            function (err, result) {
              if (err) {
                throw err;
              } else {
                res.send({ message: result });
                res.end();
              }
            }
          );
      } catch (err) {
        res.writeHead(500, {
          message: err,
        });
        res.end();
      }
      break;
    case "doc":
      savedoc(req, res, next);
      break;
    case "user":
      saveuser(req, res, next);
      break;
    default:
      res.writeHead(404, {
        message: "method not found",
      });
      res.end();
      break;
  }
});

router.put("/:version/:func/:docid?/", function (req, res, next) {
  switch (req.params.func) {
    case "doc": {
      console.log("putting");
      inspect(req.body);
      console.log(moment.utc(req.body.docdate));
      res.end();
      break;
    }
  }
});

function getpartners(req, res, next) {
  return new Promise(function (resolve, reject) {
    if (req.session.partnerlist) {
      resolve(req.session.partnerlist);
    } else {
      req.app.locals.db
        .collection(conf.db.c_partner)
        .find({})
        .toArray(function (err, partnerlistres) {
          if (err) {
            reject(err);
          } else {
            req.session.partnerlist = partnerlistres;
            resolve(partnerlistres);
          }
        });
    }
  });
}

function gettags(req, res, next) {
  return new Promise(function (resolve, reject) {
    if (req.session.taglist) {
      resolve(req.session.taglist);
    } else {
      req.app.locals.db
        .collection(conf.db.c_tag)
        .find({})
        .toArray(function (err, taglistres) {
          if (err) {
            reject(err);
          } else {
            req.session.taglist = taglistres;
            resolve(taglistres);
          }
        });
    }
  });
}

function getuser(req, res, next) {
  return new Promise(function (resolve, reject) {
    if (req.session.userlist) {
      resolve(req.session.userlist);
    } else {
      req.app.locals.db
        .collection(conf.db.c_user)
        .find({})
        .toArray(function (err, userlistres) {
          if (err) {
            reject(err);
          } else {
            req.session.userlist = userlistres;
            resolve(userlistres);
          }
        });
    }
  });
}

function getdoc(req, res, next) {
  return new Promise(function (resolve, reject) {
    let query = { _id: req.params.docid };

    req.app.locals.db
      .collection(conf.db.c_doc)
      .find(query)
      .toArray(function (err, doc) {
        if (err) {
          reject(err);
        } else {
          if (doc[0]) {
            resolve(doc[0]);
          } else {
            reject({ message: "no result" });
          }
        }
      });
  });
}

function getdocs(req, res, next) {
  return new Promise(function (resolve, reject) {
    let query = {};
    let proj = { plaintext: 0 };

    req.app.locals.db
      .collection(conf.db.c_doc)
      .find(query)
      .project(proj)
      .toArray(function (err, docs) {
        if (err) {
          reject(err);
        } else {
          if (docs) {
            resolve(docs);
          } else {
            reject({ message: "no result" });
          }
        }
      });
  });
}

function savedoc(req, res, next) {
  console.log(req.body);
  //now, what?

  //prepare data
  let isodate = moment.utc(req.body.docdate, "DD.MM.YYYY").toISOString();

  let users = [];
  if (req.body.users) {
    if (req.body.users.constructor === Array) {
      //If only one element is given, the type is string, which is bad
      users = req.body.users;
    } else {
      users = [req.body.users];
    }
  }

  let tags = [];
  if (req.body.tags) {
    if (req.body.tags.constructor === Array) {
      //If only one element is given, the type is string, which is bad
      tags = req.body.tags;
    } else {
      tags = [req.body.tags];
    }
  }

  let savetags = [];

  //create new tags
  tags.forEach(function (tag) {
    let dbtag = {};
    dbtag._id = tag;

    let foundtag = req.session.taglist.some(function (el) {
      return el._id === dbtag._id;
    });
    if (!foundtag) {
      req.session.taglist.push(dbtag); //all tags
      savetags.push(dbtag); //only new tags
    }
  });

  if (savetags && savetags[0]) {
    req.app.locals.db
      .collection(conf.db.c_tag)
      .insertMany(savetags, { ordered: false }, function (err, res) {
        if (err) {
          console.error(err);
        }
      });
  }

  //create new partner
  if (req.body.partner) {
    let foundpartner = req.session.partnerlist.some(function (element) {
      return element._id === req.body.partner;
    });

    if (!foundpartner) {
      let dbpartner = {
        _id: req.body.partner,
        name: req.body.partner,
      };
      req.session.partnerlist.push(dbpartner);

      req.app.locals.db
        .collection(conf.db.c_partner)
        .insertOne(dbpartner, function (err, res) {
          if (err) {
            console.error(err);
          }
        });
    }
  }

  //update document
  let docdata = {
    $set: {
      subject: req.body.subject,
      lang: req.body.lang,
      users: users ? users : [],
      docdate: isodate ? isodate : "",
      partner: req.body.partner,
      tags: tags ? tags : [],
    },
  };
  console.log(docdata);
  req.app.locals.db
    .collection(conf.db.c_doc)
    .updateOne({ _id: req.params.docid }, docdata, { upsert: true }, function (
      err,
      result
    ) {
      if (err) {
        res.send({ message: err });
        res.end();
      } else {
        res.send({ message: "ok" });
        res.end();
      }
    });
}

function saveuser(req, res, next) {
  if (!req.body._id || !req.body.name) {
    res.end(400);
  }

  let user = {};
  user._id = req.body._id;
  user.name = req.body.name;

  if (req.body.search) {
    if (req.body.search.constructor === Array) {
      //If only one element is given, the type is string, which is bad
      user.search = req.body.search;
    } else {
      user.search = [req.body.search];
    }
  }

  //update document
  let userdata = {
    $set: {
      name: user.name,
      search: user.search ? user.search : [],
    },
  };
  console.log(userdata);
  req.app.locals.db
    .collection(conf.db.c_user)
    .updateOne({ _id: user._id }, userdata, { upsert: true }, function (
      err,
      result
    ) {
      console.log(result);
      console.log(err);
      if (err) {
        res.send({ error: err });
        res.end(500);
      } else {
        ret = {};
        ret.result = result;
        ret.user = user;
        res.send(ret);
        res.end(200);
      }
    })
    .then(() => {
      dbl.loadUsers(req);
    });
}

function getpreview(req, res, next, thumb) {
  let thumbname = "";
  if (thumb) {
    thumbname = ".thumb";
  }

  let id = req.params.genid ? req.params.genid : 0;
  let imagepath =
    conf.doc.imagepath + req.params.docid + "." + id + thumbname + ".png";

  img = fs.readFileSync(imagepath);
  res.writeHead(200, { "Content-Type": Jimp.MIME_PNG });
  res.end(img, "binary");
}

function download(req, res, docid) {
  let file = fs.readFileSync(conf.doc.basepath + req.params.docid);
  res.writeHead(200, { "Content-Type": "application/pdf" });
  res.end(file, "binary");
}

function reload(req, res, next) {
  req.session.destroy();
  res.redirect(302, "/");
}

module.exports = router;
