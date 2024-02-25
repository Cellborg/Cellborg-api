const { envvv } = require("../constants");

async function errorHandlerMiddleware(req, res, next) {
    let retries = 1;
    
    async function execute() {
        try {
            await next();  // Proceed to the next middleware or route handler
        } catch (err) {
            if (retries > 0) {
                retries--;
                console.log(`Retrying... Attempts left: ${retries}`);
                execute();
            } else {
                console.log('Exceeded retry limit. Sending error response.');
                console.error(err.stack);
                const status = err.status || 500;
                const errorResponse = {
                  status: 'error',
                  statusCode: status,
                  message: err.message || 'An unexpected error occurred'
                };
            
                if (envvv === 'developme') {
                  errorResponse.stack = err.stack;
                }
                res.status(status).json(errorResponse);
            }
        }
    }
    execute();
};

module.exports = errorHandlerMiddleware;