require('shelljs/global');
var chalk = require('chalk'),
	inquirer = require("inquirer");

module.exports = function(damp) {
	return function() {
		damp.checkDependencies();

		inquirer.prompt([
			{
				type: 'confirm',
				name: 'destroy',
				message: 'Are you sure you want to destroy the DAMP docker machine?',
				default: false
			}
		], function(answers) {
			if (!answers.destroy) {
				return;
			}

			damp.connectToVm();

			console.log(chalk.green('Destroying the DAMP docker machine...'));
			if (exec('docker-machine rm -y damp').code !== 0) {
				damp.exitWithError('Command failed: docker-machine rm -y damp');
			}

			damp.removeVirtualHosts();
		});
	}
}