let expect  = require("chai").expect;
let request = require("request");

describe("Papierkorb.js WebApp", function() {
    describe("request /", function() {

        let url = "http://localhost:3000/";
        
        it("should return status 200", function(done) {
            request(url, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    }),
    describe("request /new/", function() {

        let url = "http://localhost:3000/new/";

        it("should return status 200", function(done) {
            request(url, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    }),
    describe("request /doc/", function() {

        let url = "http://localhost:3000/new/";

        it("should return status 200", function(done) {
            request(url, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    }),
        describe("request /images/papierkorb-logo.png", function () {

            let url = "http://localhost:3000//images/papierkorb-logo.png";

            it("should return status 200", function (done) {
                request(url, function (error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("should return content-type image/png", function (done) {
                request(url, function (error, response, body) {
                    expect(response.headers['content-type']).to.equal('image/png');
                    done();
                });
            });
        });
});
