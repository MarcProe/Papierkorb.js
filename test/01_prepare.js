let expect = require("chai").expect;
let request = require("request");
let conf = require('config').get('conf');
let fs = require('fs');

describe("Prepare Tests", function () {
    describe("copy testfile /", function () {
        let path = conf.doc.newpath + '/test.nld.pdf';
        fs.copyFileSync('share/test.nld.pdf', path);
        it("should exist in the new folder", function (done) {
            expect(fs.existsSync(path)).to.equal(true);
            done();
        });
    })
});
