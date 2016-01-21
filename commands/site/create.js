require('shelljs/global');
var chalk = require('chalk'),
	inquirer = require("inquirer"),
	fs = require("fs"),
	YAML = require('yamljs');

module.exports = function(damp, commandUp) {
	return function() {
		damp.checkDependencies();

		inquirer.prompt([
			{
				name: 'name',
				message: 'Enter the name of your site (e.g. {name}.damp.dev):',
				validate: damp.validateSubdomain
			},
			{
				type: 'list',
				name: 'type',
				message: 'What type of site would you like to create?',
				choices: [
					{ name: 'Static (Apache)', value: 'static' },
					{ name: 'WordPress', value: 'wordpress' }
				]
			}
		], function(answers) {
			if (!answers.name || !answers.type) {
				return;
			}
			var name = answers.name,
				type = answers.type;

			console.log(chalk.green('Creating new DAMP docker container...'));
			var dockerCompose = YAML.load(damp.path + '/lib/damp/docker-compose.yml');
			if (!dockerCompose) {
				damp.exitWithError('Failed to load docker-compose.yml');
			}

			fs.readFile(damp.path + '/lib/templates/' + type + '.yml', 'utf8', function(err, data) {
				if (err) {
					damp.exitWithError(err);
				}

				data = data.replace(/\{name\}/gm, name);
				dockerCompose[name] = YAML.parse(data)[name];

				fs.writeFile(damp.path + '/lib/damp/docker-compose.yml', YAML.stringify(dockerCompose), function(err) {
					if (err) {
						damp.exitWithError(err);
					}

					commandUp.call(this, {});
				});
			});
		});
	}
}