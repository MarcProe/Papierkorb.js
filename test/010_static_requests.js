let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");
let fs = require("fs");
let fse = require("fs-extra");
let sleep = require("asleep");
var supertest = require("supertest");

var statics = [
  "css/basic.min.css",
  "css/dropzone.min.css",
  "css/style.css",
  "favicon.ico",
  "images/date16px.png",
  "images/icon-48x48.png",
  "images/icon-inv-48x48.png",
  "images/loading.gif",
  "images/papierkorb-logo.png",
  "js/dropzone.min.js",
  "js/jquery-3.5.1.min.js",
  "js/moment.min.js",
  "js/t/tesseract-core.asm.js",
  "js/t/tesseract-core.wasm.js",
  "js/t/tesseract.min.js",
  "js/t/worker.min.js",
  "js/unveil.js",
  "js/views/doc.js",
  "js/views/doc.ocr.js",
  "js/views/docs.js",
  "js/views/layout.js",
  "materialize/css/materialize.css",
  "materialize/css/materialize.min.css",
  "materialize/fonts/roboto/Roboto-Bold.woff",
  "materialize/fonts/roboto/Roboto-Bold.woff2",
  "materialize/fonts/roboto/Roboto-Light.woff",
  "materialize/fonts/roboto/Roboto-Light.woff2",
  "materialize/fonts/roboto/Roboto-Medium.woff",
  "materialize/fonts/roboto/Roboto-Medium.woff2",
  "materialize/fonts/roboto/Roboto-Regular.woff",
  "materialize/fonts/roboto/Roboto-Regular.woff2",
  "materialize/fonts/roboto/Roboto-Thin.woff",
  "materialize/fonts/roboto/Roboto-Thin.woff2",
  "materialize/js/materialize.js",
  "materialize/js/materialize.min.js",
  "tessdata/deu.traineddata.gz",
  "tessdata/eng.traineddata.gz",
  "tessdata/nld.traineddata.gz",
];

describe("Check static assets", function () {
  statics.forEach((file) => {
    let url = conf.test.host + ":" + conf.net.port + conf.proxy.public;
    describe("request " + url + file, function () {
      it("should return status 200 ", function (done) {
        supertest(conf.test.host + ":" + conf.net.port)
          .get(conf.proxy.public + file)
          .expect(200, done);
      }).timeout(60000);
    });
  });
});
