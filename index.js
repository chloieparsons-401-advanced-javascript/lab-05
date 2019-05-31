'use strict';

const fs = require('fs');

const fileTypeOffset = 0;
const fileSizeOffset = 2;
const pixelOffset = 10;
const widthOffset = 18;
const heightOffset = 22;
const bytesPerPixelOffset = 28;
const colorTableOffset = 54;

/**
 * Bitmap -- receives a file name, used in the transformer to note the new buffer
 * @param filePath
 * @constructor
 */
function Bitmap(filePath) {
  this.file = filePath;
}

/**
 * Parser -- accepts a buffer and will parse through it, according to the specification, creating object properties for each segment of the file
 * @param buffer
 */
Bitmap.prototype.parse = function(buffer) {
  this.buffer = buffer;
  this.type = buffer.toString('utf-8', fileTypeOffset, 2);
  this.fileSize = buffer.readInt32LE(fileSizeOffset);
  this.pixelsOff = buffer.readInt32LE(pixelOffset);
  this.width = buffer.readInt32LE(widthOffset);
  this.height = buffer.readInt32LE(heightOffset);
  this.bytesPerPixelOff = buffer.readInt32LE(bytesPerPixelOffset);
  this.colorArray = buffer.slice(colorTableOffset, this.pixelsOff);
};

/**
 * Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
 * @param operation
 */
Bitmap.prototype.transform = function(operation) {
  // This is really assumptive and unsafe
  transforms[operation](this);
  this.newFile = this.file.replace(/\.bmp/, `.${operation}.bmp`);
};

/**
 * Sample Transformer (greyscale)
 * Would be called by Bitmap.transform('greyscale')
 * Pro Tip: Use "pass by reference" to alter the bitmap's buffer in place so you don't have to pass it around ...
 * @param bmp
 */
const transformGreyscale = (bmp) => {

  console.log('Transforming bitmap into greyscale', bmp);

  if (!this.colorArray.length){
    throw 'Invalid .bmp format';

  } else {

    for(let i = 0; i < bmp.colorArray.length; i += 4){
      let grey = (bmp.colorArray[i] + bmp.colorArray[i+1] + bmp.colorArray[i+2]) / 3;
      bmp.colorArray[i] = grey;
      bmp.colorArray[i+1] = grey;
      bmp.colorArray[i+2] = grey;
    }
  }
};

const doTheInversion = (bmp) => {

  console.log('Transforming bitmap to multiply color', bmp);

  if (!this.colorArray.length){
    throw 'Invalid .bmp format';

  } else {
    for(let i = 0; i < bmp.colorArray.length; i += 4){
      bmp.colorArray[i] *= color.colorArray[i];
      bmp.colorArray[i+1] *= color.colorArray[i+1];
      bmp.colorArray[i+2] *= color.colorArray[i+2];
    }
  }
};


/**
 * A dictionary of transformations
 * Each property represents a transformation that someone could enter on the command line and then a function that would be called on the bitmap to do this job
 */
const transforms = {
  greyscale: transformGreyscale,
  invert: doTheInversion,
};

// ------------------ GET TO WORK ------------------- //

function transformWithCallbacks() {

  fs.readFile(file, (err, buffer) => {

    if (err) {
      throw err;
    }

    bitmap.parse(buffer);

    bitmap.transform(operation);

    // Note that this has to be nested!
    // Also, it uses the bitmap's instance properties for the name and thew new buffer
    fs.writeFile(bitmap.newFile, bitmap.buffer, (err, out) => {
      if (err) {
        throw err;
      }
      console.log(`Bitmap Transformed: ${bitmap.newFile}`);
    });

  });
}

// TODO: Explain how this works (in your README)
const [file, operation] = process.argv.slice(2);

  let bitmap = new Bitmap(file);

  transformWithCallbacks();

// const greyscale = require('./assets/baldy.greyscale');

//   greyscale(this);

// fs.writeFile('baldy.greyscale.bmp', this.buffer, (err) => {
//   if(err) throw err;
//   console.log('success!');
// }); 

