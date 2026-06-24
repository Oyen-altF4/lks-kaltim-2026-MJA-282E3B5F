const successRes = (res, code, message, data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(code).json(payload);
};

const errorRes = (res, code, message, errors = null) => {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(code).json(payload);
};

module.exports = { successRes, errorRes };
