const mongoose = require("mongoose")

const isValid = (value) => {
    if (typeof value === "undefined" || typeof value === "null") return false;
    if (typeof value === "string" && value.trim().length == 0) return false;
    return true;
}
const isValidBody = (reqBody) => {
    if (Object.keys(reqBody).length == 0) {
        return true
    }
}
const isValidreqBody=(request)=>{
    return Object.keys(request).length>0
}
const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId);
}
const isValidName = (name) => {
    return /^[a-zA-Z\. ]*$/.test(name)
}
const isValidPhone = (Mobile) => {
    return /^[6-9]\d{9}$/.test(Mobile)
}
const isValidEmail = (Email) => {
    return /^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/.test(Email)
}
const isValidPwd = (Password) => {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(Password)
};

const isValidSubject = (subject) => {
    return ([
         "Math",
        "Science",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
        "Programming",
        "Accountancy",
        "Economics",
        "Current Affair",
        "Reasoning",
        "Quantitative Aptitude",
        "Business Studies",
        "Sociology",
        "Political Science",
        "Current Affairs",
        "Environmental Science",
        "English",
        "Law",
        "Engineering",
        "Medical",
        "Geography",
        "Computer Science",
        "History",
        "Geology",
        "Hindi",
        "General Knowledge",
        "Odia",
        "Science",
        "Social studies",
        "US History",
        "C",
        "C++",
        "JAVA",
        "JAVASCRIPT",
        "PYTHON",
        "Data Structure",
        "Tourism",
        "Mass Communication",
        "Introduction Law",
        "Urban Studies",
        "Business studies",
        "Engineering",
        "Foreign languages",
        "CBSE Board",
        "CBSE Intermediate",
        "SSC Board",
        "ICSE Board",
        "Regional Languages",
        "Arts",
        "Commerce",
        "Charted Accountant",
        "Management",
        "Technical Diploma",
        "Professional Diploma",
        "Defence",
        "UPSC",
        "GOVT Exam",
        "Cultural Studies",
        "JEE",
        "NEET",
        "CAT",
        "CUET",
        "BFD",
    ].includes(subject))
}

const isValidImage = (fileName) => {
    return (/\.(gif|jpe?g|tiff?|png|webp|bmp|pdf)$/i).test(fileName)
}
const isValidGender = (gender) => {
    return ["MALE", "FEMALE", "OTHERS"].indexOf(gender) !== -1
}
const PinCode = (pincode) => {
    let regx = /^[1-9][0-9]{5}$/
    return regx.test(pincode)
}
const isUrlValid = (urlLink) => {
    let regx = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    return regx.test(urlLink)
}
let regexSpaceChar = function (attribute) {
    return (/^[A-Za-z\s]{1,}[\,]{0,1}[A-Za-z\s]{0,}$/.test(attribute))
}





module.exports = { isValid, isValidBody, isValidPhone, isValidEmail, isValidPwd, isValidObjectId, isValidName, isValidSubject, isValidImage, isValidGender, PinCode, isUrlValid,regexSpaceChar ,isValidreqBody}
