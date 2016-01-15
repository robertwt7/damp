#!/usr/bin/env node

var path = require('path'),
	pkg = require(path.join(__dirname, 'package.json')),
	chalk = require('chalk'),
	program = require('commander'),
	damp = require('./lib/damp.js');

damp.path = __dirname;

var commandDockerCompose = require('./commands/docker-compose.js')(damp),
	commandDockerMachine = require('./commands/docker-machine.js')(damp),
	commandUp = require('./commands/up.js')(damp),
	commandDestroy = require('./commands/destroy.js')(damp);

program
	.version(pkg.version);

program
	.command('up')
	.description('Create the DAMP docker machine and run the containers')
	.action(commandUp);

program
	.command('halt')
	.description('Stop the DAMP docker machine')
	.action(function(){
		commandDockerMachine('stop damp');
	});

program
	.command('destroy')
	.description('Destory the DAMP docker machine')
	.action(commandDestroy);

program
	.command('start')
	.description('start DAMP docker containers')
	.action(function(cmd, options){
		commandDockerCompose('start');
	});

program
	.command('stop')
	.description('stop DAMP docker containers')
	.action(function(cmd, options){
		commandDockerCompose('stop');
	});

program
	.command('restart')
	.description('restart DAMP docker containers')
	.action(function(cmd, options){
		commandDockerCompose('restart');
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
