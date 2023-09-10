module.exports = {
  objectIdValidation: function (req, res, next, val) {
    const isValid = !!val.match(/^[0-9a-fA-F]{24}$/);
    if (!isValid) {
      return res.status(400).send({
        ok: false,
        message: 'The id in params is not valid!',
      });
    }
    next();
  },
};
