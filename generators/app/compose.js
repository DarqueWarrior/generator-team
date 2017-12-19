const util = require(`./utility`);

function addRelease(obj) {

   var queue = obj.queue;

   if (util.isPaaS(obj) && queue.indexOf(`Linux`) !== -1) {
      queue = `Hosted VS2017`;

      // Inform user that if they selected Hosted Linux agent Hosted VS2017
      // will be used for release. The release requires AZPowerShell which is
      // not on the Linux build machine
      obj.log(`* Hosted Linux will be used for build and Hosted VS2017 for release. *`);
   }

   obj.composeWith(`team:release`, {
      arguments: [obj.type, obj.applicationName, obj.tfs,
         queue, obj.target,
         obj.azureSub,
         obj.dockerHost, obj.dockerRegistry, obj.dockerRegistryId, obj.dockerPorts,
         obj.dockerRegistryPassword, obj.pat, obj.customFolder
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
   if (util.needsDockerHost(obj)) {
      obj.composeWith(`team:docker`, {
         arguments: [obj.applicationName, obj.tfs,
            obj.dockerHost, obj.dockerCertPath,
            obj.pat
         ]
      });
   }
}

function addLanguage(obj) {
   if (obj.type === `asp`) {
      obj.composeWith(`team:asp`, {
         arguments: [obj.applicationName, obj.installDep, obj.dockerPorts]
      });
   } else if (obj.type === `aspFull`) {
      obj.composeWith(`team:aspFull`, {
         arguments: [obj.applicationName]
      });
   } else if (obj.type === `java`) {
      obj.composeWith(`team:java`, {
         arguments: [obj.applicationName, obj.groupId, obj.installDep, obj.dockerPorts]
      });
   } else if (obj.type === `node`) {
      obj.composeWith(`team:node`, {
         arguments: [obj.applicationName, obj.installDep, obj.dockerPorts]
      });
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

module.exports = {
   addGit: addGit,
   addAzure: addAzure,
   addBuild: addBuild,
   addProject: addProject,
   addRelease: addRelease,
   addRegistry: addRegistry,
   addLanguage: addLanguage,
   addDockerHost: addDockerHost
};