const path = require(`path`);
const app = require(`./app`);
const util = require(`../app/utility`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`applicationName`, { required: false, desc: `name of the application` });
   this.argument(`tfs`, { required: false, desc: `full tfs URL including collection or Team Services account name` });
   this.argument(`pat`, { required: false, desc: `Personal Access Token to TFS/VSTS` });
}

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
      when: () => {
         return cmdLnInput.tfs === undefined;
      }
   }, {
      type: `password`,
      name: `pat`,
      store: false,
      message: util.getPATPrompt,
      validate: util.validatePersonalAccessToken,
      when: () => {
         return cmdLnInput.pat === undefined;
      }
   }, {
      type: `input`,
      name: `applicationName`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: () => {
         return cmdLnInput.applicationName === undefined;
      }
   }]).then(function (answers) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName);
   }.bind(this));
}

function createProject() {
   app.run(this, this.async());
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: createProject
});