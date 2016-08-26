This is a simplified wrapper for openpgpjs/openpgpjs

<h2>Examples</h2>

<h4>Generating New Keys</h4>
<pre>
angular.module("SampleModule", ["OpenPGP"])
  .controller("SampleController", ["$scope", "$log", "$pgp", 
    function($scope, $log, $pgp) {
      $scope.user = {
        name:  'John Doe',
        email: 'johndoe@server.com',
        passphrase: 'my super secret password',
        pubkey: '',
        privkey: ''
      }
      
      $scope.generateKeys = function() {
        //keySize should be increased. Only using smaller size for testing
        $pgp.keygen($scope.name, $scope.email, $scope.passphrase, 512) 
    		.then(function(result) {
    		  $scope.$apply(function() {
    			  $scope.pubkey = result.publicKeyArmored;
    				$scope.privkey = result.privateKeyArmored;
    			},
    		function(error) {
      	  $log.error(error);
      	});
      }
}]);
</pre>
