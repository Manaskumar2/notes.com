const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  getUserDetails,
  updateUser,
  getUserById,
} = require("../Controller/userController");


const {
  createNotes,
  getNotes,
  updateNote,
  reviewbyNote,
  getNoteById,
  getNoteReivewsById,
  getNoteByUserId,
} = require("../Controller/notesController");



const { getFile } = require("../Controller/fileController");
const {authentication} = require("../authentication/authentication");
//------------------------------⭐ User_routes ⭐-------------------------------//

router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.get("/:userId/userDetails", authentication, getUserDetails);

router.get("/getUserById", authentication, getUserById);
router.put("/updateUser", authentication, updateUser);


//------------------------------⭐Notes_routes⭐-------------------------------//

router.post("/notesCreate", authentication, createNotes);
router.get("/getNotes", getNotes);
router.get("/getnotesbyuserid/:userId", getNoteByUserId);
router.get("/note/:noteId", getNoteById);
router.get("/note/:noteId/reviews", getNoteReivewsById);
router.put("/notes/:noteId", authentication, updateNote);
router.post("/notes/:noteId/review", authentication, reviewbyNote);

//--------------------⭐file Apis⭐--------------------//

router.get("/resource/:fileType/:key", getFile)



module.exports = router;
