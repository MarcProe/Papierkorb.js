let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");

let url = conf.test.schema + conf.test.host + ":80";

describe("Basic Requests", function () {
  describe("request / ", function () {
    it("should return status 200", function (done) {
      request(url, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    }).timeout(60000);
  }),
    describe("request /new/", function () {
      it("should return status 200", function (done) {
        request(url + "/new/", function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    }),
    describe("request /doc/", function () {
      it("should return status 200", function (done) {
        request(url + "/doc/", function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    }),
    describe("request /partners/", function () {
      it("should return status 200", function (done) {
        request(url + "/partners/", function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    });
});
