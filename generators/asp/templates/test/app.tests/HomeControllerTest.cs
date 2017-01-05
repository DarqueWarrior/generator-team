using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using <%= name %>.Controllers;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace <%= name %>.Tests
{
    // see example explanation on xUnit.net website:
    // https://xunit.github.io/docs/getting-started-dotnet-core.html
    public class ControllersTest
    {
        [Fact]
        public void Index()
        {
            // Arrange
            var target = new HomeController();

            // Act
            var result = target.Index() as ViewResult;

            // Assert
            Assert.NotNull(result);
        }

        [Fact]
        public void About()
        {
            // Arrange
            var target = new HomeController();

            // Act
            var result = target.About() as ViewResult;

            // Assert
            Assert.NotNull(result);
        }

        [Fact]
        public void Contact()
        {
            // Arrange
            var target = new HomeController();

            // Act
            var result = target.Contact() as ViewResult;

            // Assert
            Assert.NotNull(result);
        }
    }
}
