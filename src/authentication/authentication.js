const jwt = require("jsonwebtoken")
const postModel = require("../models/postModel")



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

const postAuthorization = async (req, res,next) => {
  try {
    const postId = req.params.postId
    const tokenUserId = req.decodedToken.userId
    const findPost = await postModel.findOne({ _id: postId,isDeleted:false })
    if(!findPost) return res.status(404).send({ status: false, error: "No post found" })
    const userId = findPost.userId
    if (tokenUserId != userId) return res.status(400).send({ status: false, error: "you are not authorised to make changes in this post" })
    next()
  } catch (error) {
    res.status(500).send({ status: false, error: error.message })
  }
}

module.exports = { authentication,postAuthorization }