module.exports = (TaskModel) => {

    return {
        getTaskList: (condition, callback) => {
            TaskModel.find(condition).exec(callback);
        },
        createTodoTask: (taskDetail, callback) => {
            const task = new TaskModel(taskDetail);
            task.save(callback);
        },
        deleteTodoTask: (condition, callback) => {
            TaskModel.findByIdAndDelete(condition).exec(callback);
        },
        updateTodoTask: (condition, data, callback) => {
            TaskModel.findOne(condition).exec((err, task) => {
                if (err) return callback(err);
                Object.assign(task, data);
                task.save(callback);
            });
        },
    }
}
