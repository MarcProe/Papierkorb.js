let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");

describe("Basic Requests", function () {
  describe("request / from node", function () {
    let url = conf.test.schema + conf.test.host + ":" + conf.net.port;

    it("should return status 200", function (done) {
      request(url, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    }).timeout(60000);
  }),
    describe("request /new/ from node", function () {
      let url =
        conf.test.schema + conf.test.host + ":" + conf.net.port + "/new/";

      it("should return status 200", function (done) {
        request(url, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    }),
    describe("request /doc/ from node", function () {
      let url =
        conf.test.schema + conf.test.host + ":" + conf.net.port + "/doc/";

      it("should return status 200", function (done) {
        request(url, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    });
});
