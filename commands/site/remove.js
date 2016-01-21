require('shelljs/global');
var chalk = require('chalk'),
	inquirer = require("inquirer"),
	fs = require("fs"),
	YAML = require('yamljs');

module.exports = function(damp) {
	return function() {
		damp.checkDependencies();

		var containersCmd = exec('docker ps --filter "name=damp" --format "{{.Names}}"', { silent: true });
		if (containersCmd.code !== 0) {
			damp.exitWithError('Failed to find DAMP docker containers');
		}

		var names = containersCmd.output.split('\n'),
			formattedNames = [];
		names.forEach(function(name) {
			if (name) {
				var cleanName = name.replace('damp_', '').replace('_1', '');
				if (damp.reservedNames.indexOf(cleanName) === -1) {
					formattedNames.push(cleanName);
				}
			}
		});

		if (!formattedNames.length) {
			console.log(chalk.green('No DAMP docker containers to be removed'));
			exit(1);
		}

		inquirer.prompt([
			{
				type: 'list',
				name: 'name',
				message: 'Select a container to remove:',
				choices: formattedNames
			}
		], function(answers) {
			if (!answers.name) {
				return;
			}
			var name = answers.name;

			console.log(chalk.green('Removing DAMP docker container...'));
			var dockerCompose = YAML.load(damp.path + '/lib/damp/docker-compose.yml');
			if (!dockerCompose) {
				damp.exitWithError('Failed to load docker-compose.yml');
			}

			if (dockerCompose[name] !== undefined) {
				delete dockerCompose[name];
			} else {
				damp.exitWithError('Could not find ' + name + ' in docker-compose.yml');
			}

			fs.writeFile(damp.path + '/lib/damp/docker-compose.yml', YAML.stringify(dockerCompose), function(err) {
				if (err) {
					damp.exitWithError(err);
				}

				if (exec('docker rm -f damp_' + name + '_1').code !== 0) {
					damp.exitWithError('Command failed: docker rm -f damp_' + name + '_1');
				}
			});
		});
	}
}