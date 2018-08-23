// This is the main entry point of the generator.  The heavy lifting is done in the
// sub generators.  I separated them so I could compose with language generators.
const url = require(`url`);
const yosay = require(`yosay`);
const util = require(`./utility`);
const argUtils = require(`./args`);
const prompts = require(`./prompt`);
const compose = require(`../app/compose`);
const pkg = require('../../package.json');
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
      argUtils.azureSub(this);
      argUtils.azureSubId(this);
      argUtils.tenantId(this);
      argUtils.servicePrincipalId(this);
      argUtils.queue(this);
      argUtils.target(this);
      argUtils.installDep(this);
      argUtils.groupId(this);
      argUtils.dockerHost(this);
      argUtils.dockerCertPath(this);
      argUtils.dockerRegistry(this);
      argUtils.dockerRegistryId(this);
      argUtils.dockerPorts(this);
      argUtils.dockerRegistryPassword(this);
      argUtils.servicePrincipalKey(this);
      argUtils.pat(this);
      argUtils.functionName(this);
      argUtils.apiKey(this);
      argUtils.customFolder(this);
   }

   // 1. Your initialization methods (checking current project state, getting configs, etc)
   initializing() {
      // Store all the values collected from the command line so we can pass to 
      // sub generators. I also use this to determine which data I still need to
      // prompt for.

      this.log(yosay(`Welcome to DevOps powered by Microsoft version ${pkg.version}`));
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
         prompts.functionName(this),
         prompts.apiKey(this),
         prompts.dockerHost(this),
         prompts.dockerCertPath(this),
         prompts.dockerRegistry(this),
         prompts.dockerRegistryUsername(this),
         prompts.dockerRegistryPassword(this),
         prompts.dockerPorts(this),
         prompts.groupId(this),
         prompts.installDep(this)
      ]).then(function (answers) {
         // Transfer answers to global object for use in the rest of the generator

         // When passing in parameter from the command line passing in more than are 
         // needed can cause issues.  When using the prompts data is not asked for that
         // is not needed and the code works on the assumption that if you provided it
         // I needed it which is not always the case. For example, if you are using the
         // Hosted Linux queue you should not provide a Docker Host. But if you do
         // it will mess things up. So I am going to try and determine if I need to clear
         // additional information that was provided but not required. 
         if (!util.needsDockerHost(answers, cmdLnInput.options)) {
            answers.dockerHost = undefined;
            cmdLnInput.dockerHost = undefined;
         }

         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.type = util.reconcileValue(cmdLnInput.options.type, answers.type);
         this.queue = util.reconcileValue(cmdLnInput.options.queue, answers.queue);
         this.apiKey = util.reconcileValue(cmdLnInput.options.apiKey, answers.apiKey);
         this.target = util.reconcileValue(cmdLnInput.options.target, answers.target);
         this.groupId = util.reconcileValue(cmdLnInput.options.groupId, answers.groupId, ``);
         this.azureSub = util.reconcileValue(cmdLnInput.options.azureSub, answers.azureSub, ``);
         this.tenantId = util.reconcileValue(cmdLnInput.options.tenantId, answers.tenantId, ``);
         this.installDep = util.reconcileValue(cmdLnInput.options.installDep, answers.installDep);
         this.azureSubId = util.reconcileValue(cmdLnInput.options.azureSubId, answers.azureSubId, ``);
         this.dockerHost = util.reconcileValue(cmdLnInput.options.dockerHost, answers.dockerHost, ``);
         this.functionName = util.reconcileValue(cmdLnInput.options.functionName, answers.functionName);
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
      compose.addGit(this);
      compose.addNuGet(this);
      compose.addFeed(this);
      compose.addLanguage(this);
      compose.addDockerHost(this);
      compose.addRegistry(this);
      compose.addAzure(this);
      compose.addBuild(this);
      compose.addRelease(this);
      compose.addProject(this);
   }
};