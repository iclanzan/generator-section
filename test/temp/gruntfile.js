'use strict';

module.exports = function( grunt ) {
  // Load options from package.json
  var options = require('./package.json');

  require('load-grunt-tasks')(grunt, {config: options, pattern: ['grunt-*', 'section-*']});

  require('time-grunt')(grunt);

  // Node modules
  var path = require('path');

  var commonTasks = ['jshint', 'clean:temp', 'section'];
  var devTasks = ['less:dev', 'notify:success', 'connect:livereload', 'watch'];
  var buildTasks = ['less:dist', 'clean:dist', 'imagemin', 'svgmin', 'htmlmin', 'copy:dist', 'uglify'];

  var contentDir = path.join(options.directories.content, '/');
  var assetsDir = path.join(options.directories.assets, '/');
  var outputDir = path.join(options.directories.output, '/');
  var layoutDir = path.join(options.directories.layout, '/');
  var stylesDir = path.join(options.directories.styles, '/');
  var scriptsDir = path.join(options.directories.scripts, '/');
  var tempDir = path.join(options.directories.temp, '/');
  var tempOutput = tempDir + 'output/';

  var config = {};

  config.section = {
    options: options,
    main: {
      src: contentDir,
      dest: tempOutput
    }
  };

  config.clean = {
    temp: [tempDir],
    dist: [outputDir + '**/**', outputDir + '!/.git*']
  };

  config.copy = {
    dist: {
      files: [{
        expand: true,
        dot: true,
        cwd: assetsDir,
        dest: outputDir,
        src: [
          '**/**', '!**/**.{png,jpg,jpeg,gif,svg,html}'
        ]
      }, {
        expand: true,
        cwd: tempOutput,
        dest: outputDir,
        src: [
          '**/**', '!**/**.{png,jpg,jpeg,gif,svg,html}'
        ]
      }]
    }
  };

  config.jshint = {
    options: {
      node: true,
      camelcase: true,
      curly: true,
      immed: true,
      indent: 2,
      latedef: true,
      newcap: true,
      noarg: true,
      quotmark: true,
      undef: true,
      unused: true,
      strict: true,
      trailing: true,
      eqnull: true,
      expr: true,
      proto: true,
      shadow: true,
      validthis: true
    },
    all: [
      'gruntfile.js',
      'index.js',
      'scripts/{,*/}*.js'
    ]
  };

  config.uglify = {
    dist: {
      src: [scriptsDir + 'index.js', scriptsDir + '{,*/}*.js'],
      dest: outputDir + 'index.js'
    }
  };

  config.htmlmin = {
    options: {
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      // Cheerio does a better job at collapsing whitespace.
      collapseWhitespace: false,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true
    },
    dist: {
      expand: true,
      src: [tempOutput + '**/**.html', assetsDir + '**/**.html'],
      dest: outputDir
    }
  };

  config.imagemin = {
    dist: {
      files: [{
        expand: true,
        src: '{' + assetsDir + ', ' + tempOutput + '}**/**.{png,jpg,jpeg,gif}',
        dest: outputDir
      }]
    }
  };

  config.svgmin = {
    dist: {
      files: [{
        expand: true,
        src: '{' + assetsDir + ', ' + tempOutput + '}**/**.svg',
        dest: outputDir
      }]
    }
  };

  config.less = {
    dev: {
      src: stylesDir + 'index.less',
      dest: tempOutput + 'index.css'
    },
    dest: {
      options: {
        compress: true,
        cleancss: true
      },
      src: stylesDir + 'index.less',
      dest: outputDir + 'index.css'
    }
  };

  config.notify = {
    success: {
      options: {
        title: 'Success!',
        message: 'Your website was generated successfully.'
      }
    }
  };

  if (options.deploy && options.deploy.type == 'git' && options.deploy.url) {
    config.gitDeploy = {
      main: {
        options: {
          url: options.deploy.url
        },
        src: outputDir
      }
    };

    if (options.deploy.branch) {
      config.gitDeploy.main.options.branch = options.deploy.branch;
    }
    if (options.deploy.message) {
      config.gitDeploy.main.options.message = options.deploy.message;
    }

    buildTasks.push('gitDeploy');
  }

  config.connect = {
    options: {
      port: options.server.port,
      // Change this to '0.0.0.0' to access the server from outside.
      hostname: options.server.host,
      livereload: 35729
    },
    livereload: {
      options: {
        open: true,
        base: [assetsDir, 'scripts/', tempOutput]
      }
    },
    test: {
      options: {
        port: options.server.port + 1,
        base: [tempOutput, 'test', assetsDir]
      }
    },
    dist: {
      options: {
        base: outputDir
      }
    }
  };

  config.watch = {
    options: {
      spawn: false,
      livereload: config.connect.options.livereload
    },
    content: {
      files: [contentDir + '**/**', layoutDir + '**/**'],
      tasks: ['section']
    },
    styles: {
      files: [stylesDir + '{,*/}*.less'],
      tasks: ['less']
    },
    connect: {
      files: [assetsDir + '**/**', 'scripts/**/**']
    }
  };

  grunt.initConfig(config);

  buildTasks.push('notify:success');

  grunt.registerTask('build',
    'Generates a production-ready version of your site.',
    commonTasks.concat(buildTasks)
  );

  grunt.registerTask('server',
    'Serves the distribution version of your site.',
    ['connect:dist:keepalive']
  );

  grunt.registerTask('default',
    'Generates and serves a development version of your site that is automatically regenerated when files change.',
    commonTasks.concat(devTasks)
  );
};
