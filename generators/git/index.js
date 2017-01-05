const path = require(`path`);
const util = require(`../app/utility`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`applicationName`, { required: false, desc: `name of the application` });
   this.argument(`tfs`, { required: false, desc: `full tfs URL including collection or Team Services account name` });
   this.argument(`action`, { required: false, desc: `the Git action to take` });
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
   }, {
      type: `list`,
      name: `action`,
      store: false,
      message: `What Git actions would you like to take?`,
      choices: [{
         name: `Clone`,
         value: `clone`
      }, {
         name: `Add & Commit`,
         value: `commit`
      }],
      when: function () {
         return cmdLnInput.action === undefined;
      }
   }]).then(function (answers) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.action = util.reconcileValue(answers.action, cmdLnInput.action);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName);
   }.bind(this));
}

function cloneRepository() {
   if (this.action === `clone` || this.action === `all`) {
      // Clone the repository of the team project so the user only has to add 
      // and commit.
      this.log(`+ Cloning repository ${util.getFullURL(this.tfs)}/_git/${this.applicationName}`);
      this.spawnCommandSync(`git`, [`clone`, `-q`, `${util.getFullURL(this.tfs)}/_git/${this.applicationName}`], { stdio: ['pipe', 'pipe', process.stderr] });
   }
}

function commitCode() {
   if (this.action === `commit` || this.action === `all`) {
      process.chdir(path.join(this.destinationRoot(), this.applicationName));

      this.log(`+ Adding initial files`);
      // I don`t want to see the output of this command
      this.spawnCommandSync(`git`, [`add`, `--a`], { stdio: ['pipe', 'pipe', process.stderr] });

      this.log(`+ Committing initial files`);
      this.spawnCommandSync(`git`, [`commit`, `-q`, `-m`, `Init`], { stdio: ['pipe', 'pipe', process.stderr] });

      this.log(`= Now all you have to do is push when ready`);
   }
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: cloneRepository,

   // 8. Called last, cleanup, say good bye, etc
   end: commitCode
});