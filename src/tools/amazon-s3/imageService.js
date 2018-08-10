const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const bucket = 'algopay-user-assets';
const testUri = 'data:image/jpeg;base64,';

function initS3Bucket() {
  saveFileFromDataUri(testUri, 'test', function() {
    var fileTest = getFile({Key: 'test'}, function(file) {
      console.log('S3 is working');
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });
}

function putFile(params, cb, errCb) {
  //you must pass in a key
  params.Bucket = bucket;

  s3.putObject(params, function(err, data) {
      if (err) {
          errCb(err);
      } else {
          cb(data)
      }
   });
}

function getFile(params, cb, errCb) {
  params.Bucket = bucket;

  s3.getObject(params, function(err, data) {
    if (err) {
      errCb(err);
    } else {
      cb(data);
    }
  });
}

function getProfilePicture(id, cb, errCb) {
  var params = {
    Key: id
  };

  getFile(params, cb, errCb);
}

function saveFileFromDataUri(dataUri, fileKey, cb, errCb) {
  var params = {
    Key: fileKey,
    Body: dataUri
  };

  putFile(params, cb, errCb);
}

module.exports = {initS3Bucket: initS3Bucket, saveFileFromDataUri: saveFileFromDataUri, getProfilePicture: getProfilePicture};
