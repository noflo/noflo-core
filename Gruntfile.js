/* eslint-disable func-names */
module.exports = function () {
  // Project configuration
  this.initConfig({
    pkg: this.file.readJSON('package.json'),

    // Browser build of NoFlo
    noflo_browser: {
      build: {
        files: {
          'browser/noflo-core.js': ['package.json'],
        },
      },
    },
    // Generate runner.html
    noflo_browser_mocha: {
      all: {
        options: {
          scripts: ['../browser/<%=pkg.name%>.js'],
        },
        files: {
          'spec/runner.html': ['spec/*.js', '!spec/fbpspec.js'],
        },
      },
    },

    // BDD tests on Node.js
    mochaTest: {
      nodejs: {
        src: ['spec/*.js'],
        options: {
          reporter: 'spec',
          require: [
            'coffeescript/register',
          ],
          grep: process.env.TESTS,
        },
      },
    },

    // BDD tests on browser
    mocha_phantomjs: {
      options: {
        output: 'spec/result.xml',
        reporter: 'spec',
        failWithOutput: true,
      },
      all: ['spec/runner.html'],
    },
  });

  // Grunt plugins used for building
  this.loadNpmTasks('grunt-noflo-browser');

  // Grunt plugins used for testing
  this.loadNpmTasks('grunt-mocha-test');
  this.loadNpmTasks('grunt-mocha-phantomjs');

  // Our local tasks
  this.registerTask('build', 'Build NoFlo for the chosen target platform', (target = 'all') => {
    if ((target === 'all') || (target === 'browser')) {
      this.task.run('noflo_browser');
    }
  });

  this.registerTask('test', 'Build NoFlo and run automated tests', (target = 'all') => {
    this.task.run('build');
    if ((target === 'all') || (target === 'nodejs')) {
      this.task.run('mochaTest');
    }
    if ((target === 'all') || (target === 'browser')) {
      this.task.run('noflo_browser_mocha');
      this.task.run('mocha_phantomjs');
    }
  });

  return this.registerTask('default', ['test']);
};
