const url = require(`url`);
const yosay = require(`yosay`);
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const compose = require(`../app/compose`);
const Generator = require(`yeoman-generator`);
const app = require(`./app`);

module.exports = class extends Generator {

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
      argUtils.kubeEndpoint(this);
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

   // 2. Where you prompt users for options (where you'd call this.prompt())
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
         prompts.kubeEndpointList(this),
         prompts.azureSubList(this),
         prompts.creationMode(this)

      ]).then(function (answers) {
         // Transfer answers (answers) to global object (cmdLnInput) for use in the rest
         // of the generator
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.type = util.reconcileValue(cmdLnInput.options.type, answers.type);
         this.queue = util.reconcileValue(cmdLnInput.options.queue, answers.queue);
         this.target = util.reconcileValue(cmdLnInput.options.target, answers.target);
         this.azureSub = util.reconcileValue(cmdLnInput.options.azureSub, answers.azureSub, ``);
         this.kubeEndpoint = util.reconcileValue(cmdLnInput.option.kubeEndpoint, answers.kubeEndpoint, ``);
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

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {

      let appName = this.applicationName;

      var tokens = {
         name: appName,
         name_lowercase: this.applicationName.toLowerCase(),
         containerRegistry: this.dockerRegistry,
      };

      // Root
      this.fs.copy(this.templatePath('Dockerfile'), this.destinationPath('Dockerfile'));
      this.fs.copyTpl(this.templatePath('index.html'), this.destinationPath('index.html'), tokens);

      // Folder chart
      this.fs.copyTpl(
         this.templatePath('chart/values.yaml'),
         this.destinationPath(`chart/${appName}/values.yaml`),
         tokens
      );
      this.fs.copyTpl(
         this.templatePath('chart/Chart.yaml'),
         this.destinationPath(`chart/${appName}/Chart.yaml`),
         tokens
      );
      this.fs.copy(
         this.templatePath('chart/.helmignore'),
         this.destinationPath(`chart/${appName}/.helmignore`)
      );

      // Folder chart/templates
      this.fs.copyTpl(
         this.templatePath('chart/templates/_helpers.tpl'),
         this.destinationPath(`chart/${appName}/templates/_helpers.tpl`),
         tokens
      );
      this.fs.copyTpl(
         this.templatePath('chart/templates/configmap.yaml'),
         this.destinationPath(`chart/${appName}/templates/configmap.yaml`),
         tokens
      );
      this.fs.copyTpl(
         this.templatePath('chart/templates/deployment.yaml'),
         this.destinationPath(`chart/${appName}/templates/deployment.yaml`),
         tokens
      );
      this.fs.copyTpl(
         this.templatePath('chart/templates/service.yaml'),
         this.destinationPath(`chart/${appName}/templates/service.yaml`),
         tokens
      );
      this.fs.copyTpl(
         this.templatePath('chart/templates/NOTES.txt'),
         this.destinationPath(`chart/${appName}/templates/NOTES.txt`),
         tokens
      );
   }

   // 7. Where installation are run (npm, bower)
   install() {
      app.acsExtensionsCheckOrInstall(this.tfs, this.pat);
      app.createArm(this.tfs, this.azureSub, this.pat, this, this.applicationName, function (sub, gen, endpointId) {
         gen.azureSub = sub.name;
         gen.azureSubId = sub.id;
         gen.tenantId = sub.tenantId;
         gen.serviceEndpointId = endpointId;

         // Based on the users answers compose all the required generators.
         compose.addBuild(gen);
         compose.addRelease(gen);
      });
   }
};