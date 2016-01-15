var chalk = require('chalk'),
	shell = require('shelljs'),
	fs = require('fs');

module.exports = {
	path: '',
	hostsFile: function() {
		return process.platform === 'win32' ? 'C:/Windows/System32/drivers/etc/hosts' : '/etc/hosts';
	},
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
	},
	getIp: function() {
		var ipCmd = shell.exec('docker-machine ip damp', { silent: true });
		return ipCmd.output.replace("\n", '');
	},
	addToHostsFile: function(ip, domain) {
		var hostsFile = this.hostsFile();

		var catCmd = shell.exec('sudo cat ' + hostsFile, { silent: true });
		if (catCmd.code === 0) {
			if (catCmd.output.indexOf(ip + ' ' + domain) == -1) {
				var cmd = 'echo \'' + ip + ' ' + domain + ' # Added by DAMP\' >> ' + hostsFile;
				if (shell.exec('sudo -- sh -c "' + cmd + '"', { silent: true }).code !== 0) {
					this.exitWithError('There was an error adding "' + ip + ' ' + domain + '" to ' + hostsFile + '. Please add manually.');
				}
			}
		} else {
			this.exitWithError('There was an error reading ' + hostsFile);
		}
	},
	setupVirtualHosts: function() {
		var ip = this.getIp(),
			content = fs.readFileSync(this.path + '/lib/damp/docker-compose.yml').toString(),
			hosts = content.match(/.*VIRTUAL_HOST=([a-zA-Z0-9.]+)\n/gm);

		if (hosts.length) {
			console.log(chalk.green('Adding domains to hosts file...'));
			hosts.forEach(function(host) {
				if (host.indexOf('#') !== 0) {
					var domain = host.replace("\n", '').replace(/(.*)VIRTUAL_HOST=/, '').trim();
					this.addToHostsFile(ip, domain);
				}
			}.bind(this));
		}
	},
	removeVirtualHosts: function() {
		var hostsFile = this.hostsFile();

		var catCmd = shell.exec('sudo cat ' + hostsFile, { silent: true });
		if (catCmd.code !== 0) {
			this.exitWithError('There was an error reading from ' + hostsFile);
		}

		var newContent = [];
			content = catCmd.output.split('\n');
		content.forEach(function(line){
			if (line.indexOf('# Added by DAMP') === -1) {
				newContent.push(line);
			}
		}.bind(this));

		console.log(chalk.green('Removing domains from hosts file...'));
		var output = newContent.join('\n');
		fs.writeFileSync('/tmp/hosts', output);

		var cmd = 'cp -f /tmp/hosts ' + hostsFile;
		if (shell.exec('sudo -- sh -c "' + cmd + '"', { silent: true }).code !== 0) {
			this.exitWithError('There was an error writing to ' + hostsFile);
		}
	}
};