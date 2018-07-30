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
      argUtils.applicationName(this);
      argUtils.tfs(this);
      argUtils.queue(this);
      argUtils.target(this);
      argUtils.azureSub(this);
      argUtils.kubeEndpoint(this);
      argUtils.pat(this);
      argUtils.azureRegistryName(this);
      argUtils.azureRegistryResourceGroup(this);
      argUtils.imagePullSecrets(this);

      // If user is running this sub-generator, they are deploying to Kubernetes
      this.type = 'kubernetes';
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
         prompts.kubeQueue(this),
         prompts.applicationName(this),
         prompts.kubeTarget(this),
         prompts.kubeEndpointList(this),
         prompts.azureSubList(this),
         prompts.azureRegistryName(this),
         prompts.azureRegistryResourceGroup(this),
         prompts.imagePullSecrets(this)

      ]).then(function (answers) {
         // Transfer answers (answers) to global object (cmdLnInput) for use in the rest
         // of the generator
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.queue = util.reconcileValue(cmdLnInput.options.queue, answers.queue);
         this.target = util.reconcileValue(cmdLnInput.options.target, answers.target);
         this.azureSub = util.reconcileValue(cmdLnInput.options.azureSub, answers.azureSub, ``);
         this.kubeEndpoint = util.reconcileValue(cmdLnInput.option.kubeEndpoint, answers.kubeEndpoint, ``);
         this.azureRegistryName = util.reconcileValue(cmdLnInput.option.azureRegistryName, answers.azureRegistryName, ``);
         this.azureRegistryResourceGroup = util.reconcileValue(cmdLnInput.options.azureRegistryResourceGroup, answers.azureRegistryResourceGroup, ``);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName, ``);
         this.imagePullSecrets = util.reconcileValue(cmdLnInput.options.imagePullSecrets, answers.imagePullSecrets, ``);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      let acrServer = this.azureRegistryName.toLowerCase() + ".azurecr.io";
      let appName = this.applicationName;

      var tokens = {
         name: appName,
         name_lowercase: appName.toLowerCase(),
         containerRegistry: acrServer,
         imagePullSecrets: this.imagePullSecrets
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

      let appName = this.applicationName;
      let _this = this;

      app.createArm(this.tfs, this.azureSub, this.pat, this, appName)
      .then(
         function(result) {
            let sub = result.sub;
            let endpointId = result.endpointId;

            _this.azureSub = sub.name;
            _this.azureSubId = sub.id;
            _this.tenantId = sub.tenantId;
            _this.serviceEndpointId = endpointId;

            if (_this.target === 'acs') {
               app.acsExtensionsCheckOrInstall(_this.tfs, _this.pat);
   
               // Based on the users answers compose all the required generators.
               compose.addBuild(_this);
               compose.addRelease(_this);
            }
            else {
               app.getKubeInfo(appName, _this.tfs, _this.pat, _this.serviceEndpointId, _this.kubeEndpoint, _this, function(error, kubeInfo) {
                  if (error) {
                     console.log(error);
                  }
                  else {
                     _this.kubeResourceGroup = kubeInfo.resourceGroup;
                     _this.kubeName = kubeInfo.name;
                  }
      
                  // Based on the users answers compose all the required generators.
                  compose.addBuild(_this);
                  compose.addRelease(_this);
               });
            }
      },
   function(error){
      console.log(error);
   });

   }
};