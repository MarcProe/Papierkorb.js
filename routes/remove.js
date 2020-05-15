let express = require("express");

let router = express.Router();

let fs = require("fs");
let sanitize = require("sanitize-filename");
let glob = require("glob");

let render = require("../modules/render.js");

let config = require("config");
let conf = config.get("conf");

router.get("/:docid/:func?/:genid?", function (req, res, next) {
  switch (req.params.func) {
    case "hard":
      hard(req, res, next);
      break;
    case "soft":
      soft(req, res, next);
      break;
    default:
      noop(req, res, next, "Keine Methode angegeben");
      break;
  }
});

function noop(req, res, next, err) {
  render.rendercallback(err, req, res, "error", null, conf, null);
}

function hard(req, res, next) {
  fs.unlink(conf.doc.basepath + req.params.docid, function (err) {
    if (err) {
      cleanup(req, res, next, true);
      render.rendercallback(err, req, res, "error", err, conf, null);
    } else {
      cleanup(req, res, next, true);
      render.rendercallback(null, req, res, "remove", {}, conf, "Löschen");
    }
  });
}

function soft(req, res, next) {
  req.app.locals.db
    .collection(conf.db.c_doc)
    .findOne({ _id: req.params.docid }, function (err, result) {
      if (err) {
        noop(req, res, next, err);
      } else {
        let target = conf.doc.newpath;
        let src = conf.doc.basepath + req.params.docid;

        if (result && result.subject) {
          target += sanitize(result.subject) + ".pdf";
        } else {
          target += req.params.docid;
        }

        fs.rename(src, target, function movepdf(err) {
          if (err) {
            noop(req, res, next, err);
          } else {
            cleanup(req, res, next, false);
            render.rendercallback(
              null,
              req,
              res,
              "remove",
              {},
              conf,
              "Zurücksetzen"
            );
          }
        });
      }
    });
}

function cleanup(req, res, next, hard) {
  cleanuppreview(req, res, next);
  cleanupdb(req, res, next);
}

function cleanuppreview(req, res, next) {
  glob(req.params.docid + ".*" + ".png", { cwd: conf.doc.imagepath }, function (
    err,
    files
  ) {
    files.forEach(function (entry) {
      fs.unlink(conf.doc.imagepath + entry, function (err) {
        if (err) {
          noop(req, res, next, err);
        }
      });
    });
  });
}

function cleanupdb(req, res, next) {
  req.app.locals.db
    .collection(conf.db.c_doc)
    .removeOne({ _id: req.params.docid }, function (err, obj) {
      if (err) noop(req, res, next, err);
    });
}

module.exports = router;
