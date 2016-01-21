var chalk = require('chalk'),
	shell = require('shelljs'),
	fs = require('fs'),
	YAML = require('yamljs');

module.exports = {
	path: '',
	reservedNames: ['proxy', 'database', 'phpmyadmin', 'damp'],
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
			content = fs.readFileSync(this.path + '/lib/damp/docker-compose.yml').toString();

		var dockerCompose = YAML.parse(content);
		Object.keys(dockerCompose).forEach(function(key) {
			var host = dockerCompose[key];
			if (host.environment.length) {
				host.environment.forEach(function(item) {
					if (item.indexOf('VIRTUAL_HOST=') != -1) {
						var domain = item.replace('VIRTUAL_HOST=', '').trim();
						this.addToHostsFile(ip, domain);
					}
				}.bind(this));
			}
		}.bind(this));
	},
	removeVirtualHosts: function() {
		var hostsFile = this.hostsFile();

		var catCmd = shell.exec('sudo cat ' + hostsFile, { silent: true });
		if (catCmd.code !== 0) {
			this.exitWithError('There was an error reading from ' + hostsFile);
		}

		var newContent = [];
		content = catCmd.output.split('\n');
		content.forEach(function(line) {
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
	},
	validateSubdomain: function(input) {
		if (input.length < 3) {
			return 'Name must be at least 3 characters long';
		}
		if (!input.match(/^[a-z0-9]+$/i)) {
			return 'Name must be only letters and numbers';
		}
		if (['proxy', 'database', 'phpmyadmin', 'damp'].indexOf(input) != -1) {
			return 'Invalid site name';
		}

		return true;
	}
};