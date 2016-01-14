var chalk = require('chalk'),
	shell = require('shelljs');

module.exports = {
	path: '',
	exitWithError: function(error) {
		console.log(chalk.red('Error: ' + error));
		exit(1);
	},
	checkDependencies: function() {
		if (!shell.which('docker-machine')) {
			this.exitWithError('DAMP dependency missing: docker-machine');
		}
		if (!shell.which('docker')) {
			this.exitWithError('DAMP dependency missing: docker');
		}
		if (!shell.which('docker-compose')) {
			this.exitWithError('DAMP dependency missing: docker-compose');
		}
	},
	connectToVm: function() {
		// Make sure we connect to the DAMP Docker Machine
		console.log(chalk.green('Connecting to the DAMP docker machine...'));
		var envCmd = shell.exec('docker-machine env damp', { silent: true });
		if (envCmd.code !== 0) {
			this.exitWithError('Command failed: docker-machine env damp');
		}

		var envVars = envCmd.output.split("\n");
		envVars.forEach(function(line) {
			if (line.slice(0, 'export'.length) == 'export') {
				var parts = line.split('=');
				parts[0] = parts[0].replace('export ', '');
				parts[1] = parts[1].replace(/\"/g, '');
				process.env[parts[0]] = parts[1];
			}
		});
	}
};