(function() {
	var module = angular.module("OpenPGP", []);
	var defaultKeySize = 4096;

	module.factory("$pgp", ["$window", "$q", function($window, $q) {
		return new OpenPGP($window, $q);
	}]);

	module.provider('$pgpProvider', function () {
        this.$get = ["$window", "$q", function OpenPgpFactory($window, $q) {
            return OpenPGP($window, $q);
        }];
    });

    function OpenPGP($window, $q) {
    	var openpgp = $window.openpgp;
    	return {
    		keydata: function(pubkey) {
    			var user = openpgp.key.readArmored(pubkey).keys[0].users[0].userId.userid.split(" ");
    			return {
    				name: user[0],
    				email: user[1].replace("<", "").replace(">", "")
    			};
    		},
			encrypt: function(message, pubkeys) {
				var options = {
				    data: message,
				    publicKeys: openpgp.key.readArmored(pubkeys).keys
				};

				var deferred = $q.defer();
				openpgp.encrypt(options)
					.then(function(response) {
						deferred.resolve(response.data);
					})
					.catch(function(error) {
						deferred.resolve(error);
					});

				return deferred.promise;
			},
			decrypt: function(message, privkey, passphrase) {
				var options = {
				    message: openpgp.message.readArmored(message),
				    privateKey: openpgp.key.readArmored(privkey).keys[0]
				};
				if (passphrase && passphrase.length>0) {
					var key = openpgp.key.readArmored(privkey);
					key.keys[0].decrypt(passphrase);
					options['privateKey'] = key.keys[0];
				}

				var deferred = $q.defer();
				openpgp.decrypt(options)
				.then(function(response) {
					deferred.resolve(response.data);
				})
				.catch(function(error) {
					deferred.reject(error);
				});
				return deferred.promise;
			},
			keygen: function(name, email, passphrase, keySize) {
				if (!keySize || isNaN(keySize) || keySize<=0 ) {
					keySize = defaultKeySize;
				}
				
				var options = {
					numBits: keySize,
					userIds: {}
				}

				if (name && name.length>0) {
					options['userIds']['name'] = name;
				}
				if (email && email.length>0) {
					options['userIds']['email'] = email;
				}
				if (passphrase && passphrase.length>0) {
					options['passphrase'] = passphrase;
				}

				var deferred = $q.defer();
				openpgp.generateKey(options)
				.then(function(response) {
					deferred.resolve({
						pubkey: response.publicKeyArmored,
						privkey: response.privateKeyArmored
					});
				})
				.catch(function(response) {
					deferred.reject(response);
				});
				return deferred.promise;
			}
		};
    }

})();
