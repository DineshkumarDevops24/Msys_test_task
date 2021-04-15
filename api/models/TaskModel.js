const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
        name: String,
        description: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'UserModel'
        },
        startDate: Date,
        duration: String,
        endDate: Date,
        createdAt: {
            type: Date, default: Date.now
        },
        updatedAt: {
            type: Date, default: Date.now
        }
    },
    {
        collection: 'tasks',
        restrict: true,
        minimize: false
    });

/**
 * Pre-save hook
 */
TaskSchema
    .pre('save', function (next) {
        if (this.isNew) {
            this.createdAt = new Date();
            this.updatedAt = new Date();
        } else {
            this.updatedAt = new Date();
        }
        next();
    });

module.exports = mongoose.model('TaskModel', TaskSchema);
