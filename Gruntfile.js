module.exports = function(grunt) {
grunt.initConfig({
	babel: {
		options: {
			sourceMap: true
		},
		all : {
			files : [{
				expand : true,
				cwd    : 'js/es6',
				src    : '*.js',
				ext    : '.js'
			}]
		}
	},
	watch : {
		scripts: {
			files : ['js/es6/*.js'],
			tasks : ['babel']
		}
	}
});

grunt.loadNpmTasks('grunt-babel');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.event.on('watch', function(action, file, target) {
	grunt.log.writeln(target + ': ' + file + ' has ' + action);
});
grunt.registerTask('default', ['babel']);
};
