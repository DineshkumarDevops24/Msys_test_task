module.exports = (config) => {

    const successCode = config.statusCode.success;
    const databaseError = config.errors.internalServerError.afterQuery;
    const serverErrorCode = config.statusCode.serverError.internalServerError;

    return {
        getErrorResponse: (err) => {
            return {
                statusCode: serverErrorCode,
                message: databaseError,
                err: err.stack
            }
        },
        getSuccessResponse: (message, data) => {
            return {
                statusCode: successCode.OK,
                message: message,
                data: data
            }
        },
        invalidUser: (message, data) => {
            return {
                statusCode: successCode.NotFound,
                message: message,
                data: data
            }
        }
    }
}