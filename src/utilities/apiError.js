class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        error = [],
        stack 
    ){
        super(message);
        this.data = null;
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.error = error;

        this.stack = stack ?? Error.captureStackTrace(this, this.constructor);

    }



}

module.exports = ApiError;