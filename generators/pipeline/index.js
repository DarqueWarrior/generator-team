// All this generator does is compose the others to build just a pipeline.
// This will be helpful if you already have a project and just want the CI/CD
// setup for it.  Or you ran yo tfs once and want to add an additional pipeline.
const url = require(`url`);
const yosay = require(`yosay`);
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const compose = require(`../app/compose`);
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important
      // These are position based arguments for this generator. If they are not provided
      // via the command line they will be queried during the prompting priority
      argUtils.applicationType(this);
      argUtils.applicationName(this);
      argUtils.tfs(this);
      argUtils.queue(this);
      argUtils.target(this);
      argUtils.azureSub(this);
      argUtils.azureSubId(this);
      argUtils.tenantId(this);
      argUtils.servicePrincipalId(this);
      argUtils.dockerHost(this);
      argUtils.dockerCertPath(this);
      argUtils.dockerRegistry(this);
      argUtils.dockerRegistryId(this);
      argUtils.dockerPorts(this);
      argUtils.dockerRegistryPassword(this);
      argUtils.servicePrincipalKey(this);
      argUtils.pat(this);
      argUtils.customFolder(this);
   }

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting() {
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
         prompts.creationMode(this),
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
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.type = util.reconcileValue(cmdLnInput.options.type, answers.type);
         this.queue = util.reconcileValue(cmdLnInput.options.queue, answers.queue);
         this.target = util.reconcileValue(cmdLnInput.options.target, answers.target);
         this.azureSub = util.reconcileValue(cmdLnInput.options.azureSub, answers.azureSub, ``);
         this.tenantId = util.reconcileValue(cmdLnInput.options.tenantId, answers.tenantId, ``);
         this.azureSubId = util.reconcileValue(cmdLnInput.options.azureSubId, answers.azureSubId, ``);
         this.dockerHost = util.reconcileValue(cmdLnInput.options.dockerHost, answers.dockerHost, ``);
         this.dockerPorts = util.reconcileValue(cmdLnInput.options.dockerPorts, answers.dockerPorts, ``);
         this.customFolder = util.reconcileValue(cmdLnInput.options.customFolder, answers.customFolder, ``);
         this.dockerRegistry = util.reconcileValue(cmdLnInput.options.dockerRegistry, answers.dockerRegistry, ``);
         this.dockerCertPath = util.reconcileValue(cmdLnInput.options.dockerCertPath, answers.dockerCertPath, ``);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName, ``);
         this.dockerRegistryId = util.reconcileValue(cmdLnInput.options.dockerRegistryId, answers.dockerRegistryId, ``);
         this.servicePrincipalId = util.reconcileValue(cmdLnInput.options.servicePrincipalId, answers.servicePrincipalId, ``);
         this.servicePrincipalKey = util.reconcileValue(cmdLnInput.options.servicePrincipalKey, answers.servicePrincipalKey, ``);
         this.dockerRegistryPassword = util.reconcileValue(cmdLnInput.options.dockerRegistryPassword, answers.dockerRegistryPassword, ``);
      }.bind(this));
   }

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring() {
      // Based on the users answers compose all the required generators.
      compose.addDockerHost(this);
      compose.addRegistry(this);
      compose.addAzure(this);
      compose.addBuild(this);
      compose.addRelease(this);
   }
};