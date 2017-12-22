const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const util = require(`../../generators/app/utility`);

var profiles = `
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
]`;

describe(`profile:index prompt`, function () {
   "use strict";

   it(`list profiles`, function () {
      var spy;
      var fsExistsSyncStub;
      var fsReadFileSyncStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withPrompts({
            profileCmd: `list`
         })
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(true);
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns(profiles);
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.readFileSync.restore();

            assert.equal(6, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`\r\nName                                          URL                                           Version Type`, spy.getCall(0).args[0]);
            assert.equal(`----                                          ---                                           ------- ----`, spy.getCall(1).args[0]);
            assert.equal(`unitTest                                      http://localhost:8080/tfs/defaultcollection   TFS2017 OnPremise`, spy.getCall(2).args[0]);
            assert.equal(`http://192.168.1.3:8080/tfs/defaultcollection http://192.168.1.3:8080/tfs/defaultcollection TFS2017 Pat`, spy.getCall(3).args[0]);
            assert.equal(`test                                          https://test.visualstudio.com                 VSTS    Pat`, spy.getCall(4).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);
         });
   });
});

describe(`profile:index cmdLine`, function () {
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
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns(profiles);
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.readFileSync.restore();

            assert.equal(6, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`\r\nName                                          URL                                           Version Type`, spy.getCall(0).args[0]);
            assert.equal(`----                                          ---                                           ------- ----`, spy.getCall(1).args[0]);
            assert.equal(`unitTest                                      http://localhost:8080/tfs/defaultcollection   TFS2017 OnPremise`, spy.getCall(2).args[0]);
            assert.equal(`http://192.168.1.3:8080/tfs/defaultcollection http://192.168.1.3:8080/tfs/defaultcollection TFS2017 Pat`, spy.getCall(3).args[0]);
            assert.equal(`test                                          https://test.visualstudio.com                 VSTS    Pat`, spy.getCall(4).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);
         });
   });

   it(`add tfs`, function () {
      var spy;
      var fsExistsSyncStub;
      var fsWriteFileSyncStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`add`, `local`, `http://localhost:8080/tfs/DefaultCollection`, `token`, `TFS2018`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.writeFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(false);
            fsWriteFileSyncStub = sinon.stub(fs, `writeFileSync`).callsFake((file, data, options) => {
               let actual = JSON.parse(data);

               // Make sure the PAT was stored 64 bit encoded
               assert.equal(actual[0].Pat, `OnRva2Vu`);
               assert.equal(actual[0].URL, `http://localhost:8080/tfs/DefaultCollection`);
               assert.equal(actual[0].Name, `local`);
               assert.equal(actual[0].Version, `TFS2018`);
               assert.equal(actual[0].Type, `Pat`);
            });
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.writeFileSync.restore();

            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`+ Profile Added.`, spy.getCall(0).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsWriteFileSyncStub.callCount, `fs.writeFileSync was not called`);
         });
   });

   it(`add vsts`, function () {
      var spy;
      var fsExistsSyncStub;
      var fsWriteFileSyncStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`add`, `test`, `test`, `token`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.writeFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(false);
            fsWriteFileSyncStub = sinon.stub(fs, `writeFileSync`).callsFake((file, data, options) => {
               let actual = JSON.parse(data);

               // Make sure the PAT was stored 64 bit encoded
               assert.equal(actual[0].Pat, `OnRva2Vu`);
               assert.equal(actual[0].URL, `https://test.visualstudio.com`);
               assert.equal(actual[0].Name, `test`);
               assert.equal(actual[0].Version, `VSTS`);
               assert.equal(actual[0].Type, `Pat`);
            });
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.writeFileSync.restore();

            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`+ Profile Added.`, spy.getCall(0).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsWriteFileSyncStub.callCount, `fs.writeFileSync was not called`);
         });
   });

   it(`update entry`, function () {
      var spy;
      var fsExistsSyncStub;
      var fsWriteFileSyncStub;
      var fsReadFileSyncStub;

      // This test is making sure we can update an existing entry even if the 
      // casing of the URL does not match.
      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`add`, `local`, `http://192.168.1.3:8080/tfs/DefaultCollection`, `token`, `TFS2018`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(true);
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns(profiles);
            fsWriteFileSyncStub = sinon.stub(fs, `writeFileSync`).callsFake((file, data, options) => {
               let actual = JSON.parse(data);

               assert.equal(actual.length, 3);

               // Make sure the PAT was stored 64 bit encoded
               assert.equal(actual[1].Pat, `OnRva2Vu`);
               assert.equal(actual[1].URL, `http://192.168.1.3:8080/tfs/DefaultCollection`);
               assert.equal(actual[1].Name, `local`);
               assert.equal(actual[1].Version, `TFS2018`);
               assert.equal(actual[1].Type, `Pat`);
            });
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`+ Profile Added.`, spy.getCall(0).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);
            assert.equal(1, fsWriteFileSyncStub.callCount, `fs.writeFileSync was not called`);
         });
   });

   it(`delete entry`, function () {
      var spy;
      var fsExistsSyncStub;
      var fsWriteFileSyncStub;
      var fsReadFileSyncStub;

      // This should delete even if the casing does not match. 
      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`delete`, `http://192.168.1.3:8080/TFS/DefaultCollection`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(true);
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns(profiles);
            fsWriteFileSyncStub = sinon.stub(fs, `writeFileSync`).callsFake((file, data, options) => {
               let actual = JSON.parse(data);

               assert.equal(actual.length, 2);

               assert.equal(actual[0].Pat, ``);
               assert.equal(actual[0].URL, `http://localhost:8080/tfs/defaultcollection`);
               assert.equal(actual[0].Name, `unitTest`);
               assert.equal(actual[0].Version, `TFS2017`);
               assert.equal(actual[0].Type, `OnPremise`);

               assert.equal(actual[1].Pat, `OndrejR0ZHpwbDM3bXUycGt5c3hm`);
               assert.equal(actual[1].URL, `https://test.visualstudio.com`);
               assert.equal(actual[1].Name, `test`);
               assert.equal(actual[1].Version, `VSTS`);
               assert.equal(actual[1].Type, `Pat`);
            });
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`+ Profile Delete.`, spy.getCall(0).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);
            assert.equal(1, fsWriteFileSyncStub.callCount, `fs.writeFileSync was not called`);
         });
   });

   it(`delete entry from empty file`, function () {
      // This test makes sure the code will function if
      // someone tries to delete an entry in an empty file.
      var spy;
      var fsExistsSyncStub;
      var fsWriteFileSyncStub;
      var fsReadFileSyncStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`delete`, `http://192.168.1.3:8080/tfs/defaultcollection`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(true);
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns("[]");
            fsWriteFileSyncStub = sinon.stub(fs, `writeFileSync`).callsFake((file, data, options) => {
               let actual = JSON.parse(data);

               assert.equal(actual.length, 0);
            });
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`+ Profile Delete.`, spy.getCall(0).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(1, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);
            assert.equal(1, fsWriteFileSyncStub.callCount, `fs.writeFileSync was not called`);
         });
   });

   it(`delete entry with no file`, function () {
      // This test makes sure the code will function if
      // someone tries to delete an entry in an empty file.
      var spy;
      var fsExistsSyncStub;
      var fsWriteFileSyncStub;
      var fsReadFileSyncStub;

      return helpers.run(path.join(__dirname, `../../generators/profile/index`))
         .withArguments([`delete`, `http://192.168.1.3:8080/tfs/defaultcollection`])
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = spy = sinon.spy();
            fsExistsSyncStub = sinon.stub(fs, `existsSync`).returns(false);
            fsReadFileSyncStub = sinon.stub(fs, `readFileSync`).returns("[]");
            fsWriteFileSyncStub = sinon.stub(fs, `writeFileSync`).callsFake((file, data, options) => {
               let actual = JSON.parse(data);

               assert.equal(actual.length, 0);
            });
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            fs.writeFileSync.restore();

            assert.equal(1, spy.callCount, `generator.log was not called the correct number of times.`);

            assert.equal(`+ Profile Delete.`, spy.getCall(0).args[0]);

            assert.equal(1, fsExistsSyncStub.callCount, `fs.existsSync was not called`);
            assert.equal(0, fsReadFileSyncStub.callCount, `fs.readFileSync was not called`);
            assert.equal(1, fsWriteFileSyncStub.callCount, `fs.writeFileSync was not called`);
         });
   });
});