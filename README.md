# generator-team (Yo Team)

## Build status
![](https://dlb.visualstudio.com/_apis/public/build/definitions/40202688-4713-4e5d-85ea-958146d71db6/53/badge)

## Revision history
[Changes](https://github.com/DarqueWarrior/generator-team/wiki)

## See it in action
[Ignite New Zealand 2016](https://channel9.msdn.com/Events/Ignite/New-Zealand-2016/M328)

## Capabilities
generator-team is a [Yeoman](http://yeoman.io/) generator that creates a complete CI/CD pipeline in [Team Foundation Server](https://www.visualstudio.com/downloads/) or [Visual Studio Team Services](https://www.visualstudio.com/tfs-test/) for the following languages:
- Java using Tiles and bootstrap
- Node using Pug and bootstrap
- ASP.net Core using Razor and bootstrap
- ASP.net Full Framework using Razor and bootstrap

It allows you to deploy to the following platforms:
- [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/web/)
- [Docker](https://www.docker.com/) to private host
- [Docker](https://www.docker.com/) images in [Azure App Service on Linux](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-linux-intro)
- [Azure Container Instances](https://docs.microsoft.com/en-us/azure/container-instances/)

## Requirements
- [Team Foundation Server 2017](https://www.visualstudio.com/downloads/) or [Visual Studio Team Services Account](https://app.vsaex.visualstudio.com/profile/account)
   - [Personal Access Token](https://www.visualstudio.com/en-us/docs/setup-admin/team-services/use-personal-access-tokens-to-authenticate)
   - Install [Docker Integration](https://marketplace.visualstudio.com/items?itemName=ms-vscs-rm.docker) on tfs Account
- [Azure Subscription](https://azure.microsoft.com/en-us/free/)
   - [Service Principal](http://donovanbrown.com/post/Creating-an-Azure-Resource-Manager-Service-Endpoint-in-new-Portal)
- [Node.js](http://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [Bower](https://bower.io/)
- [Azure PowerShell](https://azure.microsoft.com/en-us/downloads/)
- [Git](http://git-scm.org/)
- [.NET Core SDK](http://dot.net)
- [.NET Framework 3.5](https://www.microsoft.com/en-us/download/details.aspx?id=21)
- [Maven](http://maven.apache.org/)
- [Java JDK & JRE](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
- [Docker Toolbox](https://github.com/docker/toolbox/releases)

## Install
You can read how to use it at [DonovanBrown.com](http://donovanbrown.com/post/yo-Team). 

## To test
`npm test`

## Debug
You can debug the generator using [VS Code](http://code.visualstudio.com/). You need to update the launch.json. Replace any value in [] with your information.  Use [npm link](https://docs.npmjs.com/cli/link) from the root folder to load your local version.
