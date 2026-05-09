// Consistent response format across all endpoints
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

const sendError = (res, message = 'Something went wrong', statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  })
}

module.exports = { sendSuccess, sendError }