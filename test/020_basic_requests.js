let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");

let url = conf.test.schema + conf.test.host;

describe("Basic Requests", function () {
  it("request / should return status 200", function (done) {
    request(url, function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  }).timeout(500000);
  it("request /new/ should return status 200", function (done) {
    request(url + "/new/", function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  }).timeout(500000);
  it("request /doc/ should return status 200", function (done) {
    request(url + "/doc/", function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  }).timeout(500000);
  it("request /partners/ should return status 200", function (done) {
    request(url + "/partners/", function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  }).timeout(500000);
});
