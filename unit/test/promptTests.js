const sinon = require(`sinon`);
const assert = require(`assert`);
const sinonTestFactory = require(`sinon-test`);
const util = require(`../../generators/app/utility`);
const prompt = require(`../../generators/app/prompt`);

const sinonTest = sinonTestFactory(sinon);

describe(`app:prompt:tfsVersion`, function () {
   it(`List from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.tfsVersion({
         tfs: `test`
      });

      // Act
      var actual = target.when({
         profileCmd: `list`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Delete from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.tfsVersion({
         tfs: `test`
      });

      // Act
      var actual = target.when({
         profileCmd: `delete`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by name from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.tfsVersion({
         options: {
            tfs: `test`
         }
      });

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by full URL from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.tfsVersion({
         options: {
            tfs: `https://test.visualstudio.com/`
         }
      });

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for TFS by full URL from command line should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.tfsVersion({
         options: {
            tfs: `http://localhost:8080/tfs/defaultcollection`
         }
      });

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by name from prompts should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.tfsVersion({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `test`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by full URL from prompts should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.tfsVersion({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `https://test.visualstudio.com/`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for TFS by full URL from prompts should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.tfsVersion({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `http://localhost:8080/tfs/defaultcollection`
      });

      // Assert
      assert.equal(expected, actual);
   });
});

describe(`app:prompt:pat`, function () {
   it(`List from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.pat({
         tfs: `test`
      });

      // Act
      var actual = target.when({
         profileCmd: `list`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Delete from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.pat({
         tfs: `test`
      });

      // Act
      var actual = target.when({
         profileCmd: `delete`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by name from command line should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.pat({
         options: {
            tfs: `test`
         }
      });

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by full URL from command line should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.pat({
         options: {
            tfs: `https://test.visualstudio.com/`
         }
      });

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for TFS by full URL from command line should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.pat({
         options: {
            tfs: `http://localhost:8080/tfs/defaultcollection`
         }
      });

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by name from prompts should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.pat({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `test`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for VSTS by full URL from prompts should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.pat({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `https://test.visualstudio.com/`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for TFS by full URL from prompts should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.pat({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `http://localhost:8080/tfs/defaultcollection`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add for entry in profile from prompts should be true`, sinonTest(function () {
      // Arrange
      var expected = true;
      var target = prompt.pat({
         options: {}
      });

      let readPatFromProfileStub = this.stub(util, `readPatFromProfile`).returns(false);

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `http://localhost:8080/tfs/defaultcollection`
      });

      // Assert
      assert.equal(0, readPatFromProfileStub.callCount);
      assert.equal(expected, actual);
   }));
});

describe(`app:prompt:profileName`, function () {
   it(`List from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.profileName({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `list`
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Delete from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.profileName({
         options: {
            profileName: `test`,
            profileCmd: `delete`
         }
      });

      // Act
      var actual = target.when({
         options: {}
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.profileName({
         options: {
            profileCmd: `add`,
            profileName: `test`
         }
      });

      // Act
      var actual = target.when({
         options: {}
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add from prompts should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.profileName({
         options: {}
      });

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });
});