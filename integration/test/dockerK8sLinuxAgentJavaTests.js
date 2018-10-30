// This only makes sense when run on VSTS. The hosted linux
// is not on TFS.
const docker = require('./_docker');

describe(`Java K8s (Linux) using Hosted Ubuntu 1604 queue`, function () {
   "use strict";

   docker.runTests({
      appType: `java`,
      appName: `javaACITest`,
      target: `k8s`,
      queue: `Hosted Ubuntu 1604`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   });
});