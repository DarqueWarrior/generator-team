// region require
const util = require(`./_util`);
const uuidV4 = require('uuid/v4');
const vsts = require(`./_index`);
const env = require('node-env-file');
const assert = require(`yeoman-assert`);
const exec = require('child_process').exec;
// endregion

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname  +  '/.env', {
   raise: false,
   overwrite: true
});

const pat = process.env.PAT;
const acct = process.env.ACCT;
const dockerHost = process.env.DOCKER_HOST;
const dockerRegistry = process.env.DOCKER_REGISTRY;
const dockerRegistryUsername = process.env.DOCKER_REGISTRY_USERNAME;

describe(`Testing PaaS builds`, function () {
   "use strict";

   let uuid = uuidV4();

   var iterations = [{
      appType: `asp`,
      target: `paas`,
      suffix: ``
   }, {
      appType: `java`,
      target: `paas`,
      suffix: ``
   }, {
      appType: `node`,
      target: `paas`,
      suffix: ``
   }, {
      appType: `aspFull`,
      target: `paas`,
      suffix: ``
   }];

   var projectId;
   var expectedName;
   var buildDefinitionId;
   var projectName = `buildTest${uuid.substring(0, 8)}`;

   // Arguments
   var queue;
   var dockerRegistryId;

   context(`Creating Project`, function () {
      before(function (done) {
         // runs before all tests in this block
         util.log(`creating project: ${projectName}`);
         vsts.createProject(acct, projectName, pat, `yo Team`, function (e, body) {
            if (!e) {
               projectId = body.id;
            }
            done(e);
         });
      });

      iterations.forEach(function (iteration) {

         context(`Creating ${iteration.appType} build`, function () {

            it(`${iteration.appType} - ${projectName}${iteration.suffix}-CI build should be created`, function (done) {
               // Arrange
               expectedName = `${projectName}${iteration.suffix}-CI`;

               queue = `default`;
               dockerRegistryId = ``;

               // Act
               let cmd = `yo team:build ${iteration.appType} ${projectName} ${acct} ${queue} ${iteration.target} '${dockerHost}' '${dockerRegistry}' '${dockerRegistryId}' ${pat}`;

               util.log(`run command: ${cmd}`);

               exec(cmd, function (error, stdout, stderr) {
                  util.log(`stdout: ${stdout}`);
                  util.log(`stderr: ${stderr}`);

                  if (error) {
                     assert.fail(error);
                  }

                  // Assert
                  // Test to see if build was created
                  vsts.findBuildDefinition(acct, projectId, pat, expectedName, `yo Team`, function (e, bld) {
                     assert.ifError(e);
                     assert.ok(bld, `Build not created`);
                     buildDefinitionId = bld.id;
                     done(e);
                  });
               });
            });

            afterEach(function (done) {
               // runs after each test in this block
               util.log(`deleting build: ${buildDefinitionId}`);
               vsts.deleteBuildDefinition(acct, projectId, buildDefinitionId, pat, `yo team`, function (e) {
                  done(e);
               });
            });
         });
      });

      after(function (done) {
         // runs after all tests in this block
         vsts.deleteProject(acct, projectId, pat, `yo team`, function (e) {
            done(e);
         });
      });
   });
});

