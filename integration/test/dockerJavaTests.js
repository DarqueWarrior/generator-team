const docker = require('./_docker');

describe(`Docker Host using Default queue`, function () {
   "use strict";

   docker.runTests({
      appType: `java`,
      appName: `javaDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   });
});