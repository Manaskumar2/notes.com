const noteModel = require("../Models/notesModel");
const validation = require("../validations/validaton");
const fileUploader = require("../FileUploader/fileUploader");
const userModel = require("../Models/userModel");
const fileUploadsModel = require("../Models/fileUploadsModel");
const xss = require('xss')

const createNotes = async (req, res) => {
  try {
    const data =req.body;
    const files = req.files;
    const {topicType, category, subject, rattings } =
      data;
    const userId = req.decodedToken.userId;
    
    if (!data)
      return res
        .status(400)
        .send({ status: false, message: "input data to create a note" });
    if (validation.isValidBody(data))
      return res.status(400).send({ status: false, message: "invalid input" });
    

    const discriptions = xss(data.discriptions)
    const  topics = xss(data. topics)

    if (!validation.isValid(topics))
      return res.status(400).send({ status: false, message: "input topics" });
    if (!validation.isValid(topicType))
      return res
        .status(400)
        .send({ status: false, message: "input topic type" });
    if (!validation.isValid(discriptions))
      return res
        .status(400)
        .send({ status: false, message: "input descriptions" });
    if (!validation.isValid(category))
      return res.status(400).send({ status: false, message: "input category" });
    if (!validation.isValid(subject))
      return res.status(400).send({ status: false, message: "input subject" });
    if (!validation.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please log in to create Notes" });
    if (validation.isValid(rattings))
      if (rattings != "0")
        return res.status(400).send({
          status: false,
          message:
            "review can't set value other than zero while creating new Notes..!",
        });

    const saveData = {
      topics,
      topicType,
      discriptions,
      category,
      subject,
      userId,
      rattings,
    };

    if (files.length > 1) {
      if (validation.isValidImage(files[0]))
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid image file" });
      let uploadedFileDetails = await fileUploader.uploadFile(files[0]);
            
       const newUploadFIleDetails = await fileUploadsModel.create({path: uploadedFileDetails.path, fileType: 'img', requireAuth: false, key: uploadedFileDetails.key});
      saveData.coverImage = newUploadFIleDetails.key

      if (validation.isValidImage(files[1])){
        return res
        .status(400)
        .send({ status: false, message: "Enter a valid  file" });
      }

      const uploadedFile = await fileUploader.uploadFile(files[1]);
            
      const newUpload = await fileUploadsModel.create({path: uploadedFile.path, fileType: 'pdf', requireAuth: false, key: uploadedFile.key})
      saveData.fileLink = newUpload.key;
    }

    const notesCreated = await noteModel.create(saveData);
    return res.status(201).send({ status: true, data: notesCreated });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    let data = req.body;
    let noteId = req.params.noteId;

    if (!validation.isValidObjectId(noteId)) {
      return res
        .status(400)
        .send({ Status: false, message: "Please enter valid noteId" });
    }
    let { topics, discriptions, subject } = data;

    if (validation.isValidBody(data))
      return res.status(400).send({
        status: false,
        message: "Please, provide notes details to update notes...!",
      });

    const note = {};

    if (topics) {
      if (!validation.isValid(topics) || !validation.regexSpaceChar(topics))
        return res.status(400).send({
          status: false,
          message: "topics is required in valid format...!",
        });
      let checktopics = await noteModel.findOne({ topics: topics });
      if (checktopics)
        return res
          .status(400)
          .send({ status: false, message: "Notes topics is already exist" });
      note.topics = topics;
    }
    if (discriptions) {
      if (!validation.isValid(topics))
        return res.status(400).send({
          status: false,
          message: " please provide discriptions to update",
        });
      if (!validation.regexSpaceChar(discriptions))
        return res.status(400).send({
          status: false,
          message: "discriptions is required in valid format...!",
        });
      note.discriptions = discriptions;
    }
    if (subject) {
      if (!validation.isValid(topics))
        return res.status(400).send({
          status: false,
          message: " please provide subject to update",
        });
      if (!validation.regexSpaceChar(subject))
        return res.status(400).send({
          status: false,
          message: "subject is required in valid format...!",
        });
      note.subject = subject;
    }

    let findNote = await bookModel.findById(noteId);
    if (!findNote) {
      return res
        .status(404)
        .send({ status: false, message: "noteId is invalid" });
    }

    if (findNote.isDeleted) {
      return res
        .status(404)
        .send({ status: false, message: "Notedata is already deleted" });
    }

    if (!findNote.isDeleted) {
      let updatedNote = await noteModel.findOneAndUpdate(
        { _id: noteId },
        note,
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "update sucsessfully",
        data: updatedNote,
      });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const reviewbyNote = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const { rating, reviewStr } = req.body;
    const user = req.decodedToken.userId;
    const userDetails = await userModel.findById({ _id: user });

    if (!user) {
      return res.status(403).send({ status: false, message: "please Log-in" });
    }

    const doc = await noteModel.findById(noteId);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.isDeleted) {
      return res.status(404).json({ message: "Notedata is already deleted" });
    }
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .send({ message: "Rating must be between 1 and 5" });
      }

      const existingRating = doc.ratings.find((r) => r.user.equals(user));

      if (existingRating) {
        existingRating.rating = rating;
      } else {
        doc.ratings.push({ user, rating });
      }
    }

    let totalRatings;
    let sumRatings;
    if(doc.ratings.length > 0){
      totalRatings = doc.ratings.length;
      sumRatings = doc.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      doc.averageRating = (sumRatings / totalRatings).toFixed(2);
    }

    if (reviewStr) {
      doc.reviews.unshift({ user, reviewStr });
    }

    const updatedDoc = await doc.save();

    const response = {};

    const userRating = updatedDoc.ratings.find((r) => r.user.equals(user));


    if (userRating) {
      response.rating = userRating.rating;;
    }

    if (reviewStr) {
      const userReview = updatedDoc.reviews.find((r) => r.user.equals(user));


      if (userReview) {
        response.review = userReview.reviewStr;
      }
    }

    response.averageRating = updatedDoc.averageRating || 0;
    response.totalRatings = totalRatings || 0;
    response.totalReviews = updatedDoc.reviews.length;


    return res
      .status(201)
      .send({ status: true, message: "successfull", data: response });
  } catch (error) {
    console.error("Error updating document:", error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" });
  }
};

