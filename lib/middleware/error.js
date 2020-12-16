// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let status = err.status || 500;

  if (err.message) status = 404;

  res.status(status);

  res.send({
    status,
    message: err.message
  });
};
