const path = require('path');
const util = require(`../app/utility`);
const generators = require('yeoman-generator');

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`applicationName`, { required: false, desc: `name of the application` });
   this.argument('installDep', { required: false, desc: 'if true dependencies are installed' });
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([{
      type: `input`,
      name: `applicationName`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: function () {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      type: `list`,
      name: `installDep`,
      store: true,
      message: "Install dependencies?",
      default: `false`,
      choices: [
         {
            name: `Yes`,
            value: `true`
         },
         {
            name: `No`,
            value: `false`
         }
      ],
      when: function () {
         return cmdLnInput.installDep === undefined;
      }
   }]).then(function (a) {
      // Transfer answers to local object for use in the rest of the generator
      this.installDep = util.reconcileValue(a.installDep, cmdLnInput.installDep);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName);
   }.bind(this));
}

function writeFiles() {
   var tokens = {
      name: this.applicationName,
      name_lowercase: this.applicationName.toLowerCase(),
   };

   var src = this.sourceRoot();
   var root = this.applicationName;

   // Root files
   this.copy(`${src}/.bowerrc`, `${root}/.bowerrc`);
   this.copy(`${src}/README.md`, `${root}/README.md`);
   this.copy(`${src}/gitignore`, `${root}/.gitignore`);
   this.fs.copyTpl(`${src}/bower.json`, `${root}/bower.json`, tokens);
   this.fs.copyTpl(`${src}/package.json`, `${root}/package.json`, tokens);

   // Web App project
   src = `${this.sourceRoot()}/src`;
   root = `${this.applicationName}/src`;

   this.copy(`${src}/app.js`, `${root}/app.js`);
   this.copy(`${src}/web.config`, `${root}/web.config`);
   this.copy(`${src}/Dockerfile`, `${root}/Dockerfile`);
   this.copy(`${src}/parameters.xml`, `${root}/parameters.xml`);
   this.fs.copyTpl(`${src}/package.json`, `${root}/package.json`, tokens);

   this.directory(`${src}/public`, `${root}/public`);
   this.directory(`${src}/routes`, `${root}/routes`);
   this.fs.copyTpl(`${src}/server.js`, `${root}/server.js`, tokens);

   this.copy(`${src}/views/about.pug`, `${root}/views/about.pug`);
   this.copy(`${src}/views/error.pug`, `${root}/views/error.pug`);
   this.copy(`${src}/views/index.pug`, `${root}/views/index.pug`);
   this.copy(`${src}/views/contact.pug`, `${root}/views/contact.pug`);
   this.fs.copyTpl(`${src}/views/layout.pug`, `${root}/views/layout.pug`, tokens);

   // Now test project
   src = `${this.sourceRoot()}/test`;
   root = `${this.applicationName}/test`;

   this.copy(`${src}/unitTest.js`, `${root}/unitTest.js`);

   // ARM Templates
   src = `${this.sourceRoot()}/templates`;
   root = `${this.applicationName}/templates`;

   this.copy(`${src}/node_arm.json`, `${root}/website.json`);
   this.copy(`${src}/arm.parameters.json`, `${root}/website.parameters.json`);
}

function install() {
   if (this.installDep === 'true') {
      process.chdir(this.applicationName);

      this.log(`+ Running bower install`);
      // I don't want to see the output of this command
      this.spawnCommandSync('bower', ['install'], { stdio: ['pipe', 'pipe', process.stderr] });

      this.log(`+ Running npm install`);
      this.spawnCommandSync('npm', ['install'], { stdio: ['pipe', 'pipe', process.stderr] });
   }
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,
   
   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: writeFiles,
   
   // 7. Where installation are run (npm, bower)
   install: install
});