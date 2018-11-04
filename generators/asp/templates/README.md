# Welcome to ASP.NET Core

## This application consists of:

*   Sample pages using [ASP.NET Core MVC](http://dot.net) with [Razor](https://docs.asp.net/en/latest/mvc/overview.html#razor-view-engine)
*   [Bower](https://go.microsoft.com/fwlink/?LinkId=518004) for managing client-side libraries
*   Themed using [Bootstrap](https://go.microsoft.com/fwlink/?LinkID=398939)

## This application was developed with:

*   [Visual Studio Code](https://www.visualstudio.com/products/code-vs)
*   [Team Services](https://www.visualstudio.com/products/visual-studio-team-services-vs)
*   [Yeoman](http://yeoman.io/)

## This application can deploy to:

*   [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/)
*   [Azure IaaS Linux via Docker](https://azure.microsoft.com/en-us/services/virtual-machines/)
*   [Azure Container Service](https://azure.microsoft.com/en-us/services/container-service/)

## The application is monitored by

* [Application Insights](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-nodejs)

To develop locally create an environment variable named APPINSIGHTS_INSTRUMENTATIONKEY and set it to the instrumentation key from Azure. You can also add the following snippet to your appsettings.json file.

```json
// Replace key with value from Azure
"ApplicationInsights": {
  "InstrumentationKey": "10101010-1010-1010-1010-101010101010"
}
```