/* eslint-disable func-names */
module.exports = function () {
  // Project configuration
  this.initConfig({
    pkg: this.file.readJSON('package.json'),

    // Browser build of NoFlo
    noflo_browser: {
      build: {
        options: {
          exposed_modules: {
            noflo: 'noflo',
            'noflo-runtime-postmessage': 'noflo-runtime-postmessage',
          },
        },
        files: {
          'browser/noflo-core.js': ['package.json'],
        },
      },
    },

    // BDD tests on Node.js
    mochaTest: {
      nodejs: {
        src: ['spec/*.js'],
        options: {
          reporter: 'spec',
          require: [],
          grep: process.env.TESTS,
        },
      },
    },
  });

  // Grunt plugins used for building
  this.loadNpmTasks('grunt-noflo-browser');

  // Grunt plugins used for testing
  this.loadNpmTasks('grunt-mocha-test');

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
  });

  return this.registerTask('default', ['test']);
};
