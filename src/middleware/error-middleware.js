const errorMiddleware = (err,req,res,next) => {
    console.error('Error middleware received:', err);

    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred';

    res.status(status).json({
        success: false,
        message: message,
    });
}

export {errorMiddleware};