describe(`Testing Docker builds without Docker service endpoint`, function () {
   "use strict";

   let uuid = uuidV4();

   var iterations = [{
      appType: `asp`,
      target: `docker`,
      suffix: `-Docker`
   }, {
      appType: `java`,
      target: `docker`,
      suffix: `-Docker`
   }, {
      appType: `node`,
      target: `docker`,
      suffix: `-Docker`
   }, {
      appType: `asp`,
      target: `acilinux`,
      suffix: `-Docker`
   }, {
      appType: `java`,
      target: `acilinux`,
      suffix: `-Docker`
   }, {
      appType: `node`,
      target: `acilinux`,
      suffix: `-Docker`
   }, {
      appType: `asp`,
      target: `dockerpaas`,
      suffix: `-Docker`
   }, {
      appType: `java`,
      target: `dockerpaas`,
      suffix: `-Docker`
   }, {
      appType: `node`,
      target: `dockerpaas`,
      suffix: `-Docker`
   }];

   var projectId;
   var expectedName;
   var buildDefinitionId;
   var projectName = `buildTest${uuid.substring(0, 8)}`;

   // Arguments
   var queue;
   var dockerRegistryId;

   context(`Creating Project`, function () {
      before(function (done) {
         // runs before all tests in this block
         util.log(`creating project: ${projectName}`);
         vsts.createProject(acct, projectName, pat, `yo Team`, function (e, body) {
            if (!e) {
               projectId = body.id;
            }
            done(e);
         });
      });

      iterations.forEach(function (iteration) {
         context(`Creating ${iteration.appType} build targeting ${iteration.target} with Default queue`, function () {

            it(`${iteration.appType} - ${projectName}${iteration.suffix}-CI build should NOT be created`, function (done) {
               // Arrange
               expectedName = `${projectName}${iteration.suffix}-CI`;

               queue = `Default`;
               dockerRegistryId = ``;

               // Act
               let cmd = `yo team:build ${iteration.appType} ${projectName} ${acct} "${queue}" ${iteration.target} '${dockerHost}' '${dockerRegistry}' '${dockerRegistryId}' ${pat}`;

               util.log(`run command: ${cmd}`);

               exec(cmd, function (error, stdout, stderr) {
                  util.log(`stdout: ${stdout}`);
                  util.log(`stderr: ${stderr}`);

                  if (error) {
                     // Assert
                     // There are several conditions tested in parallel so the contents
                     // of stderr is non-deterministic so test both possible values
                     assert.ok(stderr.indexOf(`x Could not find Docker Service Endpoint`) !== -1 ||
                        stderr.indexOf(`x Could not find Docker Registry Service Endpoint`) !== -1);
                  } else {
                     assert.fail("Build was created without Docker service endpoint");
                  }

                  done();
               });
            });
         });

         // The Hosted Linux pool is only on vsts.
         // If you are using your own docker host you have to provide a service endpoint even if you 
         // are using the Linux agent.
         if (util.isVSTS(acct) && iteration.target !== `docker`) {
            context(`Creating ${iteration.appType} build targeting ${iteration.target} with Linux queue`, function () {

               it(`${iteration.appType} - ${projectName}${iteration.suffix}-CI build should NOT be created`, function (done) {
                  // Arrange
                  expectedName = `${projectName}${iteration.suffix}-CI`;

                  queue = `Hosted Linux Preview`;
                  dockerRegistryId = ``;

                  // Act
                  let cmd = `yo team:build ${iteration.appType} ${projectName} ${acct} "${queue}" ${iteration.target} "${dockerHost}" "${dockerRegistry}" "${dockerRegistryId}" ${pat}`;

                  util.log(`run command: ${cmd}`);

                  exec(cmd, function (error, stdout, stderr) {
                     util.log(`stdout: ${stdout}`);
                     util.log(`stderr: ${stderr}`);

                     if (error) {
                        // Assert
                        // There are several conditions tested in parallel so the contents
                        // of stderr is non-deterministic so test both possible values
                        assert.ok(stderr.indexOf(`x Could not find Docker Registry Service Endpoint`) !== -1);
                     } else {
                        assert.fail("Build was created without Docker service endpoint");
                     }

                     done();
                  });
               });

               afterEach(function (done) {
                  // runs after each test in this block
                  // some test make sure the build was not created in
                  // those cases buildDefinitionId will be undefined
                  if (buildDefinitionId) {
                     util.log(`deleting build: ${buildDefinitionId}`);
                     vsts.deleteBuildDefinition(acct, projectId, buildDefinitionId, pat, `yo team`, function (e) {
                        done(e);
                     });
                  } else {
                     done();
                  }
               });
            });
         }
      });

      after(function (done) {
         // runs after all tests in this block
         vsts.deleteProject(acct, projectId, pat, `yo team`, function (e) {
            done(e);
         });
      });
   });
});