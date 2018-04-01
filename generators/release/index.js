const url = require(`url`);
const path = require(`path`);
const app = require(`./app.js`);
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.applicationType(this);
      argUtils.applicationName(this);
      argUtils.tfs(this);
      argUtils.queue(this);
      argUtils.target(this);
      argUtils.azureSub(this);
      argUtils.dockerHost(this);
      argUtils.dockerRegistry(this);
      argUtils.dockerRegistryId(this);
      argUtils.dockerPorts(this);
      argUtils.dockerRegistryPassword(this);
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
         prompts.dockerHost(this),
         prompts.dockerRegistry(this),
         prompts.dockerRegistryUsername(this),
         prompts.dockerRegistryPassword(this),
         prompts.dockerPorts(this)
      ]).then(function (answers) {
         // Transfer answers (a) to global object (cmdLnInput) for use in the rest
         // of the generator
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.type = util.reconcileValue(cmdLnInput.options.type, answers.type);
         this.queue = util.reconcileValue(cmdLnInput.options.queue, answers.queue);
         this.target = util.reconcileValue(cmdLnInput.options.target, answers.target);
         this.azureSub = util.reconcileValue(cmdLnInput.options.azureSub, answers.azureSub, ``);
         this.dockerHost = util.reconcileValue(cmdLnInput.options.dockerHost, answers.dockerHost, ``);
         this.dockerPorts = util.reconcileValue(cmdLnInput.options.dockerPorts, answers.dockerPorts, ``);
         this.customFolder = util.reconcileValue(cmdLnInput.options.customFolder, answers.customFolder, ``);
         this.dockerRegistry = util.reconcileValue(cmdLnInput.options.dockerRegistry, answers.dockerRegistry);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName, ``);
         this.dockerRegistryId = util.reconcileValue(cmdLnInput.options.dockerRegistryId, answers.dockerRegistryId, ``);
         this.dockerRegistryPassword = util.reconcileValue(cmdLnInput.options.dockerRegistryPassword, answers.dockerRegistryPassword, ``);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      // This will not match in callback of
      // getRelease so store it here.
      var _this = this;
      var done = this.async();

      util.supportsLoadTests(this.tfs, this.pat, function (e, supportsLoadTests) {
         _this.removeloadTest = !supportsLoadTests;

         app.getRelease(_this, function (e, result) {
         var release = '';
         var releaseName = '';
         var i = 0;
             do {
                 if(_this.type === `custom`) {
                     release = path.join(_this.customFolder, result[i]);
                 } else if (_this.type === `xamarin`){
                     releaseName = result[i][0];
                     release = _this.templatePath(result[i][1]);
                 } else {
                     release = _this.templatePath(result[i]);
                 }

                  var args = {
                     pat: _this.pat,
                     tfs: _this.tfs,
                     type: _this.type,
                     queue: _this.queue,
                     target: _this.target,
                     releaseJson: release,
                     releaseName: releaseName,
                     azureSub: _this.azureSub,
                     appName: _this.applicationName,
                     project: _this.applicationName
                  };

                  if (util.needsRegistry(_this)) {
                     args.dockerHost = _this.dockerHost;
                     args.dockerPorts = _this.dockerPorts;
                     args.dockerRegistry = _this.dockerRegistry;
                     args.dockerRegistryId = _this.dockerRegistryId;
                     args.dockerRegistryPassword = _this.dockerRegistryPassword;
                  }

                  app.run(args, _this, done);
                  i++;
            } while (result[i]);
         });
      });
   }
};