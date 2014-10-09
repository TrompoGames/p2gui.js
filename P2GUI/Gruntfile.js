/*global module:false*/
module.exports = function(grunt) {
	
	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	// source files //
	var sourceFiles = [
		'<%= pkg.sourceFolder %>/Importers/PIXIDisplayObjectContainer+P2GUI.js',
		'<%= pkg.sourceFolder %>/Importers/PIXISprite+P2GUI.js',
		'<%= pkg.sourceFolder %>/P2GSize.js',
		'<%= pkg.sourceFolder %>/P2GImportCallbacks.js',
		'<%= pkg.sourceFolder %>/P2GElement.js',
		'<%= pkg.sourceFolder %>/P2GLayout.js',
		'<%= pkg.sourceFolder %>/P2GImporter.js',
	];

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
		'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
		'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
		' All rights reserved. */\n',
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: sourceFiles,
				dest: '<%= pkg.outputFolder %>/<%= pkg.outputName %>.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>',
				compress: true,
				mangle: true
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: '<%= pkg.outputFolder %>/<%= pkg.outputName %>.min.js'
			}
		}
	});

	// Default task.
	grunt.registerTask('default', ['concat', 'uglify']);

};
