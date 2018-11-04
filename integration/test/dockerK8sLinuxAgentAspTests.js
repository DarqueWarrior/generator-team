// This only makes sense when run on VSTS. The hosted linux
// is not on TFS.
const docker = require('./_docker');

describe(`Core K8s (Linux) using Hosted Ubuntu 1604 queue`, function () {
   "use strict";

   docker.runTests({
      appType: `asp`,
      appName: `aspK8sTest`,
      target: `k8s`,
      queue: `Hosted Ubuntu 1604`,
      groupId: ` `,
      title: `Home Page - My .NET Core Application`
   });
});