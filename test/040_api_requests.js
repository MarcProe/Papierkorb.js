let expect = require("chai").expect;
let request = require("request");
var supertest = require("supertest");
let conf = require("config").get("conf");
let _ = require("lodash");

let url = conf.test.schema + conf.test.host + "/api/v1/";
let testuser = {
  _id: "NPMTestUserID",
  name: "NPMTestUser",
  search: ["NPM", "Papierkorb"],
};

describe("API requests", function () {
  describe("request docs", function () {
    var sdoc = {};
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

    it("single document should have same metadata as in /docs", function (done) {
      request(url + "doc/" + sdoc._id, function (error, response, body) {
        let doc = JSON.parse(body);

        expect(response.statusCode).to.equal(200);
        expect(doc._id).to.equal(sdoc._id);
        expect(doc.previews).to.equal(sdoc.previews);

        done();
      });
    }).timeout(60000);

    it(
      "should have preview 0 (other previews are created async)" + i,
      function (done) {
        request(url + "preview/0/" + i, function (error, response, body) {
          expect(response.statusCode).to.equal(200);

          done();
        });
      }
    ).timeout(60000);

    it("should be downloadable", function (done) {
      request(url + "download/" + sdoc._id + "/", function (
        error,
        response,
        body
      ) {
        expect(response.statusCode).to.equal(200);
        expect(String(response.body).startsWith("%PDF-1.6")).to.equal(true);
        done();
      });
    }).timeout(60000);

    it("should be possible to create a user", function (done) {
      supertest(conf.test.host)
        .post("/api/v1/user")
        .send(testuser)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(function (res) {
          if (!res.body.result) throw new Error("Response Result not defined");
          if (!res.body.user) throw new Error("Response User not defined");
        })
        .expect(200, done);
    }).timeout(60000);

    it("should be possible to get that user", function (done) {
      supertest(conf.test.host)
        .get("/api/v1/user")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(function (res) {
          if (!_.isEqual(res.body[0], testuser))
            throw new Error(
              "Result ist not equal to testuser" + JSON.stringify(res.body)
            );
        })
        .expect(200, done);
    }).timeout(60000);
  });
});
