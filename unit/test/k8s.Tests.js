const path = require(`path`);
const sinon = require(`sinon`);
const fs = require(`fs-extra`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`team:k8s`, function () {
   var spawnStub;

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/k8s`))
         .withArguments([`k8sTest`, `DockerRegistry`, `DockerRegistryId`, `3000`, `pullSecret`])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`files should be generated`, function () {
      assert.file([
         `k8sTest/chart/k8sTest/values.yaml`,
         `k8sTest/chart/k8sTest/Chart.yaml`,
         `k8sTest/chart/k8sTest/.helmignore`,
         `k8sTest/chart/k8sTest/templates/_helpers.tpl`,
         `k8sTest/chart/k8sTest/templates/configmap.yaml`,
         `k8sTest/chart/k8sTest/templates/deployment.yaml`,
         `k8sTest/chart/k8sTest/templates/service.yaml`,
         `k8sTest/chart/k8sTest/templates/NOTES.txt`
      ]);

      assert.fileContent(`k8sTest/chart/k8sTest/values.yaml`, `imageName: k8stest`);
      assert.fileContent(`k8sTest/chart/k8sTest/values.yaml`, `port: 3000`);
      assert.fileContent(`k8sTest/chart/k8sTest/Chart.yaml`, `name: k8sTest`);
      assert.fileContent(`k8sTest/chart/k8sTest/templates/_helpers.tpl`, `define "k8sTest.name"`);
      assert.fileContent(`k8sTest/chart/k8sTest/templates/configmap.yaml`, `myvalue: k8sTest`);
      assert.fileContent(`k8sTest/chart/k8sTest/templates/deployment.yaml`, `containerPort: 3000`);
      assert.fileContent(`k8sTest/chart/k8sTest/templates/deployment.yaml`, `template "k8sTest.fullname"`);
      assert.fileContent(`k8sTest/chart/k8sTest/templates/service.yaml`, `template "k8sTest.fullname"`);
      assert.fileContent(`k8sTest/chart/k8sTest/templates/NOTES.txt`, `template "k8sTest.fullname"`);
   });
});