'use strict';

module.exports = function (grunt) {
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      copy: {
         main: {
            files: [
               { expand: true, cwd: 'node_modules/jquery/', src: ['dist/**'], dest: 'src/public/lib/jquery/' },
               { expand: true, cwd: 'node_modules/jquery-validation/', src: ['dist/**'], dest: 'src/public/lib/jquery-validation/' },
               { expand: true, cwd: 'node_modules/jquery-validation-unobtrusive/', src: ['dist/**'], dest: 'src/public/lib/jquery-validation-unobtrusive/' },
               { expand: true, cwd: 'node_modules/bootstrap/', src: ['dist/**'], dest: 'src/public/lib/bootstrap/' },
            ]
         }
      }
   });

   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.registerTask('default', ['copy']);
}