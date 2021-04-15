module.exports = (config, userService, logger, CommonService) => {
    const csv = require('csv-parser')
    const fs = require('fs')
    var multiparty = require('multiparty');
    const crypto = require("crypto");
    const async = require("async")

   const  makeSalt = (byteSize, callback) => {
        return crypto.randomBytes(byteSize, (err, salt) => {
            if (err) callback(err);
            else callback(null, salt.toString('base64'));
        });
    }

    const encryptPassword = (password, salts, callback)=> {
        const defaultIterations = 10000;
        const defaultKeyLength = 64;
        const salt = new Buffer.from(salts, 'base64');
        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1', (err, key) => {
            if (err) return callback(err);
            else return callback(null, key.toString('base64'));
        });
    }

    return {
        getUserList: (req, res) => {
            let params = req.query;
            let condition = {};
            params.limit = params.limit ? Number(params.limit) : 10;
            params.page = params.page ? Number(params.page) : 0;
            const data = {
                query: condition,
                skip: params.page * params.limit,
                limit: params.limit
            };
            userService.getUsers(data, function (err, users) {
                if (err) {
                    logger.error(err.stack);
                    return res.json(CommonService.getErrorResponse(err.stack));
                } else {
                    return res.json(CommonService.getSuccessResponse(config.success.messages.userList, users));
                }
            });
        },
        getUserDetail: (req, res) => {
            userService.findUser(req.params.id, function (err, user) {
                if (err) {
                    logger.error(err.stack);
                    return res.json(CommonService.getErrorResponse(err.stack));
                } else {
                    return res.json(CommonService.getSuccessResponse(config.success.messages.userDetail, user));
                }
            });
        },
        deleteUser: (req, res) => {
            if (req.params.id) {
                userService.deleteUser({_id: req.params.id}, function (err, deleteRes) {
                    if (err) {
                        logger.error(serverErrorCode, databaseError, err.stack);
                        return res.json(CommonService.getErrorResponse(err.stack));
                    }
                    return res.json(CommonService.getSuccessResponse(config.success.messages.deleteUser, deleteRes));
                });
            } else {
                return config.errors.badRequest.userIdMissing;
            }
        },
        createUser: (req, res) => {
            if (req.body && req.body.email) {
                userService.createUser(req.body, function (err, user) {
                    if (err) {
                        logger.error(err.stack);
                        return res.json(CommonService.getErrorResponse(err.stack));
                    }
                    if (typeof user === 'string') return res.json(CommonService.getSuccessResponse(user, null));
                    return res.json(CommonService.getSuccessResponse(config.success.messages.createUser, user));
                });
            } else {
                res.json(config.errors.badRequest.requiredFieldsMissing);
            }
        },

        uploadCsv: (req, res) =>{
            try {
                    var form = new multiparty.Form();
                    form.parse(req, function (err, fields, files) {
                    const results = [];
                    fs.createReadStream(files.file[0].path)
                        .pipe(csv())
                        .on('data', (data) => results.push(data))
                        .on('end', () => {
                            console.log(results);
                            async.eachOfSeries(results, (user, i, callBack)=>{
                                makeSalt(16, (saltErr, salt) => {
                                    user.salt = salt;
                                    encryptPassword(user.password,salt, (encryptErr, hashedPassword) => {
                                        user.password = hashedPassword;
                                        callBack();
                                    })
                                })
                            }, ()=>{
                                userService.uploadUserInBulk(results, (err, users) =>{
                                    if (err)
                                        return res.json(CommonService.getErrorResponse(err.stack));
                                    else{
                                        return res.json(CommonService.getSuccessResponse("Users Uploaded Successfully",users ));
                                    }
                                })
                            })
                        });
                    })
            }catch (e) {
               return  res.json(e);
            }

        }
    };
}

