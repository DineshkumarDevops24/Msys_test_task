module.exports = async function (config, mongoose, logger) {

    try {
        await mongoose.connect(config.settings.database.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }).then(async () => {
            console.log("Connected to the database!");
            logger.info("Connected to the database!", mongoose);
        });
    } catch (err) {
        console.log("Cannot connect to the database!", err);
        logger.error("Cannot connect to the database!", err);
    }


}

