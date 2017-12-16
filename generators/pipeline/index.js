// All this generator does is compose the others to build just a pipeline.
// This will be helpful if you already have a project and just want the CI/CD
// setup for it.  Or you ran yo tfs once and want to add an additional pipeline.
const url = require(`url`);
const yosay = require(`yosay`);
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const compose = require(`../app/compose`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important
   // These are position based arguments for this generator. If they are not provided
   // via the command line they will be queried during the prompting priority
   args.applicationType(this);
   args.applicationName(this);
   args.tfs(this);
   args.queue(this);
   args.target(this);
   args.azureSub(this);
   args.azureSubId(this);
   args.tenantId(this);
   args.servicePrincipalId(this);
   args.dockerHost(this);
   args.dockerCertPath(this);
   args.dockerRegistry(this);
   args.dockerRegistryId(this);
   args.dockerPorts(this);
   args.dockerRegistryPassword(this);
   args.servicePrincipalKey(this);
   args.pat(this);
   args.customFolder(this);  
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([
      prompts.tfs(this),
      prompts.pat(this),
      prompts.queue(this),
      prompts.applicationType(this),
      prompts.applicationName(this),
      prompts.customFolder(this),      
      prompts.target(this),
      prompts.azureSubInput(this),
      prompts.azureSubList(this),
      prompts.azureSubId(this),
      prompts.tenantId(this),
      prompts.servicePrincipalId(this),
      prompts.servicePrincipalKey(this),
      prompts.dockerHost(this),
      prompts.dockerCertPath(this),
      prompts.dockerRegistry(this),
      prompts.dockerRegistryUsername(this),
      prompts.dockerRegistryPassword(this),
      prompts.dockerPorts(this),
   ]).then(function (answers) {
      // Transfer answers (answers) to global object (cmdLnInput) for use in the rest
      // of the generator
      this.pat = util.reconcileValue(cmdLnInput.pat, answers.pat);
      this.tfs = util.reconcileValue(cmdLnInput.tfs, answers.tfs);
      this.type = util.reconcileValue(cmdLnInput.type, answers.type);
      this.queue = util.reconcileValue(cmdLnInput.queue, answers.queue);
      this.target = util.reconcileValue(cmdLnInput.target, answers.target);
      this.azureSub = util.reconcileValue(cmdLnInput.azureSub, answers.azureSub, ``);
      this.tenantId = util.reconcileValue(cmdLnInput.tenantId, answers.tenantId, ``);
      this.azureSubId = util.reconcileValue(cmdLnInput.azureSubId, answers.azureSubId, ``);
      this.dockerHost = util.reconcileValue(cmdLnInput.dockerHost, answers.dockerHost, ``);
      this.dockerPorts = util.reconcileValue(cmdLnInput.dockerPorts, answers.dockerPorts, ``);
      this.customFolder = util.reconcileValue(cmdLnInput.customFolder, answers.customFolder, ``);
      this.dockerRegistry = util.reconcileValue(cmdLnInput.dockerRegistry, answers.dockerRegistry, ``);
      this.dockerCertPath = util.reconcileValue(cmdLnInput.dockerCertPath, answers.dockerCertPath, ``);
      this.applicationName = util.reconcileValue(cmdLnInput.applicationName, answers.applicationName, ``);
      this.dockerRegistryId = util.reconcileValue(cmdLnInput.dockerRegistryId, answers.dockerRegistryId, ``);
      this.servicePrincipalId = util.reconcileValue(cmdLnInput.servicePrincipalId, answers.servicePrincipalId, ``);
      this.servicePrincipalKey = util.reconcileValue(cmdLnInput.servicePrincipalKey, answers.servicePrincipalKey, ``);
      this.dockerRegistryPassword = util.reconcileValue(cmdLnInput.dockerRegistryPassword, answers.dockerRegistryPassword, ``);
   }.bind(this));
}

function configGenerators() {
   // Based on the users answers compose all the required generators.
   compose.addDockerHost(this);
   compose.addRegistry(this);
   compose.addAzure(this);
   compose.addBuild(this);
   compose.addRelease(this);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: configGenerators
});