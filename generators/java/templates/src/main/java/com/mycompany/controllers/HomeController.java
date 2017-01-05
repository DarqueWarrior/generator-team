package <%= namespace %>.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class HomeController {

	@RequestMapping(value="/")
	public ModelAndView index() {
		ModelAndView result = new ModelAndView("index");
		result.addObject("Title", "Home Page");
		return result;
	}
	
	@RequestMapping(value="/about")
	public ModelAndView about() {
		ModelAndView result = new ModelAndView("about");
		result.addObject("Title", "About");
		result.addObject("Message", "Your application description page.");
		return result;
	}
	
	@RequestMapping(value="/contact")
	public ModelAndView contact() {
		ModelAndView result = new ModelAndView("contact");
		result.addObject("Title", "Contact");
		result.addObject("Message", "Your contact page.");
		return result;
	}
}
