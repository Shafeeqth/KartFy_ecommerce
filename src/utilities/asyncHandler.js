const asyncHandler = (requestHandler) => (req, res, next) => {

    Promise.resolve(requestHandler(req, res, next))
    .catch((error)=> {
        
        console.log(error);
        next(error)
      return( res.status(500)
       .json({
        success: false,
        error: true,
        message: "Internal server Error!"
       })
    )
    })
}

module.exports = asyncHandler;