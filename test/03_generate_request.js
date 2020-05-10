let expect = require("chai").expect;
let request = require("request");
var supertest = require("supertest");
var should = require("should");
let sleep = require("asleep");
let mongo = require("mongodb").MongoClient;
let conf = require("config").get("conf");

describe("Document Creation", function () {
  describe("upload a test file", function () {
    it("should upload and respond with 200", function (done) {
      supertest("localhost:3000")
        .post("/new/null/upload")
        .attach("file", "share/test.nld.pdf")
        .expect(200, done);
    });
  }),
    describe("request /new/test.nld.pdf/create/ from node", function () {
      this.slow(0);
      it("should return status 302", function (done) {
        supertest("localhost:3000")
          .get("/new/test.nld.pdf/create/")
          .expect(302, done);
      }).timeout(60000);
    }),
    describe("wait for 5 seconds", function () {
      this.slow(99999);
      it("should wait 5 seconds", function (done) {
        sleep(5000).then(function () {
          expect(true).to.equal(true);
          done();
        });
      }).timeout(60000);
    }) /*,
    describe("check the previews", function () {
      this.slow(0);
      it("there should be 5 previews", function (done) {
        let dburl = conf.db.constring + conf.db.db;
        mongo.connect(dburl, { useNewUrlParser: true }, function (err, db) {
          db.db(conf.db.db)
            .collection(conf.db.c_doc)
            .findOne({}, function (err, result) {
              expect(result.previews).to.equal(5);
              db.close();
              done();
            });
        });
      });
    }),
    describe("check the document", function () {
      this.slow(0);
      it("should return the doc update page", function (done) {
        let dburl = conf.db.constring + conf.db.db;
        mongo.connect(dburl, { useNewUrlParser: true }, function (err, db) {
          db.db(conf.db.db)
            .collection(conf.db.c_doc)
            .findOne({}, function (err, result) {
              let url = "http://localhost:3000/doc/" + result._id + "/update/";
              request(url, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                db.close();
                done();
              });
            });
        });
      });
    })*/;
});
