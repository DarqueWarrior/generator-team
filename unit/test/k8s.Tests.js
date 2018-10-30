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
         `k8sTest/templates/chart/values.yaml`,
         `k8sTest/templates/chart/Chart.yaml`,
         `k8sTest/templates/chart/.helmignore`,
         `k8sTest/templates/chart/templates/_helpers.tpl`,
         `k8sTest/templates/chart/templates/configmap.yaml`,
         `k8sTest/templates/chart/templates/deployment.yaml`,
         `k8sTest/templates/chart/templates/service.yaml`,
         `k8sTest/templates/chart/templates/NOTES.txt`
      ]);

      assert.fileContent(`k8sTest/templates/chart/values.yaml`, `imageName: k8stest`);
      assert.fileContent(`k8sTest/templates/chart/values.yaml`, `port: 3000`);
      assert.fileContent(`k8sTest/templates/chart/Chart.yaml`, `name: k8stest`);
      assert.fileContent(`k8sTest/templates/chart/templates/_helpers.tpl`, `define "k8stest.name"`);
      assert.fileContent(`k8sTest/templates/chart/templates/configmap.yaml`, `myvalue: k8stest`);
      assert.fileContent(`k8sTest/templates/chart/templates/deployment.yaml`, `template "k8stest.fullname"`);
      assert.fileContent(`k8sTest/templates/chart/templates/service.yaml`, `template "k8stest.fullname"`);
      assert.fileContent(`k8sTest/templates/chart/templates/NOTES.txt`, `template "k8stest.fullname"`);
   });
});