/* To prevent jshint from yelling at module.exports. */
/* jshint node:true */

'use strict';

module.exports = function(grunt) {

  // 加载所有任务
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  require('time-grunt')(grunt); // 记录用时

  // 任务配置
  grunt.initConfig({

    config: grunt.file.readYAML('_config-grunt.yml'),

    clean: {
      // 清除 dev 文件
      dev: {
        files: [{
          dot: true,
          src: [
            '<%= config.build %>/dev/*',
            '!<%= config.build %>/.git*'
          ]
        }]
      },
      // 发布时先清除 release 文件
      release: {
        files: [{
          dot: true,
          src: [
            '<%= config.build %>/release/*',
            '!<%= config.build %>/.git*'
          ]
        }]
      }
    },

    watch: {
      styles: {
        files: ['<%= config.source %>/css/**/*.css'],
        tasks: ['copy:cssToDest', 'crx_auto_reload']
      },
      scripts: {
        files: ['<%= config.source %>/js/**/*.js'],
        tasks: ['copy:jsToDest', 'crx_auto_reload', 'jshint']
      },
      manifest: {
        files: ['<%= config.source %>/manifest.json'],
        tasks: ['replace:dev', 'crx_auto_reload']
      }
    },

    replace: {
      dev: {
        src: '<%= config.source %>/manifest.json',
        dest: '<%= config.build %>/dev/',
        replacements: [{
          from: 'background.js"',
          to: 'background.js", "reload.js"'
        }]
      },
      release: {
        src: ['README.md', '<%= config.source %>/manifest.json', 'package.json'],
        overwrite: true,
        replacements: [{
          from: '<%= config.old_version %>',
          to: '<%= config.version %>'
        }]
      }
    },

    copy: {
      // 调试时导入文件到 build/dev
      dev: {
        expand: true,
        nonull: true,
        cwd: '<%= config.source %>/',
        src: '**',
        dest: '<%= config.build %>/dev/'
      },
      release: {
        expand: true,
        nonull: true,
        cwd: '<%= config.source %>/',
        src: '**',
        dest: '<%= config.build %>/release/'
      },
      jsToDest: {
        expand: true,
        nonull: true,
        cwd: '<%= config.source %>/js/',
        src: '**/*.js',
        dest: '<%= config.build %>/dev/js/'
      },
      cssToDest: {
        expand: true,
        nonull: true,
        cwd: '<%= config.source %>/css/',
        src: '**/*.css',
        dest: '<%= config.build %>/dev/css/'
      }
    },

    // 自动重载扩展
    crx_auto_reload: {
      options: {
        extensionDir: '<%= config.build %>/dev/'
      },
      default: {}
    },

    uglify: {
      release: {
        options: {
          preserveComments: 'some',
          mangle: false,
          compress: false,
          beautify: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.source %>/js/',
          src: ['**/*.js', '!<%= config.source %>/js/lib/**/*.js'],
          dest: '<%= config.build %>/release/js/'
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      source: [
        '<%= config.source %>/**/js/**/*.js',
        '!<%= config.source %>/js/lib/**/*.js'
      ]
    }

  });

  // Default task
  grunt.registerTask('default', [
    'clean:dev', 
    'copy:dev', 
    'replace:dev', 
    'crx_auto_reload',
    'watch'
  ]);


  grunt.registerTask('release', [
    'replace:release',
    'clean:release',
    'copy:release',
    'uglify:release'
  ]);

};




