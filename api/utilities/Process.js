module.exports = async (mongoose, config, jwt, logger, crypto, authentication, async) => {

    const configSettings = config.settings;

    // Models
    const UserModel = require('../models/UserModel');
    const TaskModel = require('../models/TaskModel');

    //services
    const userService = require('../services/UserService')(UserModel, TaskModel, mongoose);
    const commonService = require('../services/CommonService')(configSettings);
    const taskService = require('../services/TaskService')(TaskModel);

    // Controllers
    const userController = require('../controllers/UserController')(configSettings, userService, logger, commonService);
    const loginController = require('../controllers/LoginController')(configSettings, userService, logger, commonService, authentication, crypto);
    const taskController = require('../controllers/TaskController')(configSettings, logger, commonService, taskService, async)

    return {
        signIn: (req, res) => {
            loginController.signIn(req, res);
        },
        userList: (req, res) => {
            userController.getUserList(req, res);
        },
        userDetail: (req, res) => {
            userController.getUserDetail(req, res);
        },
        deleteUser: (req, res) => {
            userController.deleteUser(req, res);
        },
        createUser: (req, res) => {
            userController.createUser(req, res);
        },
        uploadCsv:(req, res) =>{
            userController.uploadCsv(req,res);
        },
        todoTasks: (req, res) => {
            taskController.todoTaskList(req, res);
        },
        createTodoTasks: (req, res) => {
            taskController.createTodoTasks(req, res);
        },
        deleteTodoTasks: (req, res) => {
            taskController.deleteTodoTasks(req, res);
        },
        updateTodoTask: (req, res) => {
            taskController.updateTodoTask(req, res);
        },
        updateMultipleTasks: (req, res) => {
            taskController.updateMultipleTasks(req, res);
        }
    }
}
