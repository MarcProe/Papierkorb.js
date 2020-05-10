let expect = require("chai").expect;
let request = require("request");
let conf = require("config").get("conf");
let fs = require("fs");
let fse = require("fs-extra");
let sleep = require("asleep");

describe("Prepare Tests", function () {
  describe("wait for 10 seconds", function () {
    this.slow(99999);
    it("should wait 10 seconds", function (done) {
      sleep(10000).then(function () {
        expect(true).to.equal(true);
        done();
      });
    }).timeout(20000);
  }),
    describe("create new directory", function () {
      let path = conf.doc.newpath;
      fse.ensureDirSync(path);
      it("should have created the new folder", function (done) {
        expect(fs.existsSync(path)).to.equal(true);
        done();
      });
    }),
    describe("create doc directory", function () {
      let path = conf.doc.basepath;
      fse.ensureDirSync(path);
      it("should have created the doc folder", function (done) {
        expect(fs.existsSync(path)).to.equal(true);
        done();
      });
    }),
    describe("create image directory", function () {
      let path = conf.doc.imagepath;
      fse.ensureDirSync(path);
      it("should have created the image folder", function (done) {
        expect(fs.existsSync(path)).to.equal(true);
        done();
      });
    }),
    describe("copy testfile", function () {
      let path = conf.doc.newpath + "test.nld.pdf";
      fs.copyFileSync("./share/test.nld.pdf", path);
      it("should exist in the new folder", function (done) {
        expect(fs.existsSync(path)).to.equal(true);
        done();
      });
    });
});
