const path = require('path');
const util = require(`../app/utility`);
const generators = require('yeoman-generator');

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`applicationName`, { required: false, desc: `name of the application` });
   this.argument('groupId', { required: false, desc: 'groupId of Java project' });
   this.argument('installDep', { required: false, desc: 'if true dependencies are installed' });
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;
   
   return this.prompt([{
      type: `input`,
      name: `applicationName`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: function () {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      type: `input`,
      name: `groupId`,
      store: true,
      message: "What is your Group ID?",
      validate: util.validateGroupID,
      when: function () {
         return cmdLnInput.groupId === undefined;
      }
   }, {
      type: `list`,
      name: `installDep`,
      store: true,
      message: "Install dependencies?",
      default: `false`,
      choices: [
         {
            name: `Yes`,
            value: `true`
         },
         {
            name: `No`,
            value: `false`
         }
      ],
      when: function () {
         return cmdLnInput.installDep === undefined;
      }
   }]).then(function (a) {
      // Transfer answers to local object for use in the rest of the generator
      this.groupId = util.reconcileValue(a.groupId, cmdLnInput.groupId);
      this.installDep = util.reconcileValue(a.installDep, cmdLnInput.installDep);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName);
   }.bind(this));
}

function writeFiles() {
   var tokens = {
      name: this.applicationName,
      name_lowercase: this.applicationName.toLowerCase(),
      groupId: this.groupId,
      namespace: `${this.groupId}.${this.applicationName}`,
      tilesHeader: "<%@ taglib uri=&#39;http://tiles.apache.org/tags-tiles&#39; prefix=&#39;tiles&#39;%>"
   };

   var mainFolder = '/src/main/java/';
   var testFolder = '/src/test/java/';
   var parts = tokens.groupId.split('.');

   for (var i = 0; i < parts.length; i++) {
      mainFolder += parts[i];
      mainFolder += '/';

      testFolder += parts[i];
      testFolder += '/';
   }

   mainFolder += this.applicationName;
   testFolder += this.applicationName;

   var src = this.sourceRoot();
   var root = this.applicationName;

   this.copy(`${src}/.bowerrc`, `${root}/.bowerrc`);
   this.copy(`${src}/README.md`, `${root}/README.md`);
   this.copy(`${src}/gitignore`, `${root}/.gitignore`);
   this.fs.copyTpl(`${src}/pom.xml`, `${root}/pom.xml`, tokens);
   this.fs.copyTpl(`${src}/Dockerfile`, `${root}/Dockerfile`, tokens);
   this.fs.copyTpl(`${src}/bower.json`, `${root}/bower.json`, tokens);
   this.directory(`${src}/src/main/webapp/resources`, `${root}/src/main/webapp/resources`);
   this.fs.copyTpl(`${src}/src/main/webapp/WEB-INF/web.xml`, `${root}/src/main/webapp/WEB-INF/web.xml`, tokens);
   this.fs.copyTpl(`${src}/src/main/webapp/WEB-INF/tiles.xml`, `${root}/src/main/webapp/WEB-INF/tiles.xml`, tokens);
   this.fs.copyTpl(`${src}/src/main/webapp/WEB-INF/spring-servlet.xml`, `${root}/src/main/webapp/WEB-INF/spring-servlet.xml`, tokens);
   this.fs.copyTpl(`${src}/src/main/webapp/WEB-INF/views/home/about.jsp`, `${root}/src/main/webapp/WEB-INF/views/home/about.jsp`, tokens);
   this.fs.copyTpl(`${src}/src/main/webapp/WEB-INF/views/home/index.jsp`, `${root}/src/main/webapp/WEB-INF/views/home/index.jsp`, tokens);
   this.fs.copyTpl(`${src}/src/main/webapp/WEB-INF/views/home/contact.jsp`, `${root}/src/main/webapp/WEB-INF/views/home/contact.jsp`, tokens);
   this.fs.copyTpl(`${src}/src/main/webapp/WEB-INF/views/shared/layout.jsp`, `${root}/src/main/webapp/WEB-INF/views/shared/layout.jsp`, tokens);
   this.fs.copyTpl(`${src}/src/main/java/com/mycompany/controllers/HomeController.java`, `${root}${mainFolder}/controllers/HomeController.java`, tokens);
   this.fs.copyTpl(`${src}/src/test/java/com/mycompany/controllers/HomeControllerTest.java`, `${root}${testFolder}/controllers/HomeControllerTest.java`, tokens);

   // ARM Templates
   src = `${this.sourceRoot()}/templates`;
   root = `${this.applicationName}/templates`;

   this.copy(`${src}/parameters.xml`, `${root}/parameters.xml`);

   this.copy(`${src}/java_arm.json`, `${root}/website.json`);
   this.copy(`${src}/java_arm.parameters.json`, `${root}/website.parameters.json`);

   this.copy(`${src}/docker_arm.json`, `${root}/docker.json`);
   this.copy(`${src}/docker_arm.parameters.json`, `${root}/docker.parameters.json`);
}

function install() {
   if (this.installDep === 'true') {
      process.chdir(this.applicationName);

      this.log(`+ Running bower install`);
      // I don't want to see the output of this command
      this.spawnCommandSync('bower', ['install'], { stdio: ['pipe', 'pipe', process.stderr] });
   }
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: writeFiles, 

   // 7. Where installation are run (npm, bower)
   install: install
});