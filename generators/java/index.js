const path = require('path');
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.applicationName(this);
      argUtils.groupId(this);
      argUtils.installDep(this);
      argUtils.dockerPorts(this);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      return this.prompt([
         prompts.applicationName(this),
         prompts.groupId(this),
         prompts.installDep(this),
         prompts.dockerPorts(this)
      ]).then(function (answers) {
         // Transfer answers to local object for use in the rest of the generator
         this.groupId = util.reconcileValue(cmdLnInput.options.groupId, answers.groupId);
         this.installDep = util.reconcileValue(cmdLnInput.options.installDep, answers.installDep);
         this.dockerPorts = util.reconcileValue(cmdLnInput.options.dockerPorts, answers.dockerPorts, ``);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      var tokens = {
         name: this.applicationName,
         port: this.dockerPorts.split(':')[0],
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

      this.fs.copy(`${src}/.bowerrc`, `${root}/.bowerrc`);
      this.fs.copy(`${src}/README.md`, `${root}/README.md`);
      this.fs.copy(`${src}/gitignore`, `${root}/.gitignore`);
      this.fs.copyTpl(`${src}/pom.xml`, `${root}/pom.xml`, tokens);
      this.fs.copyTpl(`${src}/Dockerfile`, `${root}/Dockerfile`, tokens);
      this.fs.copyTpl(`${src}/bower.json`, `${root}/bower.json`, tokens);
      this.fs.copy(`${src}/src/main/webapp/resources`, `${root}/src/main/webapp/resources`);
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

      this.fs.copy(`${src}/parameters.xml`, `${root}/parameters.xml`);

      this.fs.copy(`${src}/java_arm.json`, `${root}/website.json`);
      this.fs.copy(`${src}/java_arm.parameters.json`, `${root}/website.parameters.json`);

      this.fs.copy(`${src}/acilinux_arm.json`, `${root}/acilinux.json`);
      this.fs.copyTpl(`${src}/acilinux_arm.parameters.json`, `${root}/acilinux.parameters.json`, tokens);

      this.fs.copy(`${src}/aks_arm.json`, `${root}/aks.json`);
      this.fs.copyTpl(`${src}/aks_arm.parameters.json`, `${root}/aks.parameters.json`, tokens);

      this.fs.copy(`${src}/docker_arm.json`, `${root}/docker.json`);
      this.fs.copy(`${src}/docker_arm.parameters.json`, `${root}/docker.parameters.json`);
   }

   // 7. Where installation are run (npm, bower)
   install() {
      if (this.installDep === 'true') {
         process.chdir(this.applicationName);

         this.log(`+ Running bower install`);
         // I don't want to see the output of this command
         this.spawnCommandSync('bower', ['install'], {
            stdio: ['pipe', 'pipe', process.stderr]
         });
      }
   }
};