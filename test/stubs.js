const sinon = require(`sinon`);
const assert = require(`yeoman-assert`);
const util = require(`../generators/app/utility`);

function tryFindRelease(expectedAccount, expectedTarget, expectedToken, context) {
   if (context === undefined) {
      context = sinon;
   }

   context.stub(util, `tryFindRelease`).callsFake((args, callback) => {
      assert.equal(expectedAccount, args.account, `tryFindRelease - Account is wrong`);
      assert.equal(1, args.teamProject.id, `tryFindRelease - team project is wrong`);
      assert.equal(expectedToken, args.token, `tryFindRelease - token is wrong`);
      assert.equal(expectedTarget, args.target, `tryFindRelease - target is wrong`);

      callback(null, {
         value: "I`m a release."
      });
   });
}

function findBuild(expectedAccount, expectedTarget, expectedToken, context) {
   if (context === undefined) {
      context = sinon;
   }

   context.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
      assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
      assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
      assert.equal(expectedToken, token, `findBuild - token is wrong`);
      assert.equal(expectedTarget, target, `findBuild - target is wrong`);

      callback(null, {
         value: "I`m a build.",
         id: 1,
         authoredBy: {
            id: 1,
            displayName: `displayName`,
            uniqueName: `uniqueName`
         }
      });
   });
}

function findProject(expectedAccount, expectedName, expectedToken, context) {
   if (context === undefined) {
      context = sinon;
   }

   context.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
      assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
      assert.equal(expectedName, project, `findProject - Project is wrong`);
      assert.equal(expectedToken, token, `findProject - Token is wrong`);

      callback(null, {
         value: "TeamProject",
         id: 1
      });
   });
}

function findQueue(expectedAccount, expectedName, expectedToken, context) {
   if (context === undefined) {
      context = sinon;
   }

   context.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
      assert.equal(expectedName, name, `findQueue - name is wrong`);
      assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
      assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
      assert.equal(expectedToken, token, `findQueue - token is wrong`);

      callback(null, 1);
   });
}

function findDockerRegistryServiceEndpoint(expectedAccount, expectedToken, context) {
   if (context === undefined) {
      context = sinon;
   }

   context.stub(util, `findDockerRegistryServiceEndpoint`).callsFake((account, projectId, dockerRegistry, token, callback) => {
      assert.equal(expectedAccount, account, `findDockerRegistryServiceEndpoint - Account is wrong`);
      assert.equal(1, projectId, `findDockerRegistryServiceEndpoint - team project is wrong`);
      assert.equal(expectedToken, token, `findDockerRegistryServiceEndpoint - token is wrong`);

      callback(null, {
         name: `endpoint`,
         id: 1
      });
   });
}

function findDockerServiceEndpoint(expectedAccount, expectedToken, context) {
   if (context === undefined) {
      context = sinon;
   }

   context.stub(util, `findDockerServiceEndpoint`).callsFake((account, projectId, dockerHost, token, gen, callback) => {
      assert.equal(expectedAccount, account, `findDockerServiceEndpoint - Account is wrong`);
      assert.equal(1, projectId, `findDockerServiceEndpoint - team project is wrong`);
      assert.equal(expectedToken, token, `findDockerServiceEndpoint - token is wrong`);

      callback(null, {
         name: `endpoint`,
         id: 1
      });
   });
}

// Context points to this when the test is wrapped with sinon.test
function findAzureServiceEndpoint(expectedAccount, expectedName, expectedToken, context) {
   if (context === undefined) {
      context = sinon;
   }

   context.stub(util, `findAzureServiceEndpoint`).callsFake((account, projectId, sub, token, gen, callback) => {
      assert.equal(expectedAccount, account, `findAzureServiceEndpoint - Account is wrong`);
      assert.equal(1, projectId, `findAzureServiceEndpoint - team project is wrong`);
      assert.equal(expectedToken, token, `findAzureServiceEndpoint - token is wrong`);
      assert.equal(expectedName, sub.name, `findAzureServiceEndpoint - sub is wrong`);

      callback(null, {
         name: `endpoint`,
         id: 1
      });
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require
   // it.

   findBuild: findBuild,
   findQueue: findQueue,
   findProject: findProject,
   tryFindRelease: tryFindRelease,
   findAzureServiceEndpoint: findAzureServiceEndpoint,
   findDockerServiceEndpoint: findDockerServiceEndpoint,
   findDockerRegistryServiceEndpoint: findDockerRegistryServiceEndpoint
};