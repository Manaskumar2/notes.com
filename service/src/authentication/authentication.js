const jwt = require("jsonwebtoken")




const authentication = (req, res, next) => {
  try {
    let bearerHeader = req.headers.authorization;
    if (typeof bearerHeader == "undefined") return res.status(400).send({ status: false, message: "Token is missing" });

    let bearerToken = bearerHeader.split(' ')
    let token = bearerToken[1];
    jwt.verify(token, process.env.SECRET_KEY, function (err, data) {
      if (err) {
        return res.status(400).send({ status: false, message: err.message })
      } else {
        req.decodedToken = data;
        next()
      }
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}



module.exports = { authentication }