<%%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles"%%>
<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><tiles:insertAttribute name="title" ignore="true" /> - My Spring Application</title>
	<link rel="shortcut icon" href="resources/favicon.ico">
	<link rel="stylesheet" href="resources/css/site.css">
	<link rel="stylesheet" href="resources/lib/bootstrap/dist/css/bootstrap.css">
</head>

<body>
	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="container">
			<div class="navbar-header">
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
				<a href="./" class="navbar-brand">
					<%= name %>
				</a>
			</div>
			<div class="navbar-collapse collapse">
				<ul class="nav navbar-nav">
					<li><a href="./">Home</a></li>
					<li><a href="./about">About</a></li>
					<li><a href="./contact">Contact</a></li>
				</ul>
			</div>
		</div>
	</div>
	<div class="container body-content">
		<tiles:insertAttribute name="body" />
		<hr />
		<footer>
			<p>&copy; 2016 -
				<%= name %>
			</p>
		</footer>
	</div>

	<script src="resources/lib/jquery/dist/jquery.js"></script>
	<script src="resources/lib/bootstrap/dist/js/bootstrap.js"></script>
	<script src="resources/js/site.js"></script>
</body>

</html>