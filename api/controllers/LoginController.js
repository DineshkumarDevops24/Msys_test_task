module.exports = (config, userService, logger, CommonService, authentication, crypto) => {

    function encryptPassword(password, existingSalt, callback) {
        const defaultIterations = 10000;
        const defaultKeyLength = 64;
        const salt = new Buffer.from(existingSalt, 'base64');
        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1', (err, key) => {
            if (err) callback(err);
            else callback(null, key.toString('base64'));
        });
    }

    function validateUser(userPassword, password, salt, callback) {
        encryptPassword(userPassword, salt, function (err, pwdGen) {
            if (err) callback(err);
            else if (password === pwdGen) callback(null, true);
            else callback(null, false);
        });
    }

    return {
        signIn: (req, res) => {
            let userInput = req.body;
            if (!userInput.email || !userInput.password) {
                res.json(config.errors.badRequest.userNameMissing);
            } else {
                userService.getUserDetail({email: userInput.email}, (err, user) => {
                   if (err) return res.json(CommonService.getErrorResponse(err.stack));
                   else {
                       validateUser(userInput.password, user.password, user.salt, (err, isUserValid) => {
                            if (err) return res.json(CommonService.getErrorResponse(err.stack));
                            else if (!isUserValid) return res.json(CommonService.invalidUser(config.errors.messages.userNotFound));
                            else {
                                delete user._doc.salt;
                                delete user._doc.password;
                                authentication.generateJWTToken(userInput.email, userInput.role, (err, token) => {
                                    if (err) return res.json(CommonService.getErrorResponse(err.stack));
                                    else if (token) return res.json(CommonService.getSuccessResponse(config.success.messages.loginSuccess, {user, token}));
                                    else return res.json(CommonService.invalidUser(config.errors.messages.userNotFound));
                                });
                            }
                       });
                   }
                });
            }
        }
    }
}