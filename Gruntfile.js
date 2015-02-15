/* To prevent jshint from yelling at module.exports. */
/* jshint node:true */

'use strict';

module.exports = function(grunt) {

  var LIVERELOAD_PORT = 35729;
  // 生成 LiveReload 脚本
  var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });

  // 加载所有任务
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  require('time-grunt')(grunt); // 记录用时

  // 项目配置
  var config = grunt.file.readYAML('_config-grunt.yml');
  var FILE_BANNER = '/*!\n * Jesse Wong\n * @straybugs\n * https://github.com/Crimx/hybrid-translator\n * MIT Licensed\n */\n\n';

  // 任务配置
  grunt.initConfig({

    config: config,

    clean: {
      // 清除 dev 文件
      dev: {
        files: [{
          dot: true,
          src: '<%= config.build %>/dev/*'
        }]
      },
      // 发布时先清除 release 文件
      release: {
        files: [{
          dot: true,
          src: '<%= config.build %>/release/*'
        }]
      },
      scripts: {
        files: [{
          dot: true,
          src: '<%= config.build %>/dev/js/*'
        }]
      },
      styles: {
        files: [{
          dot: true,
          src: '<%= config.build %>/dev/css/*'
        }]
      }
    },

    concat: {
      jsbackground: {
        options: {
          stripBanners: true,
          banner: FILE_BANNER
        },
        src: '<%= config.source %>/js/background/**/*.js',
        dest: '<%= config.build %>/dev/js/background.js'
      }
    },

    connect: {
      livereload: {
        options: {
          port: config.port,
          middleware: function(connect) {
            return [
              // 注入脚本到静态文件中
              lrSnippet,
              // 静态文件服务器的路径
              connect.static(config.base),
            ];
          },
          onCreateServer: function() {
            grunt.event.emit('serverCreated');
          }
        }
      }
    },

    copy: {
      // 调试时导入文件到 build/dev
      dev: {
        expand: true,
        nonull: true,
        cwd: '<%= config.source %>/',
        src: [
          '**',
          '!js/**'
        ],
        dest: '<%= config.build %>/dev/'
      },
      release: {
        expand: true,
        nonull: true,
        cwd: '<%= config.source %>/',
        src: ['**', '!assets/'],
        dest: '<%= config.build %>/release/'
      },
      jsToDest: {
        expand: true,
        nonull: true,
        cwd: '<%= config.source %>/js/',
        src: '**.js',
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
    'crx_auto_reload': {
      options: {
        extensionDir: '<%= config.build %>/dev/'
      },
      default: {}
    },

    jshint: {
      gruntfile: {
        src: ['Gruntfile.js']
      },
      others: {
        src: ['<%= config.source %>/js/**/*.js']
      }
    },

    open: {
      test: {
        options: {
          openOn: 'serverCreated'
        },
        path: 'http://localhost:<%= config.port %>/example.html'
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

    watch: {
      options: {
        // Start a live reload server on the default port 35729
        livereload: LIVERELOAD_PORT
      },
      styles: {
        files: ['<%= config.source %>/css/**'],
        tasks: ['clean:styles', 'copy:cssToDest', 'crx_auto_reload']
      },
      scripts: {
        files: ['<%= config.source %>/js/**'],
        tasks: ['clean:scripts', 'copy:jsToDest', 'concat', 'crx_auto_reload', 'jshint']
      },
      test: {
        files: ['site/**']
      },
      others: {
        files: [
          '<%= config.source %>/**',
          '!<%= config.source %>/js/**',
          '!<%= config.source %>/css/**'
        ],
        tasks: ['copy:dev', 'replace:dev', 'crx_auto_reload']
      }
    }

  });

  // Default task
  grunt.registerTask('default', [
    'clean:dev', 
    'copy:dev',
    'copy:jsToDest',
    'concat',
    'replace:dev',
    'crx_auto_reload',
    'jshint:gruntfile',
    'open:test',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('release', [
    'replace:release',
    'clean:release',
    'copy:release',
    'uglify:release'
  ]);

};
