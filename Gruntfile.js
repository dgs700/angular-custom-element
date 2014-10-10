module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-karma');
    //grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //sgrunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        // external library versions
        ngversion: '1.2.25',
        libs: [],
        dist: 'dist',
        filename: 'angular-custom-element',
        pkg: grunt.file.readJSON('package.json'),
        srcDir: 'src/',
        buildDir: '<%= dist %>',
        meta: {
            modules: 'angular.module("uiComponents", [<%= srcModules %>]);',
            all: '<%= meta.srcModules %>',
            banner: ['/*',
                ' * <%= pkg.name %>',
                ' * <%= pkg.repository.url %>\n',
                ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                ' * License: <%= pkg.license %>',
                ' */\n'].join('\n')
        },
        karma: {
            options: {
                configFile: 'test/karma.conf.js',
                autoWatch: false,
                browsers: ['PhantomJS']
            },
            unit: {
                singleRun: true,
                reporters: 'dots'
            },
            chrome: {
                autoWatch: true,
                browsers: ['Chrome']
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
                //sourceMap: true,
                //mangle: false
            },
            dist: {
                src: ['src/angular-custom-element.js'],
                dest: '<%= dist %>/<%= filename %>.min.js'
            }
        },
        copy: {
            dist: {
                src: ['<%= dist %>/<%= filename %>.min.js'],
                dest: '<%= dist %>/<%= filename %>-nopolyfill.min.js'
            }
        },
        concat: {
            distMin: {
                options: {},
                //src filled in by build task
                src: ['lib/document-register-element.js', '<%= uglify.dist.dest %>'],
                dest: '<%= dist %>/<%= filename %>.min.js'
            }
        }
    });

    grunt.registerTask('default', ['uglify:dist', 'copy:dist', 'concat:distMin']);
}