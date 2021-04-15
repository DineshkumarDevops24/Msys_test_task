module.exports = async (app, router, logger, config, mongoose) => {

    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const async = require('async');

    const routes = config.settings.routes;
    const authentication = require('../utilities/Authentication')(jwt, config, logger);
    const process = await require('../utilities/Process')(mongoose, config, jwt, logger, crypto, authentication, async);

    router.get('/', function (req, res, next) {
        res.send('Express server listening....');
    });

    router.post(routes.signIn, process.signIn);

    // user curd
    router.get(routes.users, authentication.verifyToken, process.userList);
    router.get(routes.user, authentication.verifyToken, process.userDetail);
    router.delete(routes.user, authentication.verifyToken, process.deleteUser);
    router.post(routes.createUser, authentication.verifyToken, process.createUser);
    router.post(routes.uploadCsv, authentication.verifyTokenForAdmin, process.uploadCsv)

    // Tasks
    router.get(routes.todoTasks, authentication.verifyToken, process.todoTasks);
    router.post(routes.task, authentication.verifyToken, process.createTodoTasks);
    router.delete(routes.task, authentication.verifyToken, process.deleteTodoTasks);
    router.put(routes.task, authentication.verifyToken, process.updateTodoTask);
    router.put(routes.updateMultipleTasks, authentication.verifyToken, process.updateMultipleTasks);

}
