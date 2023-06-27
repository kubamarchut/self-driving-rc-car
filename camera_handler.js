const cv = require('opencv4nodejs');
const FPS = 30
const vCap = new cv.VideoCapture(0);

function takePhoto(filename, directory) {
  const frame = vCap.read();
  image = cv.imencode('.jpeg', frame);
  
  cv.imwrite(`${directory}/${filename}.jpg`, frame);
}

function getImgToStream(){
    const frame = vCap.read();
    let image = frame.getRegion(new cv.Rect(0, 0, 640, 430)).resize(215, 320);
    image = cv.imencode('.jpeg', image, [parseInt(cv.IMWRITE_JPEG_QUALITY), 20]);

    return image;
}

exports.FPS = FPS;
exports.takePhoto = takePhoto;
exports.getImgToStream = getImgToStream;