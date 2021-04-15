module.exports = (UserModel, TaskModel, mongoose) => {

    return {
        deleteUser: (condition, callback) => {
            UserModel.findOneAndDelete(condition, {salt: 0, password: 0}).exec((err, deleteRes) => {
                if (err) return callback(err);
                else return callback(null, deleteRes);
            });
        },
        findUser: (userId, callback) => {
            UserModel.aggregate([{$match: {_id: mongoose.Types.ObjectId(userId)}},
                {$lookup: {
                        from: "tasks",
                        localField: "_id",
                        foreignField: "userId",
                        as: "tasks"
                    }},
                {$project: {password: 0, salt: 0}}]).exec((err, userDetail) => {
                    if (err) return callback(err);
                    else return callback(null, userDetail);
            });
        },
        getUsers: (condition, callback) => {
            UserModel.find(condition.query, {salt: 0, password: 0}).limit(condition.limit).skip(condition.skip).exec((err, users) => {
                if (err) return callback(err);
                else return callback(null, users);
            });
        },
        createUser: (userDetail, callback) => {
            UserModel.findOne({email: userDetail.email}, {salt: 0, password: 0}).exec((err, user) => {
                if (err) return callback(err);
                else {
                   if (!user) {
                       const user = new UserModel(userDetail);
                       user.save((err, user) => {
                           if (err) return callback(err);
                           else return callback(null, user);
                       });
                   } else {
                       callback(null, 'Email already exists');
                   }
                }
            });
        },
        getUserDetail: (condition, callback) => {
            UserModel.findOne(condition).exec((err, user) => {
                if (err) return callback(err);
                else return callback(null, user);
            });
        },

        uploadUserInBulk:(userDetail, callback) =>{
            UserModel.insertMany(userDetail, (err, user) => {
                if (err) return callback(err);
                else return callback(null, user);
            });
        }
    }
}