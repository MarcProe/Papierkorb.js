let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");

describe("Basic Requests", function () {
  describe("request /todo from node", function () {
    let url = conf.test.schema + conf.test.host + ":" + conf.net.port;

    it("should return status 200", function (done) {
      request(url, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    }).timeout(60000);
  }),
    describe("request /todo/ from node", function () {
      let url = conf.test.schema + conf.test.host + ":" + conf.net.port;

      it("should return status 200", function (done) {
        request(url, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    }),
    describe("request /todo/ from node", function () {
      let url = conf.test.schema + conf.test.host + ":" + conf.net.port;

      it("should return status 200", function (done) {
        request(url, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    });
});
