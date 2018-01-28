let expect = require("chai").expect;
let request = require("request");
let sleep = require('asleep');
let mongo = require('mongodb').MongoClient;
let conf = require('config').get('conf');

describe("Document Creation", function () {
    describe("request /new/test.nld.pdf/create/", function () {
        this.slow(0);
        let url = "http://localhost:3000/new/test.nld.pdf/create/";

        it("should return status 200", function (done) {
            request(url, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        }).timeout(20000);
    }),
        describe("wait for 15 seconds", function () {
            this.slow(99999);
            it("should wait 15 seconds", function (done) {
                sleep(15000).then(function () {
                    expect(true).to.equal(true);
                    done();
                });
            }).timeout(20000);
        }),
        describe("read document from database", function () {
            this.slow(0);
            it("should be in the database", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db).collection(conf.db.c_doc).findOne({}, function (err, result) {
                        expect(result._id).to.match(/\d{4}\-\d{2}\-\d{2}T\d{2}\-\d{2}\-\d{2}\.\d{3}Z\.pdf/);
                        done();
                    });
                });                
            });
        }),
        describe("check the previews", function () {
            this.slow(0);
            it("there should be 5 previews", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db).collection(conf.db.c_doc).findOne({}, function (err, result) {
                        expect(result.previews).to.equal(5);
                        done();
                    });
                });
            });
            it("should return status 200 for the 1st preview", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db).collection(conf.db.c_doc).findOne({}, function (err, result) {
                        let url = "http://localhost:3000/doc/" + result._id + "/preview/0";
                        request(url, function (error, response, body) {
                            expect(response.statusCode).to.equal(200);
                            done();
                        });
                    });
                });
            });
            it("should return content-type image/png for the first preview", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db).collection(conf.db.c_doc).findOne({}, function (err, result) {
                        let url = "http://localhost:3000/doc/" + result._id + "/preview/0";
                        request(url, function (error, response, body) {
                            expect(response.headers['content-type']).to.equal('image/png');
                            done();
                        });
                    });
                });
            });
            it("should return status 200 for the 1st thumb", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db).collection(conf.db.c_doc).findOne({}, function (err, result) {
                        let url = "http://localhost:3000/doc/" + result._id + "/thumb/0";
                        request(url, function (error, response, body) {
                            expect(response.statusCode).to.equal(200);
                            done();
                        });
                    });
                });
            });
            it("should return content-type image/png for the first thumb", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db).collection(conf.db.c_doc).findOne({}, function (err, result) {
                        let url = "http://localhost:3000/doc/" + result._id + "/thumb/0";
                        request(url, function (error, response, body) {
                            expect(response.headers['content-type']).to.equal('image/png');
                            done();
                        });
                    });
                });
            });
        });
});
