module.exports = function(grunt){
	grunt.initConfig({
		handlebars: {
			options: {
				partialRegex: /^par_/,
				processName: function(f){
					return f.replace(/^handlebars\//, '').replace(/\.html$/, '');
				}
			},
			compile: {
				files: {
					'compiled/templates.js': 'handlebars/*/*.html'
				}
			}
		},
		uglify: {
			options: {
				compress: {hoist_vars: true},
				//sourceMap: 'compiled',
				banner: '/** kyou (C) <%= grunt.template.today("yyyy") %> / <%= grunt.template.today("dd-mm-yyyy@HH:mm:ss") %> */\n',
				report: 'min'
			},
			widgets: {
				files: {'compiled/widgets.js': ['clientside/widgets/*.js']}
			},
			layouts: {
				files: {'compiled/layouts.js': ['clientside/layouts/*.js']}
			},
			ryou: {
				files: {
					'compiled/ryou_provider.js': ['assets/ryou_provider/*.js'],
					'compiled/assets/ryou_provider/_ryoup.js': ['assets/ryou_provider/_ryoup.js']
				}
			},
			ushio3d: {
				files: {'compiled/assets/ushio3d.js': ['assets/three.js', 'assets/shaderextras.js', 'assets/tween.js', 'assets/sparks.js', 'assets/threex.sparks.js', 'assets/ushio3d.js']}
			},
			templates: {
				files: {'compiled/templates.js': ['compiled/templates.js']}
			},
			models: {
				files: {'compiled/assets/models.js': ['assets/models.js']}
			},
			handlebars: {
				files: {'compiled/assets/handlebars.js': ['assets/handlebars.runtime.js']}
			},
			nav: {
				files: {'compiled/assets/nav.js': ['assets/nav.js']}
			},
			widgets_res: {
				files: {
					'compiled/files/cover.js': ['files/cover.js'],
					'compiled/files/fullslide.js': ['files/fullslide.js']
				}
			},
			widgets_res: {
				files: {
					'compiled/files/biglogo.js': ['files/biglogo.js'],
					'compiled/files/box3d.js': ['files/box3d.js'],
					'compiled/files/iimg.js': ['files/iimg.js'],
					'compiled/files/quiz.js': ['files/quiz.js'],
					'compiled/files/review.js': ['files/review.js'],
					'compiled/files/ytgallery.js': ['files/ytgallery.js']
				}
			}
		},
		cssmin: {
			options: {
				banner: '/** kyou (C) <%= grunt.template.today("yyyy") %> / <%= grunt.template.today("dd-mm-yyyy@HH:mm:ss") %> */\n'
			},
			kyou: {
				files: {
					'compiled/assets/kyou.css': ['assets/kyou.css'],
					'compiled/assets/nav.css': ['assets/nav.css']
				}
			},
			layouts: {
				files: {
					'compiled/files/cover.css': ['files/cover.css'],
					'compiled/files/standard.css': ['files/standard.css'],
					'compiled/files/fullslide.css': ['files/fullslide.css'],
					'compiled/files/thaisans/fontface.css': ['files/thaisans/fontface.css'],
				}
			},
			widgets: {
				files: {
					'compiled/files/editortalk.css': ['files/editortalk.css'],
					'compiled/files/flip.css': ['files/flip.css'],
					'compiled/files/gallery_images.css': ['files/gallery_images.css'],
					'compiled/files/iimg.css': ['files/iimg.css'],
					'compiled/files/infobox.css': ['files/infobox.css'],
					'compiled/files/review.css': ['files/review.css'],
					'compiled/files/ytgallery.css': ['files/ytgallery.css']
				}
			},
			ui_bootstrap: {
				files: {
					'compiled/assets/ui-bootstrap/bootstrap.css': ['assets/ui-bootstrap/bootstrap.css']
				}
			}
		}
	});
	['grunt-contrib-handlebars', 'grunt-contrib-uglify', 'grunt-contrib-cssmin'].forEach(function(v){
		grunt.loadNpmTasks(v);
	});
	grunt.registerTask('default', ['handlebars', 'uglify', 'cssmin']);
}
