require('shelljs/global');

module.exports = function(damp) {
	return function(dockerMachineCommand) {
		damp.checkDependencies();
		damp.connectToVm();

		cd(damp.path + '/lib/damp')
		if (exec('docker-machine ' + dockerMachineCommand).code !== 0) {
			damp.exitWithError('Command failed: docker-machine ' + dockerMachineCommand);
		}
	}
}