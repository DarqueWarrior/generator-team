const url = require(`url`);
const path = require(`path`);
const app = require(`./app`);
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   args.applicationType(this);
   args.applicationName(this);
   args.tfs(this);
   args.queue(this);
   args.target(this);
   args.dockerHost(this);
   args.dockerRegistry(this);
   args.dockerRegistryId(this);
   args.pat(this);
}

// Collect any missing data from the user.
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
      prompts.target(this),
      prompts.dockerHost(this),
      prompts.dockerRegistry(this),
      prompts.dockerRegistryUsername(this),
   ]).then(function (answers) {
      // Transfer answers (a) to global object (cmdLnInput) for use in the rest
      // of the generator
      // If the gave you a answer from the prompt use it. If not check the 
      // command line.  If that is blank for some return `` so code does not
      // crash with undefined later on.
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.type = util.reconcileValue(answers.type, cmdLnInput.type);
      this.queue = util.reconcileValue(answers.queue, cmdLnInput.queue);
      this.target = util.reconcileValue(answers.target, cmdLnInput.target);
      this.dockerHost = util.reconcileValue(answers.dockerHost, cmdLnInput.dockerHost, ``);
      this.dockerRegistry = util.reconcileValue(answers.dockerRegistry, cmdLnInput.dockerRegistry, ``);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName, ``);
      this.dockerRegistryId = util.reconcileValue(answers.dockerRegistryId, cmdLnInput.dockerRegistryId, ``);
   }.bind(this));
}

function configureBuild() {
   // This will not match in callback of
   // getBuild so store it here.
   var _this = this;
   var done = this.async();

   app.getBuild(this, function (e, result) {
      var build = _this.templatePath(result);

      var args = {
         pat: _this.pat,
         tfs: _this.tfs,
         buildJson: build,
         queue: _this.queue,
         target: _this.target,
         appName: _this.applicationName,
         project: _this.applicationName,
      };

      if (util.isDocker(_this.target)) {
         args.dockerHost = _this.dockerHost;
         args.dockerRegistry = _this.dockerRegistry;
         args.dockerRegistryId = _this.dockerRegistryId;
      }

      app.run(args, _this, done);
   });
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: configureBuild
});