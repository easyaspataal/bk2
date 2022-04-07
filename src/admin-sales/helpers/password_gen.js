const password_gen = () => {
	var pwdChars =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^";
	var pwdLen = 10;
	var randPassword = Array(pwdLen)
		.fill(pwdChars)
		.map(function (x) {
			return x[Math.floor(Math.random() * x.length)];
		})
		.join("");
	return randPassword;
};

module.exports = password_gen;
