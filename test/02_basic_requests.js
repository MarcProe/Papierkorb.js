let expect = require("chai").expect;
let request = require("request");

describe("Basic Requests", function () {
  describe("request / from node", function () {
    let url = "http://localhost:3000/";

    it("should return status 200", function (done) {
      request(url, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    }).timeout(60000);
  }),
    describe("request /new/ from node", function () {
      let url = "http://localhost:3000/new/";

      it("should return status 200", function (done) {
        request(url, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    }),
    describe("request /doc/ from node", function () {
      let url = "http://localhost:3000/doc/";

      it("should return status 200", function (done) {
        request(url, function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          done();
        });
      }).timeout(60000);
    });
});
