(function() {
	var module = angular.module("OpenPGP", []);
	var defaultKeySize = 4096;

	module.factory("$pgp", ["$window", function($window) {
		return new OpenPGP($window);
	}]);

	module.provider('$pgpProvider', function () {
        this.$get = ["$window", function OpenPgpFactory($window) {
            return OpenPGP($window);
        }];
    });

    function OpenPGP($window) {
    	var openpgp = $window.openpgp;
    	return {
			encrypt: function(message, pubkeys) {
				var options = {
				    data: message,
				    publicKeys: openpgp.key.readArmored(pubkeys).keys
				};

				return openpgp.encrypt(options);
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

				return openpgp.decrypt(options);
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

				return openpgp.generateKey(options);
			}
		};
    }

})();