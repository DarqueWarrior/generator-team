FROM tomcat:8

# We have to remove all the contents of webapps so our app is the default
RUN rm -rf /usr/local/tomcat/webapps/*

# Renaming to ROOT.war will make this project the root app
ADD target/<%= name %>.war /usr/local/tomcat/webapps/ROOT.war