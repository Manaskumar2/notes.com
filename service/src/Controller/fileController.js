const fs = require('fs');
const fileUpload = require("../Model/fileUploadsModel")
const userModel = require('../Model/userModel');
const { PDFDocument, StandardFonts} = require('pdf-lib')

let searchFile = async ({fileName, folderPath, type}) => {
    return new Promise(function (resolve, reject) {
        const resourceBasePath = process.env.RESOURCE_PATH
        
        const filePath = `${resourceBasePath}/${folderPath}/${fileName}`

        const mimeType = getMimeType(filePath.split('.').at(-1));
        
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                  return res.status(500).send({ error: 'Error reading file' });
                }
            
                const base64Data = Buffer.from(data).toString('base64');
                const dataUrl = `data:${mimeType};base64,${base64Data}`;

                return resolve({ dataUrl, buffer: data });
              });
          } else {
            return reject({ "fileFound": false });
          }
    });
};

const getFile = async (req, res) => {
  try {
    const { key, fileType } = req.params
    const userId = req.query.userId

    if (!key) return res.status(400).send({ status: false, message: "please input key" })

    const files = await fileUpload.findOne({ key: key })
    if (!files) return res.status(404).send({ status: false, message: "file not found" })

    const userDetails = await userModel.findOne({ _id: userId })

    let data = files.path.split('/');
    const fileName = data[data.length - 1]

    const getFile = await searchFile({ fileName, folderPath: `${data[0]}/${data[1]}`, type: fileType });

    let pdfDoc = null;
    if (files.fileType === 'pdf') {
      const pdfBytes = Buffer.from(getFile.dataUrl.split(',')[1], 'base64');
      let pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();

      if (!userDetails?.isVerified && files.requireAuth) {
        if (pageCount > 4) {
          const newPdfDoc = await PDFDocument.create();
          const pagesToCopy = await newPdfDoc.copyPages(pdfDoc, [0, 1, 2, 3]);
          pagesToCopy.forEach((page) => newPdfDoc.addPage(page));
          pdfDoc = newPdfDoc;
        }
      }

      if (!userDetails?.isVerified && files.requireAuth) {
        if (pageCount > 4) {
          const newPdfDoc = await PDFDocument.create();
          const pagesToCopy = await newPdfDoc.copyPages(pdfDoc, [0, 1, 2, 3]);
          pagesToCopy.forEach((page) => newPdfDoc.addPage(page));
          pdfDoc = newPdfDoc;
        }
        if (req.query.page && req.query.page > 4) {
          res.status(403).send({ message: "You are not authenticated to view this page." });
        } else {
          const dataUrl = `data:application/pdf;base64,${await pdfDoc.saveAsBase64()}`;
          res.status(200).send(dataUrl);
        }
      } else {
        const dataUrl = `data:application/pdf;base64,${await pdfDoc.saveAsBase64()}`;
        res.status(200).send(dataUrl);
      }
    } else {
      const dataUrl = getFile.dataUrl;
      res.status(200).send(dataUrl);
    }
  } catch (err) {
    if(!err.fileFound){
        res.status(404).send({message: "No file Found!"})
    }
    res.status(500).send(err.message)
  }
}


function getMimeType(fileExtension) {
    switch (fileExtension.toLowerCase()) {
      case 'txt':
        return 'text/plain';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
      case 'docx':
        return 'application/msword';
      case 'xls':
      case 'xlsx':
        return 'application/vnd.ms-excel';
      case 'ppt':
      case 'pptx':
        return 'application/vnd.ms-powerpoint';
      case 'csv':
        return 'text/csv';
      case 'zip':
        return 'application/zip';
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }

module.exports ={getFile}