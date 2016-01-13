#!/usr/bin/env node

var path = require('path'),
	pkg = require(path.join(__dirname, 'package.json')),
	chalk = require('chalk'),
	program = require('commander');

var damp = {
	path: __dirname,
	exitWithError: function(error) {
		console.log(chalk.red('Error: ' + error));
		exit(1);
	},
	hasDependencies: function() {
		if (!which('docker')) {
			this.exitWithError('DAMP dependency missing: docker');
		}
		if (!which('docker-compose')) {
			this.exitWithError('DAMP dependency missing: docker-compose');
		}
	}
};

var commandDockerCompose = require('./commands/docker-compose.js')(damp);

program
	.version(pkg.version);

program
	.command('up')
	.description('Run DAMP')
	.action(function(cmd, options){
		commandDockerCompose('up -d');
	});

program
	.command('stop')
	.description('Stop DAMP')
	.action(function(cmd, options){
		commandDockerCompose('stop');
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
