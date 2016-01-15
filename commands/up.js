require('shelljs/global');
var chalk = require('chalk'),
	os = require('os');

module.exports = function(damp) {
	return function(options) {
		var driver = options.driver || 'virtualbox';

		damp.checkDependencies();

		// Check if Docker Machine is running
		if (exec('docker-machine env damp', { silent: true }).code !== 0) {
			if (exec('docker-machine status damp', { silent: true }).output.indexOf('Stopped') !== -1) {
				// Start the Docker Machine
				console.log(chalk.green('Starting the DAMP docker machine...'));
				if (exec('docker-machine start damp').code !== 0) {
					damp.exitWithError('Command failed: docker-machine start damp');
				}
			} else {
				// Create the Docker Machine
				console.log(chalk.green('Creating the DAMP docker machine...'));
				if (exec('docker-machine create --driver ' + driver + ' damp').code !== 0) {
					damp.exitWithError('Command failed: docker-machine create --driver ' + driver + ' damp');
				}
			}
		}

		damp.connectToVm();

		// Run "docker-compose up"
		console.log(chalk.green('Creating DAMP docker containers...'));
		cd(damp.path + '/lib/damp');
		if (exec('docker-compose up -d').code !== 0) {
			damp.exitWithError('Command failed: docker-compose up -d');
		}

		console.log(chalk.green('Setting up DAMP sites...'));
		cp('-f', damp.path + '/lib/site/index.html', os.homedir() + '/damp/damp');

		damp.setupVirtualHosts();
	}
}