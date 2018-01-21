let expect = require("chai").expect;
let request = require("request");
let sleep = require('asleep');
let mongo = require('mongodb').MongoClient;
let conf = require('config').get('conf');

describe("Document Creation", function () {
    describe("request /new/test.nld.pdf/create/", function () {

        let url = "http://localhost:3000/new/test.nld.pdf/create/";

        it("should return status 200", function (done) {
            request(url, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    }),
        describe("wait for 15 seconds", function () {

            it("should wait 15 seconds", function (done) {
                sleep(15000).then(function () {
                    expect(true).to.equal(true);
                    done();
                });
            }).timeout(20000);
        }),
        describe("read document from database", function () {
            it("should be in the database", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.collection(conf.db.c_doc).findOne({}, function (err, result) {
                        expect(result._id).to.not.be.undefined;
                    });
                });
                done();
            });
        }),
        describe("check the previews", function () {
            it("there should be 5 previews", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.collection(conf.db.c_doc).findOne({}, function (err, result) {
                        expect(result.previews).to.equal(5);
                    });
                });
                done();
            });
            it("should return status 200", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.collection(conf.db.c_doc).findOne({}, function (err, result) {
                        let url = "http://localhost:3000/doc/" + result._id + "/preview/0";
                        request(url, function (error, response, body) {
                            expect(response.statusCode).to.equal(200);
                            done();
                        });

                    });
                });
                done();
            });
            it("should return content-type image/png", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.collection(conf.db.c_doc).findOne({}, function (err, result) {
                        let url = "http://localhost:3000/doc/" + result._id + "/preview/0";
                        request(url, function (error, response, body) {
                            expect(response.headers['content-type']).to.equal('image/png');
                            done();
                        });
                    });
                });
                done();
            });
        });
});
