require('shelljs/global');

module.exports = function(damp) {
	return function() {
		damp.checkDependencies();

		exec('docker-machine status damp');
	}
}