const getNotes = async (req, res) => {
  try {
    const page = req.query.page || 1;
    console.log(req.query);
    let query = { isDeleted: false };
    const limit = 10;
 

    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    if (req.query.topicType) {
      query.topicType = req.query.topicType;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.topics) {
      query.topics = { $regex: req.query.topics.trim(), $options: "i" };
    }

    const notes = await noteModel
      .find(query)
      .select({ reviews: 0, ratings: 0, isDeleted: 0, __v: 0 ,updatedAt: 0 })
      .populate("userId", ["name", "photo",])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await noteModel.countDocuments(query);
    if (notes.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "notes not found" });
    } else {
      return res.status(200).json({
        notes,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getNoteByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 4;

    console.log(userId);

    const notes = await noteModel
      .find({ userId: userId, isDeleted: false })
      .select({ reviews: 0, ratings: 0, isDeleted: 0, __v: 0,updatedAt: 0 })
      .populate("userId", ["name", "photo"])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await noteModel.countDocuments({
      userId: userId,
      isDeleted: false,
    });

    const response = {
      notes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalNotes: count,
    };
    if (notes.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "notes not found" });
    } else {
      return res
        .status(200)
        .json({ Status: true, message: "successfull", response });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getNoteById = async (req, res) => {
  const noteId = req.params.noteId;

  try {
    let data = req.query.userId;

    let userId;
    
    if (validation.isValidObjectId(data)) {
      userId=data
    } else {
      userId =null
    }

    const note = await noteModel
      .findById(noteId)
      .populate("userId", ["name", "photo", "role"]);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const userRating = note.ratings.find(
      (rating) => rating.user._id.toString() === userId
    );
    const hasRated = userRating ? true : false;

    const userReview = note.reviews.find(
      (review) => review.user._id.toString() === userId
    );
    const hasReviewed = userReview ? true : false;

    return res.status(200).json({
      message: "Successfully Get",
      data: {
        _id: note._id,
        topics: note.topics,
        discriptions: note.discriptions,
        category: note.category,
        userId: note.userId,
        topicType: note.topicType,
        fileLink: note.fileLink,
        coverImage: note.coverImage,
        subject: note.subject,
        createdAt: note.createdAt,
        averageRating: note.averageRating,
        userRating: userRating?.rating,
        hasRated: hasRated,
        hasReviewed: hasReviewed,
        totalRatings: note.ratings.length,
        totalReviews: note.reviews.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getNoteReivewsById = async (req, res) => {
  const noteId = req.params.noteId;
  const pageNo = req.query.page || 1;
  const pageSize = req.query.pageSize || 2;
  try {
    let userId;
    if (req.decodedToken?.userId) {
      userId = req.decodedToken.userId;
    }
    const note = await noteModel
      .findById(noteId, {
        reviews: {
          $slice: [(pageNo - 1) * pageSize, pageSize],
        },
      })
      .select({
        _id: 0,
        topics: 0,
        discriptions: 0,
        userId: 0,
        topicType: 0,
        fileLink: 0,
        coverImage: 0,
        subject: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        averageRating: 0,
        ratings: 0,
      })
      .populate({
        path: "reviews",
        populate: { path: "user", select: ["name", "photo"] },
      });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    let noteData = await noteModel.findById(noteId);

    const totalPages = Math.ceil(noteData.reviews.length / pageSize);
    const hasNextPage = pageNo < totalPages;

    return res.status(200).json({
      message: "Successfully Get",
      data: { note: note, currentPage: pageNo, totalPages: totalPages },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createNotes,
  updateNote,
  reviewbyNote,
  getNotes,
  getNoteById,
  getNoteReivewsById,
  getNoteByUserId,
};
