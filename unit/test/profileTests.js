const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const util = require(`../../generators/app/utility`);

describe(`profiles:index cmdLine`, function () {
   "use strict";

   it(`list file does not exist`, function () {
      var spy;
      var fsStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`list`])
         .on(`error`, function (error) {
            fs.existsSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsStub = sinon.stub(fs, `existsSync`).returns(false);
         })
         .on(`end`, function () {
            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);
            assert.equal(`- No profiles file.`, spy.getCall(0).args[0]);

            assert.equal(1, fsStub.callCount, `fs.existsSync was not called`);

            fs.existsSync.restore();
         });
   });

   it(`list invalid file`, function () {
      var spy;
      var fsExistsSyncStub;
      var fsReadFileSyncStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`list`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(true);
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns(`This is not json.`);
         })
         .on(`end`, function () {
            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);
            assert.equal(`- Invalid file.`, spy.getCall(0).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);

            fs.existsSync.restore();
            fs.readFileSync.restore();
         });
   });

   it(`list`, function () {
      var spy;
      var fsExistsSyncStub;
      var fsReadFileSyncStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`list`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(true);
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns(`
         [
            {
               "Name": "unitTest",
               "URL": "http://localhost:8080/tfs/defaultcollection",
               "Pat": "",
               "Type": "OnPremise",
               "Version": "TFS2017"
            },
            {
               "Name": "http://192.168.1.3:8080/tfs/defaultcollection",
               "URL": "http://192.168.1.3:8080/tfs/defaultcollection",
               "Pat": "OnE2cXpseHk0YXp3dHpz",
               "Type": "Pat",
               "Version": "TFS2017"
            },
            {
               "Name": "test",
               "URL": "https://test.visualstudio.com",
               "Pat": "OndrejR0ZHpwbDM3bXUycGt5c3hm",
               "Type": "Pat",
               "Version": "VSTS"
            }
         ]`);
         })
         .on(`end`, function () {
            assert.equal(5, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`Name                                          URL                                           Version Type`, spy.getCall(0).args[0]);
            assert.equal(`----                                          ---                                           ------- ----`, spy.getCall(1).args[0]);
            assert.equal(`unitTest                                      http://localhost:8080/tfs/defaultcollection   TFS2017 OnPremise`, spy.getCall(2).args[0]);
            assert.equal(`http://192.168.1.3:8080/tfs/defaultcollection http://192.168.1.3:8080/tfs/defaultcollection TFS2017 Pat`, spy.getCall(3).args[0]);
            assert.equal(`test                                          https://test.visualstudio.com                 VSTS    Pat`, spy.getCall(4).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);

            fs.existsSync.restore();
            fs.readFileSync.restore();
         });
   });
});