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
   this.argument(`dockerHost`, { required: false, desc: `Docker host url including port` });
   this.argument(`dockerCertPath`, { required: false, desc: `path to Docker certs folder` });
   this.argument(`dockerRegistryId`, { required: false, desc: `ID for Docker repository` });
   this.argument(`dockerRegistryEmail`, { required: false, desc: `email used with your Docker repository` });
   this.argument(`dockerPorts`, { required: false, desc: `port mapping for container and host` });
   this.argument(`dockerRegistryPassword`, { required: false, desc: `password for your Docker repository` });
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
      name: `dockerHost`,
      store: true,
      message: `What is your Docker host url and port (tcp://host:2376)?`,
      validate: util.validateDockerHost,
      when: function () {
         return cmdLnInput.dockerHost === undefined;
      }
   }, {
      type: `input`,
      name: `dockerCertPath`,
      store: true,
      message: `What is your Docker Certificate Path?`,
      validate: util.validateDockerCertificatePath,
      when: function () {
         return cmdLnInput.dockerCertPath === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryId`,
      store: true,
      message: `What is your Docker Hub ID (case sensitive)?`,
      validate: util.validateDockerHubID,
      when: function () {
         return cmdLnInput.dockerRegistryId === undefined;
      }
   }, {
      type: `password`,
      name: `dockerRegistryPassword`,
      store: false,
      message: `What is your Docker Hub password?`,
      validate: util.validateDockerHubPassword,
      when: function () {
         return cmdLnInput.dockerRegistryPassword === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryEmail`,
      store: true,
      message: `What is your Docker Hub email?`,
      validate: util.validateDockerHubEmail,
      when: function () {
         return cmdLnInput.dockerRegistryEmail === undefined;
      }
   }]).then(function (answers) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.dockerHost = util.reconcileValue(answers.dockerHost, cmdLnInput.dockerHost);
      this.dockerPorts = util.reconcileValue(answers.dockerPorts, cmdLnInput.dockerPorts);
      this.dockerCertPath = util.reconcileValue(answers.dockerCertPath, cmdLnInput.dockerCertPath);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName);
      this.dockerRegistryId = util.reconcileValue(answers.dockerRegistryId, cmdLnInput.dockerRegistryId);
      this.dockerRegistryEmail = util.reconcileValue(answers.dockerRegistryEmail, cmdLnInput.dockerRegistryEmail);
      this.dockerRegistryPassword = util.reconcileValue(answers.dockerRegistryPassword, cmdLnInput.dockerRegistryPassword);
   }.bind(this));
}

function createServiceEndpoint() {
   var done = this.async();

   // We only support Docker Hub so set the dockerRegistry to 
   // https://index.docker.io/v1/
   var registry = "https://index.docker.io/v1/";

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      dockerRegistry: registry,
      dockerHost: this.dockerHost,
      dockerPorts: this.dockerPorts,
      appName: this.applicationName,
      project: this.applicationName,
      dockerCertPath: this.dockerCertPath,
      dockerRegistryId: this.dockerRegistryId,
      dockerRegistryEmail: this.dockerRegistryEmail,
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