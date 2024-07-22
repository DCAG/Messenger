module.exports = (error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const longMessage = error.longMessage;
  const action = error.action;
  const data = error.data;
  res.status(status).json({ message, longMessage, data, action });
}