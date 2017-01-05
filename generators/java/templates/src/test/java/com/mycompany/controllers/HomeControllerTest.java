package <%= namespace %>.controllers;

import org.junit.Test;
import static org.junit.Assert.assertEquals;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;

public class HomeControllerTest {
   @Test
	public void indexTest() throws IOException {
      // Arrange
      HomeController target = new HomeController();
      String expected = "Home Page";
      
      // Act
      ModelAndView actual = target.index();
      
      // Assert
      assertEquals("Title must equal " + expected, expected, actual.getModel().get("Title"));
	}

	@Test
	public void aboutTest() throws IOException {
      // Arrange
      HomeController target = new HomeController();
      String expectedTitle = "About";
      String expectedMessage = "Your application description page.";

      // Act
      ModelAndView actual = target.about();

      // Assert
      assertEquals("Title must equal " + expectedTitle, expectedTitle, actual.getModel().get("Title"));     
      assertEquals("Message must equal " + expectedMessage, expectedMessage, actual.getModel().get("Message"));     
	}
   
	@Test
	public void contactTest() throws IOException {
      // Arrange
      HomeController target = new HomeController();
      String expectedTitle = "Contact";
      String expectedMessage = "Your contact page.";

      // Act
      ModelAndView actual = target.contact();

      // Assert
      assertEquals("Title must equal " + expectedTitle, expectedTitle, actual.getModel().get("Title"));     
      assertEquals("Message must equal " + expectedMessage, expectedMessage, actual.getModel().get("Message"));     
	}
}