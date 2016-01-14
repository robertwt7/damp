require('shelljs/global');
var chalk = require('chalk');

module.exports = function(damp) {
	return function() {
		damp.checkDependencies();
		damp.connectToVm();

		console.log(chalk.green('Destroying the DAMP docker machine...'));
		if (exec('docker-machine rm -y damp').code !== 0) {
			this.exitWithError('Command failed: docker-machine rm -y damp');
		}
	}
}