const assert = require(`assert`);
const prompt = require(`../../generators/app/prompt`);

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
         tfs: `test`
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
         tfs: `https://test.visualstudio.com/`
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
         tfs: `http://localhost:8080/tfs/defaultcollection`
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
      var target = prompt.tfsVersion({});

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
      var target = prompt.tfsVersion({});

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
      var target = prompt.tfsVersion({});

      // Act
      var actual = target.when({
         profileCmd: `add`,
         tfs: `http://localhost:8080/tfs/defaultcollection`
      });

      // Assert
      assert.equal(expected, actual);
   });
});

describe(`app:prompt:profileName`, function () {
   it(`List from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.profileName({});

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
         profileName: `test`,
         profileCmd: `delete`
      });

      // Act
      var actual = target.when({});

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add from command line should be false`, function () {
      // Arrange
      var expected = false;
      var target = prompt.profileName({
         profileCmd: `add`,
         profileName: `test`
      });

      // Act
      var actual = target.when({});

      // Assert
      assert.equal(expected, actual);
   });

   it(`Add from prompts should be true`, function () {
      // Arrange
      var expected = true;
      var target = prompt.profileName({});

      // Act
      var actual = target.when({
         profileCmd: `add`
      });

      // Assert
      assert.equal(expected, actual);
   });
});