const path = require(`path`);
const sinon = require(`sinon`);
const assert = require(`assert`);
const helpers = require(`yeoman-test`);
const sinonTest = require(`sinon-test`);

sinon.test = sinonTest.configureTest(sinon);

describe(`git:index clone`, () => {
   let spawnStub;

   before(() => {
      return helpers.run(path.join(__dirname, `../../generators/git/index`))
         .withPrompts({
            action: `clone`,
            applicationName: `aspDemo`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`
         })
         .on(`error`, e => {
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`git clone should be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`clone`, `-q`, `http://localhost:8080/tfs/DefaultCollection/_git/aspDemo`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git clone was not called`);
   });
});

describe(`git:index commit`, () => {
   let spawnStub;

   let cleanUp = () => {
      process.chdir.restore();
   };

   before(() => {
      return helpers.run(path.join(__dirname, `../../generators/git/index`))
         .withPrompts({
            action: `commit`,
            applicationName: `aspDemo`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
            sinon.stub(process, `chdir`);
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`git clone should not be called`, () => {
      assert.equal(0, spawnStub.withArgs(`git`, [`clone`, `-q`, `http://localhost:8080/tfs/DefaultCollection/_git/aspDemo`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git clone was called`);
   });

   it(`git config email should be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.email`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config email was not called`);
   });

   it(`git config name should be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.name`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config name was not called`);
   });

   it(`git commit should be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`commit`, `-q`, `-m`, `Init`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git commit was not called`);
   });
});

describe(`git:index all`, () => {
   let spawnStub;

   let cleanUp = () => {
      process.chdir.restore();
   };

   before(() => {
      return helpers.run(path.join(__dirname, `../../generators/git/index`))
         .withPrompts({
            action: `all`,
            applicationName: `aspDemo`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
            sinon.stub(process, `chdir`);
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`git clone should not be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`clone`, `-q`, `http://localhost:8080/tfs/DefaultCollection/_git/aspDemo`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git clone was not called`);
   });

   it(`git config email should be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.email`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config email was not called`);
   });

   it(`git config name should be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`config`, `user.name`, `yo team`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git config name was not called`);
   });

   it(`git commit should be called`, () => {
      assert.equal(1, spawnStub.withArgs(`git`, [`commit`, `-q`, `-m`, `Init`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `git commit was not called`);
   });
});