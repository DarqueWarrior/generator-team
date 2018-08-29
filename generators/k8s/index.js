const app = require(`./app`);
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const compose = require(`../app/compose`);
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {

   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important
      // These are position based arguments for this generator. If they are not provided
      // via the command line they will be queried during the prompting priority
      argUtils.applicationName(this);
      // argUtils.kubeEndpoint(this);
      // argUtils.azureRegistryName(this);
      // argUtils.azureRegistryResourceGroup(this);
      // argUtils.imagePullSecrets(this);
      // argUtils.kubeName(this);
      // argUtils.kubeResourceGroup(this);
      // argUtils.kubeConfig(this);

      // If user is running this sub-generator, they are deploying to Kubernetes
      this.target = 'k8s';
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      return this.prompt([
         // prompts.kubeQueue(this),
         prompts.applicationName(this),
         // prompts.kubeTarget(this),
         // prompts.azureRegistryName(this),
         // prompts.azureRegistryResourceGroup(this),
         // prompts.imagePullSecrets(this),
         // prompts.kubeName(this),
         // prompts.kubeResourceGroup(this), // kubeResourceGroup can be parsed from the user field in "parseKubeConfig", feature to be added later
         // prompts.kubeConfig(this)
      ]).then(function (answers) {
         // Transfer answers (answers) to global object (cmdLnInput) for use in the rest
         // of the generator
         // this.azureRegistryName = util.reconcileValue(cmdLnInput.option.azureRegistryName, answers.azureRegistryName, ``);
         // this.azureRegistryResourceGroup = util.reconcileValue(cmdLnInput.options.azureRegistryResourceGroup, answers.azureRegistryResourceGroup, ``);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName, ``);
         // this.imagePullSecrets = util.reconcileValue(cmdLnInput.options.imagePullSecrets, answers.imagePullSecrets, ``);
         // this.kubeName = util.reconcileValue(cmdLnInput.options.kubeName, answers.kubeName, ``);
         // this.kubeResourceGroup = util.reconcileValue(cmdLnInput.options.kubeResourceGroup, answers.kubeResourceGroup, ``);
         // this.kubeConfig = util.reconcileValue(cmdLnInput.option.kubeConfig, answers.kubeConfig, ``);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      // let acrServer = this.azureRegistryName.toLowerCase() + ".azurecr.io";
      
      var tokens = {
         imagePullSecrets: 'Temp',
         containerRegistry: 'Temp',
         name: this.applicationName,
         name_lowercase: this.applicationName.toLowerCase()
      };

      var src = `${this.sourceRoot()}/chart`;
      var root = `${this.applicationName}/chart/${this.applicationName}`;

      // Folder chart
      this.fs.copyTpl(`${src}/values.yaml`, `${root}/values.yaml`, tokens);
      this.fs.copyTpl(`${src}/Chart.yaml`, `${root}/Chart.yaml`, tokens);
      this.fs.copy(`${src}/.helmignore`,  `${root}/.helmignore`);

      src += '/templates';
      root += '/templates';

      // Folder chart/templates
      this.fs.copyTpl(`${src}/_helpers.tpl`, `${root}/_helpers.tpl`, tokens);
      this.fs.copyTpl(`${src}/configmap.yaml`, `${root}/configmap.yaml`, tokens);
      this.fs.copyTpl(`${src}/deployment.yaml`, `${root}/deployment.yaml`, tokens);
      this.fs.copyTpl(`${src}/service.yaml`, `${root}/service.yaml`, tokens);
      this.fs.copyTpl(`${src}/NOTES.txt`, `${root}/NOTES.txt`, tokens);
   }
};