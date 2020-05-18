let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");

let url = conf.test.schema + conf.test.host + ":80/api/v1/";
let sdoc = null;

describe("API requests", function () {
  /*
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
    }),*/

  describe("request docs", function () {
    it("one document should have plausible metadata", function (done) {
      request(url + "docs/", function (error, response, body) {
        let doc = JSON.parse(body)[0];
        let rx = /\d{4}-\d\d-\d\dT\d\d-\d\d-\d\d\.\d{3}Z\.pdf/gm;

        expect(response.statusCode).to.equal(200);
        expect(doc._id.match(rx)).to.not.be.null;
        expect(doc.previews).to.equal(5);

        sdoc = doc;

        done();
      });
    }).timeout(60000);
  }),
    describe("request docs", function () {
      it("single document should have same metadata as in /docs", function (done) {
        request(url + "doc/" + sdoc, function (error, response, body) {
          let doc = JSON.parse(body)[0];

          expect(response.statusCode).to.equal(200);
          expect(doc._id.to.equal(sdoc._id));
          expect(doc.previews).to.equal(sdic_previews);

          sdoc = doc;

          done();
        });
      }).timeout(60000);
    });
});
