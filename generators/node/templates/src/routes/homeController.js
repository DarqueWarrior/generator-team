var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
   res.render('index', { title: 'Home Page' });
});

router.get('/contact', function (req, res, next) {
   res.render('contact', { title: 'Contact', message: 'Your contact page.' });
});

router.get('/about', function (req, res, next) {
   res.render('about', { title: 'About', message: 'Your application description page.' });
});

module.exports = router;
