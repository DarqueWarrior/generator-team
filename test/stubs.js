const sinon = require(`sinon`);
const assert = require(`yeoman-assert`);
const util = require(`../generators/app/utility`);

function findBuild(expectedAccount, expectedTarget, expectedToken) {
   sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
      assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
      assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
      assert.equal(expectedToken, token, `findBuild - token is wrong`);
      assert.equal(expectedTarget, target, `findBuild - target is wrong`);

      callback(null, {
         value: "I`m a build.",
         authoredBy: {
            id: 1,
            uniqueName: `uniqueName`,
            displayName: `displayName`
         }
      });
   });
}

function findProject(expectedAccount, expectedName, expectedToken) {
   sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
      assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
      assert.equal(expectedName, project, `findProject - Project is wrong`);
      assert.equal(expectedToken, token, `findProject - Token is wrong`);

      callback(null, {
         value: "TeamProject",
         id: 1
      });
   });
}

function findQueue(expectedAccount, expectedName, expectedToken) {
   sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
      assert.equal(expectedName, name, `findQueue - name is wrong`);
      assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
      assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
      assert.equal(expectedToken, token, `findQueue - token is wrong`);

      callback(null, 1);
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require
   // it.

   findBuild: findBuild,
   findQueue: findQueue,
   findProject: findProject
};