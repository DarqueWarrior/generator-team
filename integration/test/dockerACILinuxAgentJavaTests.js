// This only makes sense when run on VSTS. The hosted linux
// is not on TFS.
const docker = require('./docker');

describe(`Azure Container Instances (Linux) using Hosted Linux Preview queue`, function () {
   "use strict";

   docker.runTests({
      appType: `java`,
      appName: `javaACITest`,
      target: `acilinux`,
      queue: `Hosted Linux Preview`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   });
});