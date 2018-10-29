const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {

   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important
      // These are position based arguments for this generator. If they are not provided
      // via the command line they will be queried during the prompting priority
      argUtils.applicationName(this);
      argUtils.dockerRegistry(this);
      argUtils.dockerRegistryId(this);
      argUtils.dockerPorts(this);
      argUtils.imagePullSecret(this);

      // If user is running this sub-generator, they are deploying to Kubernetes
      //this.target = 'k8s';
      this.options.target = 'k8s';
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      return this.prompt([
         prompts.applicationName(this),
         prompts.dockerRegistry(this),
         prompts.dockerRegistryUsername(this),
         prompts.dockerPorts(this),
         prompts.imagePullSecret(this)
      ]).then(function (answers) {
         // Transfer answers (answers) to global object (cmdLnInput) for use in the rest
         // of the generator
         this.dockerPorts = util.reconcileValue(cmdLnInput.options.dockerPorts, answers.dockerPorts, ``);
         this.dockerRegistry = util.reconcileValue(cmdLnInput.options.dockerRegistry, answers.dockerRegistry, ``);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName, ``);
         this.imagePullSecret = util.reconcileValue(cmdLnInput.options.imagePullSecret, answers.imagePullSecret, ``);
         this.dockerRegistryId = util.reconcileValue(cmdLnInput.options.dockerRegistryId, answers.dockerRegistryId, ``);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      // let acrServer = this.azureRegistryName.toLowerCase() + ".azurecr.io";

      // Qualify the image name with the dockerRegistryId for docker hub
      // or the server name for other registries. 
      let dockerNamespace = util.getImageNamespace(this.dockerRegistryId, this.dockerRegistry);

      var tokens = {
         name: this.applicationName,
         dockerPorts: this.dockerPorts,
         dockerRegistryId: dockerNamespace,
         imagePullSecret: this.imagePullSecret,
         name_lowercase: this.applicationName.toLowerCase()
      };

      var src = `${this.sourceRoot()}/chart`;
      var root = `${this.applicationName}/templates/chart`;

      // Folder chart
      this.fs.copyTpl(`${src}/values.yaml`, `${root}/values.yaml`, tokens);
      this.fs.copyTpl(`${src}/Chart.yaml`, `${root}/Chart.yaml`, tokens);
      this.fs.copy(`${src}/.helmignore`, `${root}/.helmignore`);

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