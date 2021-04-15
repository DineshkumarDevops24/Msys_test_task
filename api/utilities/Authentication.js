module.exports = (jwt, config, logger) => {

    const JWT = config.settings.JWT;
    const errorMessages = config.settings.errors.messages;
    const errorCode = config.settings.statusCode.clientError;

    return {
        verifyToken: function (req, res, next) {
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];
                jwt.verify(token, JWT.secretKey, function (err, decoded) {
                    if (err) {
                        if (err.name === 'TokenExpiredError') {
                            logger.error(errorMessages.tokenExpired, err.stack);
                            return res.json({
                                message: errorMessages.tokenExpired,
                                statusCode: errorCode.tokenExpired,
                                error: err.stack
                            });
                        } else {
                            logger.error(errorMessages.tokenMalformed);
                            return res.json({
                                message: errorMessages.tokenMalformed,
                                statusCode: errorCode.Unauthorized
                            });
                        }
                    } else {

                        next();
                    }
                });
            } else {
                logger.error(errorMessages.tokenEmpty);
                return res.json({
                    message: errorMessages.tokenEmpty,
                    statusCode: errorCode.Unauthorized
                });
            }
        },

        verifyTokenForAdmin: function (req, res, next) {
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];
                jwt.verify(token, JWT.secretKey, function (err, decoded) {
                    if (err) {
                        if (err.name === 'TokenExpiredError') {
                            logger.error(errorMessages.tokenExpired, err.stack);
                            return res.json({
                                message: errorMessages.tokenExpired,
                                statusCode: errorCode.tokenExpired,
                                error: err.stack
                            });
                        } else {
                            logger.error(errorMessages.tokenMalformed);
                            return res.json({
                                message: errorMessages.tokenMalformed,
                                statusCode: errorCode.Unauthorized
                            });
                        }
                    } else {
                        if(decoded.role === 'Admin'){
                            next();
                        }else{
                            return res.json({
                                message: errorMessages.tokenMalformed,
                                statusCode: errorCode.Unauthorized
                            });
                        }
                    }
                });
            } else {
                logger.error(errorMessages.tokenEmpty);
                return res.json({
                    message: errorMessages.tokenEmpty,
                    statusCode: errorCode.Unauthorized
                });
            }
        },

        generateJWTToken: function (email,role,  callback) {
            jwt.sign({
                data: { email , role}
            }, JWT.secretKey, {expiresIn: JWT.expiration}, function (err, token) {
                if (err) callback(err);
                else {
                    if (token) callback(null, token);
                    else callback(null, false);
                }
            });
        }
    }
};
