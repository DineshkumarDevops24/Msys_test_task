const crypto = require("crypto");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
        name: String,
        email: {
            type: String,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        salt: String,
        dob:String,
        address:String,
        role:String,
        createdAt: {
            type: Date, default: Date.now
        },
        updatedAt: {
            type: Date, default: Date.now
        }
    },
    {
        collection: 'users',
        restrict: true,
        minimize: false
    });

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function (next) {
        if (this.isNew) {
            this.createdAt = new Date();
            this.updatedAt = new Date();
        } else {
            this.updatedAt = new Date();
        }
        if (!this.isModified('password')) return next();
        this.makeSalt(16, (saltErr, salt) => {
            if (saltErr) return next(saltErr);
            this.salt = salt;
            this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
                if (encryptErr) return next(encryptErr);
                this.password = hashedPassword;
                next();
            });
        });
    });

/**
 * Methods
 */
UserSchema.methods = {

    makeSalt(byteSize, callback) {
        return crypto.randomBytes(byteSize, (err, salt) => {
            if (err) callback(err);
            else callback(null, salt.toString('base64'));
        });
    },

    encryptPassword(password, callback) {
        const defaultIterations = 10000;
        const defaultKeyLength = 64;
        const salt = new Buffer.from(this.salt, 'base64');
        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1', (err, key) => {
            if (err) return callback(err);
            else return callback(null, key.toString('base64'));
        });
    }
};

module.exports = mongoose.model('UserModel', UserSchema);
