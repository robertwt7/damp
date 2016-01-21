#!/usr/bin/env node

var path = require('path'),
	pkg = require(path.join(__dirname, 'package.json')),
	program = require('commander'),
	damp = require('./lib/damp.js');

damp.path = __dirname;

var commandDockerCompose = require('./commands/docker-compose.js')(damp),
	commandDockerMachine = require('./commands/docker-machine.js')(damp),
	commandUp = require('./commands/up.js')(damp);

program
	.version(pkg.version);

program
	.command('up')
	.description('Create the DAMP docker machine and run the containers')
	.option('-d, --driver [driver]', 'Which driver to use for docker machine')
	.action(commandUp);

program
	.command('halt')
	.description('Stop the DAMP docker machine')
	.action(function() {
		commandDockerMachine('stop damp');
	});

program
	.command('status')
	.description('Show the status of the DAMP docker machine')
	.action(require('./commands/status.js')(damp));

program
	.command('destroy')
	.description('Destroy the DAMP docker machine')
	.action(require('./commands/destroy.js')(damp));

program
	.command('start')
	.description('Start DAMP docker containers')
	.action(function() {
		commandDockerCompose('start');
	});

program
	.command('stop')
	.description('Stop DAMP docker containers')
	.action(function() {
		commandDockerCompose('stop');
	});

program
	.command('restart')
	.description('Restart DAMP docker containers')
	.action(function() {
		commandDockerCompose('restart');
	});

program
	.command('create-site')
	.description('Create a new site')
	.action(require('./commands/site/create.js')(damp, commandUp));

program
	.command('remove-site')
	.description('Remove a site')
	.action(require('./commands/site/remove.js')(damp));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
