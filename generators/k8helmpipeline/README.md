# K8shelmpipeline

The K8shelmpipeline sub-generator creates a CI/CD pipeline in Visual Studio Teams Services (VSTS) and generates the template files needed to provision a basic Kubernetes web application using helm.

## Installing

Please refer to the [home](https://github.com/DarqueWarrior/generator-team) repository to install the Yeoman generator 

## Prerequisites

Along with an Azure Subscription and a VSTS Project, a few things have to be provisioned before running the generator: 

1. A Kubernetes Cluster in either [Azure Container Services](https://docs.microsoft.com/en-us/azure/container-service/kubernetes/) (ACS) or [Azure Kubernetes Services](https://azure.microsoft.com/en-us/services/kubernetes-service/) (AKS)

2. An [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/) (ACR)

   - The ACR name
   - The Resource Group Name
   

3. A [Kubernetes Service Endpoint](https://docs.microsoft.com/en-us/vsts/pipelines/library/service-endpoints?view=vsts) in VSTS

   - Service Endpoint Id

4. A [Service Principal](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-aks?toc=%2fazure%2faks%2ftoc.json) in Azure allowing your Kubernetes Cluster and your ACR to communicate

   - The K8s Image Pull Secret

5. A VSTS [personal access token](https://docs.microsoft.com/en-us/vsts/organizations/accounts/use-personal-access-tokens-to-authenticate?view=vsts) (PAT) 

## Getting Started
To start the sub-generator, run

```
yo team:k8helmpipeline
```


