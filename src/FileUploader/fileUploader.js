const fs = require('fs');
const { v4: uuidV4 } = require("uuid");
const { PDFDocument, StandardFonts,degrees, rgb } = require('pdf-lib');

let uploadFile = async (file) => {
  try {
    const resourceBasePath = process.env.RESOURCE_PATH;
    let uniqueId = uuidV4();
    let fileMimeType = file.mimetype.split('/');
    let fileFormat = fileMimeType[fileMimeType.length - 1];
    let folderPath = '';
    if (fileFormat === 'pdf') {
      folderPath = 'resources/pdf';
    } else if (fileMimeType[0].startsWith('image')) {
      folderPath = 'resources/img';
    } else if (fileFormat === 'docx') {
      folderPath = 'resources/docs';
    } else {
      return { "error": "Unsupported file type" };
    }
    let filePath = `${resourceBasePath}/${folderPath}/${uniqueId}.${fileFormat}`;

    await fs.promises.mkdir(resourceBasePath + '/' + folderPath, { recursive: true });

    if (fileFormat === 'pdf') {
      let pdfDoc = await PDFDocument.load(file.buffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const { width, height } = pages[i].getSize();
        const watermarkText = process.env.WATERMARK;

        pages[i].drawText(watermarkText, {
          x: width / 2 - helveticaFont.widthOfTextAtSize(watermarkText, 50) / 2,
          y: height / 2,
          size: 50,
          font: helveticaFont,
          color: rgb(128 / 255, 128 / 255, 128 / 255),

          opacity: 0.5,
          rotate: degrees(-45),
        });
      }

      file.buffer = await pdfDoc.save();
    }

    await fs.promises.writeFile(filePath, file.buffer);
    console.log("file uploaded successfully");
    return { path: `${folderPath}/${uniqueId}.${fileFormat}`, fileType: fileFormat, key: uniqueId };
  } catch (err) {
    return { "error": err };
  }
};

module.exports = { uploadFile };
