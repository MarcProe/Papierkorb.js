let expect = require("chai").expect;
let request = require("request");
var supertest = require("supertest");
var should = require("should");
let sleep = require("asleep");
let mongo = require("mongodb").MongoClient;
let conf = require("config").get("conf");

describe("Document Creation", function () {
  it("upload share/test.nld.pdf should upload and respond with 200", function (done) {
    supertest(conf.test.host + ":80")
      .post("/new/null/upload")
      .attach("file", "share/test.nld.pdf")
      .expect(200, done);
  }).timeout(60000);
  it("/new/test.nld.pdf/create/ should return status 302", function (done) {
    supertest(conf.test.host + ":80")
      .get("/new/test.nld.pdf/create/")
      .expect(302, done);
  }).timeout(180000);
});
