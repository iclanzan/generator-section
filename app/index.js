'use strict';

module.exports = function SectionGenerator() {
  this.on('end', function () {
    !this.options['skip-install'] && this.installDependencies();
  });

  this.directory('./', './');
};
