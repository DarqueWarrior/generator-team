const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const assert = require(`assert`);
const helpers = require(`yeoman-test`);
const sinonTestFactory = require(`sinon-test`);

const sinonTest = sinonTestFactory(sinon);

describe(`git:index clone`, function () {
   let spawnStub;

   let cleanUp = function () {
      fs.openSync.restore();
      fs.unlinkSync.restore();
      fs.readFileSync.restore();
   };

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/git`))
         .withPrompts({
            action: `clone`,
            applicationName: `aspDemo`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
            sinon.stub(fs, 'openSync').returns(13);
            sinon.stub(fs, 'unlinkSync');
            sinon.stub(fs, 'readFileSync').returns(`Git Close Message`);
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`git clone should be called`, function () {
      // The file descriptor (fd) identifying the file on disk to write
      // the output to. In this test case it should be equal to 3
      var fd = 13;
      assert.equal(1, spawnStub.withArgs(`git`, [`clone`, `-q`, `http://localhost:8080/tfs/DefaultCollection/_git/aspDemo`], {
         stdio: ['pipe', 'pipe', fd]
      }).callCount, `git clone was not called`);
   });
});

describe(`git:index commit`, function () {
   let spawnStub;

   let cleanUp = function () {
      process.chdir.restore();
   };

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/git`))
         .withPrompts({
            action: `commit`,
            applicationName: `aspDemo`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
            sinon.stub(process, `chdir`);
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`git clone should not be called`, function () {
      // The file descriptor (fd) identifying the file on disk to write
      // the output to. In this test case it should be equal to 3
      var fd = 3;

      assert.equal(0, spawnStub.withArgs(`git`, [`clone`, `-q`, `http://localhost:8080/tfs/DefaultCollection/_git/aspDemo`], {
         stdio: ['pipe', 'pipe', fd]
      }).callCount, `git clone was called`);
   });

   it(`git config email should be called`, function () {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.email`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config email was not called`);
   });

   it(`git config name should be called`, function () {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.name`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config name was not called`);
   });

   it(`git commit should be called`, function () {
      assert.equal(1, spawnStub.withArgs(`git`, [`commit`, `-q`, `-m`, `Init`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git commit was not called`);
   });
});

describe(`git:index all`, function () {
   let spawnStub;

   let cleanUp = function () {
      process.chdir.restore();
      fs.openSync.restore();
      fs.unlinkSync.restore();
      fs.readFileSync.restore();
   };

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/git`))
         .withPrompts({
            action: `all`,
            applicationName: `aspDemo`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
            sinon.stub(process, `chdir`);
            sinon.stub(fs, 'openSync').returns(3);
            sinon.stub(fs, 'unlinkSync');
            sinon.stub(fs, 'readFileSync').returns(`Git Close Message`);
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`git clone should not be called`, function () {
      // The file descriptor (fd) identifying the file on disk to write
      // the output to. In this test case it should be equal to 3
      var fd = 3;

      assert.equal(1, spawnStub.withArgs(`git`, [`clone`, `-q`, `http://localhost:8080/tfs/DefaultCollection/_git/aspDemo`], {
         stdio: ['pipe', 'pipe', fd]
      }).callCount, `git clone was not called`);
   });

   it(`git config email should be called`, function () {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.email`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config email was not called`);
   });

   it(`git config name should be called`, function () {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.name`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config name was not called`);
   });

   it(`git commit should be called`, function () {
      assert.equal(1, spawnStub.withArgs(`git`, [`commit`, `-q`, `-m`, `Init`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git commit was not called`);
   });
});