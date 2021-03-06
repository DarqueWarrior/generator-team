const util = require(`./utility`);

function addRelease(obj) {

   var queue = obj.queue;

   if (util.isPaaS(obj) && util.isWindowsAgent(queue) === false) {
      // Inform user that if they selected Hosted Linux agent Hosted VS2017
      // will be used for release. The release requires AZPowerShell which is
      // not on the Linux build machine
      obj.log.info(`${queue} will be used for build and Hosted VS2017 for release.`);

      queue = `Hosted VS2017`;
   }

   obj.composeWith(`team:release`, {
      arguments: [obj.type, obj.applicationName, obj.tfs,
         queue, obj.target,
      obj.azureSub,
      obj.dockerHost, obj.dockerRegistry, obj.dockerRegistryId, obj.dockerPorts,
      obj.dockerRegistryPassword, obj.pat, obj.customFolder, obj.clusterName, obj.clusterResourceGroup
      ]
   });
}

function addBuild(obj) {
   obj.composeWith(`team:build`, {
      arguments: [obj.type, obj.applicationName, obj.tfs,
      obj.queue, obj.target,
      obj.dockerHost, obj.dockerRegistry, obj.dockerRegistryId,
      obj.pat, obj.customFolder
      ]
   });
}

function addAzure(obj) {
   if (util.isPaaS(obj)) {
      obj.composeWith(`team:azure`, {
         arguments: [obj.applicationName, obj.tfs,
         obj.azureSub, obj.azureSubId, obj.tenantId, obj.servicePrincipalId, obj.servicePrincipalKey,
         obj.pat
         ]
      });
   }
}

function addProject(obj) {
   obj.composeWith(`team:project`, {
      arguments: [obj.applicationName, obj.tfs,
      obj.pat
      ]
   });
}

function addRegistry(obj) {
   if (util.needsRegistry(obj)) {
      obj.composeWith(`team:registry`, {
         arguments: [obj.applicationName, obj.tfs,
         obj.dockerRegistry, obj.dockerRegistryId, obj.dockerRegistryPassword,
         obj.pat
         ]
      });
   }
}

function addDockerHost(obj) {
   if (util.needsDockerHost({}, obj)) {
      obj.composeWith(`team:docker`, {
         arguments: [obj.applicationName, obj.tfs,
         obj.dockerHost, obj.dockerCertPath,
         obj.pat
         ]
      });
   }
}

function addLanguage(obj) {
   let generator = `team:${obj.type}`;

   switch (obj.type) {
      case `aspFull`:
         obj.composeWith(generator, {
            arguments: [obj.applicationName]
         });
         break;

      case `java`:
         obj.composeWith(generator, {
            arguments: [obj.applicationName, obj.groupId, obj.installDep, obj.dockerPorts]
         });
         break;

      case `powershell`:
         obj.composeWith(generator, {
            arguments: [obj.applicationName, obj.functionName]
         });
         break;

      default:
         obj.composeWith(generator, {
            arguments: [obj.applicationName, obj.installDep, obj.dockerPorts]
         });
         break;
   }
}

function addGit(obj) {
   obj.composeWith(`team:git`, {
      arguments: [obj.applicationName, obj.tfs,
         `all`,
      obj.pat
      ]
   });
}

function addFeed(obj) {
   obj.composeWith(`team:feed`, {
      arguments: [obj.applicationName, obj.tfs,
      obj.pat
      ]
   });
}

function addNuGet(obj) {
   obj.composeWith(`team:nuget`, {
      arguments: [obj.applicationName, obj.tfs,
      obj.apiKey,
      obj.pat
      ]
   });
}

function addK8s(obj) {
   if (obj.target === `k8s`) {
      obj.composeWith(`team:k8s`, {
         arguments: [obj.applicationName,
         obj.dockerRegistry, obj.dockerRegistryId, obj.dockerPorts,
         obj.imagePullSecret
         ]
      });
   }
}

module.exports = {
   addK8s: addK8s,
   addGit: addGit,
   addFeed: addFeed,
   addNuGet: addNuGet,
   addAzure: addAzure,
   addBuild: addBuild,
   addProject: addProject,
   addRelease: addRelease,
   addRegistry: addRegistry,
   addLanguage: addLanguage,
   addDockerHost: addDockerHost
};