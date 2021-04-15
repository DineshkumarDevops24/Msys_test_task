module.exports = (config, logger, CommonService, taskService, async) => {

    return {
        todoTaskList: (req, res) => {
            if (req.query && req.query.userId) {
                const condition = {userId: req.query.userId};
                if (req.query.search) {
                    let regex = new RegExp(req.query.search, "i");
                    condition.$or = [{
                        name: regex
                    }];
                }
                taskService.getTaskList(condition, (err, tasks) => {
                    if (err) {
                        logger.error(err.stack);
                        return res.json(CommonService.getErrorResponse(err.stack));
                    } else {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskList, tasks));
                    }
                });
            } else {
                res.json(config.errors.badRequest.userIdMissing);
            }
        },
        createTodoTasks: (req, res) => {
            if (req.body && req.body.userId && req.body.name) {
                taskService.createTodoTask(req.body, function (err, task) {
                    if (err) {
                        logger.error(err.stack);
                        return res.json(CommonService.getErrorResponse(err.stack));
                    } else if (task) {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskCreated, task));
                    } else {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskCreatedFailed, null));
                    }
                });
            } else {
                res.json(config.errors.badRequest.requiredFieldsMissingForTask);
            }
        },
        deleteTodoTasks: (req, res) => {
            if (req.query && req.query.id) {
                taskService.deleteTodoTask({_id: req.query.id}, function (err, task) {
                    if (err) {
                        logger.error(err.stack);
                        return res.json(CommonService.getErrorResponse(err.stack));
                    } else if (task) {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskDeleted, task));
                    } else {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskDeletedFailed, null));
                    }
                });
            } else {
                res.json(config.errors.badRequest.taskIdMissing);
            }
        },
        updateTodoTask: (req, res) => {
            if (req.query && req.query.id && req.body) {
                taskService.updateTodoTask({_id: req.query.id}, req.body, function (err, task) {
                    if (err) {
                        logger.error(err.stack);
                        return res.json(CommonService.getErrorResponse(err.stack));
                    } else if (task) {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskUpdated, task));
                    } else {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskUpdatedFailed, null));
                    }
                });
            } else {
                res.json(config.errors.badRequest.taskIdMissing);
            }
        },
        updateMultipleTasks: (req, res) => {
            if (req.body && req.body.taskIds && req.body.taskIds.length) {
                async.eachOfSeries(req.body.taskIds, (taskId, key, taskCallback) => {
                    taskService.updateTodoTask({_id: taskId}, req.body, function (err, task) {
                        if (err) taskCallback(err);
                        else taskCallback();
                    });
                }, (err) => {
                    if (err) {
                        logger.error(err.stack);
                        return res.json(CommonService.getErrorResponse(err.stack));
                    } else {
                        return res.json(CommonService.getSuccessResponse(config.success.messages.taskUpdated, true));
                    }
                });
            } else {
                res.json(config.errors.badRequest.taskIdMissing);
            }
        }
    }
}
