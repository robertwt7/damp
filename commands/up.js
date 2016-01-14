require('shelljs/global');
var chalk = require('chalk'),
	os = require('os'),
	hostile = require('hostile');

module.exports = function(damp) {
	return function() {
		damp.checkDependencies();

		// Check if Docker Machine is running
		if (exec('docker-machine env damp', { silent: true }).code !== 0) {
			// If not create the Docker Machine
			console.log(chalk.green('Creating the DAMP docker machine...'));
			if (exec('docker-machine create --driver virtualbox damp').code !== 0) {
				this.exitWithError('Command failed: docker-machine create --driver virtualbox damp');
			}
		}

		damp.connectToVm();

		// Get the Docker Machine IP
		console.log(chalk.green('Finding the DAMP docker machine IP...'));
		var ipCmd = exec('docker-machine ip damp', { silent: true }),
			dampIp = ipCmd.output.replace("\n", '');

		// Run "docker-compose up"
		console.log(chalk.green('Creating DAMP docker containers...'));
		cd(damp.path + '/lib/damp');
		if (exec('docker-compose up -d').code !== 0) {
			damp.exitWithError('Command failed: docker-compose up -d');
		}

		console.log(chalk.green('Setting up DAMP sites...'));
		cp('-f', damp.path + '/lib/site/index.html', os.homedir() + '/damp/damp');

		hostile.set(dampIp, 'damp.dev', function(err) {
			if (err) {
				damp.exitWithError('There was an error adding "' + dampIp + ' damp.dev" to ' + err.path + '. Please add manually.');
			}
		});
	}
}