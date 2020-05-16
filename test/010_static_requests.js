let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");
let fs = require("fs");
let fse = require("fs-extra");
let sleep = require("asleep");

describe("Check static assets", function () {
  describe("wait for 1 seconds", function () {
    this.slow(99999);
    it("should wait 1 seconds", function (done) {
      sleep(1000).then(function () {
        expect(true).to.equal(true);
        done();
      });
    }).timeout(20000);
  }),
    describe(
      "request " + conf.proxy.public + "images/loading.gif",
      function () {
        let url =
          conf.test.schema +
          conf.test.host +
          ":" +
          conf.net.port +
          conf.proxy.public +
          "images/loading.gif";

        it("should return status 200 and a body size of 654", function (done) {
          request(url, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body.length).to.equal(654);
            done();
          });
        }).timeout(60000);
      }
    );
});
