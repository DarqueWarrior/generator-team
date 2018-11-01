const fs = require(`fs`);
const path = require(`path`);
const uuidV4 = require('uuid/v4');
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
      argUtils.applicationName(this);
      argUtils.tfs(this);
      argUtils.gitAction(this);
      argUtils.pat(this);
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
         prompts.applicationName(this),
         prompts.gitAction(this)
      ]).then(function (answers) {
         // Transfer answers to local object for use in the rest of the generator
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.action = util.reconcileValue(cmdLnInput.options.action, answers.action);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
      }.bind(this));
   }


   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      if (this.action === `clone` || this.action === `all`) {
         // Clone the repository of the team project so the user only has to add 
         // and commit.
         this.log.ok(`Cloning repository ${util.getFullURL(this.tfs)}/_git/${this.applicationName}`);

         // By adding the PAT right after https:// I can clone a repository without 
         // asking user for credentials 
         let url = `${util.getFullURL(this.tfs)}/_git/${this.applicationName}`;
         url = url.replace(`https://`, `https://${this.pat}@`);

         // Using a temp log file to redirect the output of the 
         // git clone command below.  If I don't do this any string
         // written will not match the format of the rest of the data.
         // This way I can output it as info using yeoman log method.
         // The temp log filename needs to be unique.  So we gen a GUID 
         // and use part of it in the name.
         let uuid = uuidV4();
         var gitLogFile = `yoTeamGitLog${uuid.substring(0, 8)}.txt`;
         var fd = fs.openSync(gitLogFile, 'w')

         this.spawnCommandSync(`git`, [`clone`, `-q`, url], {
            stdio: ['pipe', 'pipe', fd]
         });

         // Log output as info
         let output = fs.readFileSync(gitLogFile).toString().trim();

         if (output != '') {
            this.log.info(output);
         }

         fs.unlinkSync(gitLogFile);
      }
   }

   // 8. Called last, cleanup, say good bye, etc
   end() {
      if (this.action === `commit` || this.action === `all`) {
         process.chdir(path.join(this.destinationRoot(), this.applicationName));

         this.log.ok(`Adding initial files`);
         // I don`t want to see the output of this command
         this.spawnCommandSync(`git`, [`add`, `--a`], {
            stdio: ['pipe', 'pipe', process.stderr]
         });

         this.log.ok(`Configuring email and name as yo team`);
         this.spawnCommandSync(`git`, [`config`, `user.email`, `yo team`], {
            stdio: ['pipe', 'pipe', process.stderr]
         });

         this.spawnCommandSync(`git`, [`config`, `user.name`, `yo team`], {
            stdio: ['pipe', 'pipe', process.stderr]
         });

         this.log.ok(`Committing initial files`);
         this.spawnCommandSync(`git`, [`commit`, `-q`, `-m`, `Init`], {
            stdio: ['pipe', 'pipe', process.stderr]
         });

         this.log.write(`Now all you have to do is push when ready.`);
      }
   }
};