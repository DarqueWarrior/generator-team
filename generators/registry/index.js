const url = require(`url`);
const path = require(`path`);
const app = require(`./app.js`);
const util = require(`../app/utility`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`applicationName`, { required: false, desc: `name of the application` });
   this.argument(`tfs`, { required: false, desc: `full tfs URL including collection or Team Services account name` });
   this.argument(`dockerRegistry`, { required: false, desc: `Server of your Docker registry` });
   this.argument(`dockerRegistryId`, { required: false, desc: `Username for Docker registry` });
   this.argument(`dockerRegistryPassword`, { required: false, desc: `password for your Docker registry` });
   this.argument(`pat`, { required: false, desc: `Personal Access Token to TFS/VSTS` });
}

// Collect any missing data from the user.
function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([{
      type: `input`,
      name: `tfs`,
      store: true,
      message: util.getInstancePrompt,
      validate: util.validateTFS,
      when: answers => {
         return cmdLnInput.tfs === undefined;
      }
   }, {
      type: `password`,
      name: `pat`,
      store: false,
      message: util.getPATPrompt,
      validate: util.validatePersonalAccessToken,
      when: answers => {
         return cmdLnInput.pat === undefined;
      }
   }, {
      type: `input`,
      name: `applicationName`,
      store: true,
      message: "What is the name of your ASP.NET application?",
      validate: util.validateApplicationName,
      when: function () {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistry`,
      default: `https://index.docker.io/v1/`,
      store: true,
      message: `What is your Docker Registry URL?`,
      validate: util.validateDockerRegistry,
      when: answers => {
         return cmdLnInput.dockerRegistry === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryId`,
      store: true,
      message: `What is your Docker Registry username (case sensitive)?`,
      validate: util.validateDockerHubID,
      when: function () {
         return cmdLnInput.dockerRegistryId === undefined;
      }
   }, {
      type: `password`,
      name: `dockerRegistryPassword`,
      store: false,
      message: `What is your Docker Registry password?`,
      validate: util.validateDockerHubPassword,
      when: function () {
         return cmdLnInput.dockerRegistryPassword === undefined;
      }
   }]).then(function (answers) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.dockerRegistry = util.reconcileValue(answers.dockerRegistry, cmdLnInput.dockerRegistry);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName);
      this.dockerRegistryId = util.reconcileValue(answers.dockerRegistryId, cmdLnInput.dockerRegistryId);
      this.dockerRegistryPassword = util.reconcileValue(answers.dockerRegistryPassword, cmdLnInput.dockerRegistryPassword);
   }.bind(this));
}

function createServiceEndpoint() {
   var done = this.async();

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      appName: this.applicationName,
      project: this.applicationName,
      dockerRegistry: this.dockerRegistry,
      dockerRegistryId: this.dockerRegistryId,
      dockerRegistryPassword: this.dockerRegistryPassword
   };

   app.run(args, this, done);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,
   
   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: createServiceEndpoint
});