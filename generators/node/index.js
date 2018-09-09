const uuidV4 = require('uuid/v4');
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.applicationName(this);
      argUtils.installDep(this);
      argUtils.dockerPorts(this);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      return this.prompt([
         prompts.applicationName(this),
         prompts.installDep(this),
         prompts.dockerPorts(this)
      ]).then(function (answers) {
         // Transfer answers to local object for use in the rest of the generator
         this.installDep = util.reconcileValue(cmdLnInput.options.installDep, answers.installDep);
         this.dockerPorts = util.reconcileValue(cmdLnInput.options.dockerPorts, answers.dockerPorts, ``);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      var tokens = {
         name: this.applicationName,
         port: this.dockerPorts.split(':')[0],
         name_lowercase: this.applicationName.toLowerCase(),
         webtest_guid: uuidV4()
      };

      var src = this.sourceRoot();
      var root = this.applicationName;

      // Root files
      this.fs.copy(`${src}/.bowerrc`, `${root}/.bowerrc`);
      this.fs.copy(`${src}/README.md`, `${root}/README.md`);
      this.fs.copy(`${src}/gitignore`, `${root}/.gitignore`);
      this.fs.copyTpl(`${src}/bower.json`, `${root}/bower.json`, tokens);
      this.fs.copyTpl(`${src}/package.json`, `${root}/package.json`, tokens);

      // Web App project
      src = `${this.sourceRoot()}/src`;
      root = `${this.applicationName}/src`;

      this.fs.copy(`${src}/app.js`, `${root}/app.js`);
      this.fs.copy(`${src}/utility.js`, `${root}/utility.js`);
      this.fs.copy(`${src}/web.config`, `${root}/web.config`);
      this.fs.copy(`${src}/Dockerfile`, `${root}/Dockerfile`);
      this.fs.copy(`${src}/parameters.xml`, `${root}/parameters.xml`);
      this.fs.copyTpl(`${src}/package.json`, `${root}/package.json`, tokens);

      this.fs.copy(`${src}/public`, `${root}/public`);
      this.fs.copy(`${src}/routes`, `${root}/routes`);
      this.fs.copyTpl(`${src}/server.js`, `${root}/server.js`, tokens);

      this.fs.copy(`${src}/views/about.pug`, `${root}/views/about.pug`);
      this.fs.copy(`${src}/views/error.pug`, `${root}/views/error.pug`);
      this.fs.copy(`${src}/views/index.pug`, `${root}/views/index.pug`);
      this.fs.copy(`${src}/views/contact.pug`, `${root}/views/contact.pug`);
      this.fs.copyTpl(`${src}/views/layout.pug`, `${root}/views/layout.pug`, tokens);

      // Now test project
      src = `${this.sourceRoot()}/test`;
      root = `${this.applicationName}/test`;

      this.fs.copy(`${src}/unitTest.js`, `${root}/unitTest.js`);

      // ARM Templates
      src = `${this.sourceRoot()}/templates`;
      root = `${this.applicationName}/templates`;

      this.fs.copyTpl(`${src}/node_arm.json`, `${root}/website.json`, tokens);
      this.fs.copy(`${src}/arm.parameters.json`, `${root}/website.parameters.json`);

      this.fs.copy(`${src}/acilinux_arm.json`, `${root}/acilinux.json`);
      this.fs.copyTpl(`${src}/acilinux_arm.parameters.json`, `${root}/acilinux.parameters.json`, tokens);

      this.fs.copy(`${src}/docker_arm.json`, `${root}/docker.json`);
      this.fs.copy(`${src}/docker_arm.parameters.json`, `${root}/docker.parameters.json`);
   }

   // 7. Where installation are run (npm, bower)
   install() {
      if (this.installDep === 'true') {
         process.chdir(this.applicationName);

         this.log.ok(`Running bower install`);
         // I don't want to see the output of this command
         this.spawnCommandSync('bower', ['install'], {
            stdio: ['pipe', 'pipe', process.stderr]
         });

         this.log.ok(`Running npm install`);
         this.spawnCommandSync('npm', ['install'], {
            stdio: ['pipe', 'pipe', process.stderr]
         });
      }
   }
};