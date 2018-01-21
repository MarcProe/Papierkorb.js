let expect = require("chai").expect;
let request = require("request");

describe("Basic Requests", function () {
    describe("request /new/test.nld.pdf/create/", function () {

        let url = "http://localhost:3000/new/test.nld.pdf/create/";

        it("should return status 200", function (done) {
            request(url, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    })
});