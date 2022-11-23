const { allowedCors, DEFAULT_ALLOWED_METHODS } = require("../utils/constants");

function handleCors(req, res, next) {
  const { method } = req;
  const { origin } = req.headers;
  console.log(origin);
  const requestHeaders = req.headers["access-control-request-headers"];
  if (allowedCors.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  // res.header("Access-Control-Allow-Origin", "*");
  if (method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
    res.header("Access-Control-Allow-Headers", requestHeaders);
    return res.end();
  }
  next();
}

module.exports = { handleCors };
