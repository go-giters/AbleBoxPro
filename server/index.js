var port = process.env.PORT || 3000;
var express = require('express');
var bodyParser = require('body-parser');
var db = require('./models/index.js');
var path = require('path');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var app = express();
var AWS = require('aws-sdk');
var accessKeyId = process.env.ACCESS_KEY_ID || require('./config.js').keys.accessKeyId;
var secretAccessKey = process.env.SECRET_ACCESS_KEY || require('./config.js').keys.secretAccessKey;
var fs = require('fs');
const { Writable } = require('stream');
var FileSaver = require('file-saver');
const os = require('os');

var request = require('request');

var multer = require('multer');
var multerS3 = require('multer-s3');
const ABLEBOX_BUCKET = require('./config.js').bucketName;
const S3_API_VER = '2006-03-01';

var app = express();

var s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  Bucket: ABLEBOX_BUCKET,
  apiVersion: S3_API_VER
});

var deleteObject = function(objectKey) {
  var params = {
    Bucket: ABLEBOX_BUCKET,
    Key: objectKey
  };
  s3.deleteObject(params, function(err, data) {
    if (err) {
      res.status = 400;
      res.write('ERROR DELETING OBJECT');
      res.end();
    }
    else {
      res.status = 200;
      res.write('OK');
      res.end();
    }
  });
};

var getObject = function(objectKey, cb) {
  var params = {
    Bucket: ABLEBOX_BUCKET,
    Key: objectKey
  };
  s3.getObject(params, function(err, data) {
    if (err) {
      cb(err, null)
    } else {
      cb(null, data);
    }
    //data example:
    /*
    data = {
     AcceptRanges: "bytes",
     ContentLength: 3191,
     ContentType: "image/jpeg",
     ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"",
     LastModified: <Date Representation>,
     Metadata: {
     },
     TagCount: 2,
     VersionId: "null"
    }
    */
  });
}

var upload = multer({
  preservePath: true,
  storage: multerS3({
    s3: s3,
    bucket: ABLEBOX_BUCKET,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, `${req.session.user}/${file.originalname}`);
    }
  })
});

const createFolder = function(req, res, next) {
  //TODO: need to check for duplicates first before going to aws
  let params = {
    ACL: "private",
    Bucket: ABLEBOX_BUCKET,
    Key: `${req.session.user}/${req.body.folderName}/`,
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      res.status = 400;
      res.write("ERROR CREATING OBJECT");
      res.end();
    } else {
      next();
    }
    /*
    data = {
    ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"",
    VersionId: "Kirh.unyZwjQ69YxcQLA8z4F5j3kJJKr"
    }
    */
  });
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/icons', express.static(__dirname + '/../client/src/assets/svg'));
app.use(express.static(__dirname + '/../client/dist'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));

var checkUser = (req, res, next) => {
  if(req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/home', checkUser, (req, res) => {
  req.session.folderId = 0;
  res.sendFile(path.resolve(__dirname + '/../client/dist/index.html'));
});

app.post('/launchWriter', (req, res) => {
  db.getHash(req.body.id, function (err, result) {
    if (err) {
      res.status = 404;
      //must refresh or this error will be thrown
      res.write(err);
      res.end();
    } else {
      var hash = result[0].hash
      console.log('hash: ', hash)
      var url = `https://ipfs.io/ipfs/${hash}`
      console.log('url: ', url)
      const zoho = require('./config.js').editor.apikey;
      request(`https://writer.zoho.com/writer/remotedoc.im?url=${url}&mode=collabedit&apikey=${zoho}`, { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        var arr = body.split('=');
        var body = arr[1] + '=' + arr[2].slice(0, -7);
        res.status(200).json(body)
      });
    };
  });
});

app.post('/launchSheet', (req, res) => {
  db.getHash(req.body.id, function (err, result) {
    if (err) {
      res.status = 404;
      //must refresh or this error will be thrown
      res.write(err);
      res.end();
    } else {
      var hash = result[0].hash
      console.log('hash: ', hash)
      var url = `https://ipfs.io/ipfs/${hash}`
      console.log('url: ', url)
      const zoho = require('./config.js').editor.apikey;
      request(`https://sheet.zoho.com/sheet/remotedoc.im?url=${url}&mode=collabedit&apikey=${zoho}`, { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        console.log('Inside launchSheet body: ', body)
        var arr = body.split('=');
        console.log('arr: ', arr)
        var body = arr[2] + '=' + arr[3].slice(0, -11);
        console.log('body: ', body)
        res.status(200).json(body)
      });
    };
  });
});

// app.post('/launchShow', (req, res) => {
//   db.getHash(req.body.id, function (err, result) {
//     if (err) {
//       res.status = 404;
//       //must refresh or this error will be thrown
//       res.write(err);
//       res.end();
//     } else {
//       var hash = result[0].hash
//       console.log('hash: ', hash)
//       var url = `https://ipfs.io/ipfs/${hash}`
//       request(url, { json: true }, (err, response, body) => {
//         console.log('response body to ipfs hash: ', body.length)
//       })
//       // var url = 'http://www.cambridge.org/download_file/view/833678/109493/'
//       console.log('url: ', url)
//       const zoho = require('./config.js').editor.apikey;
//       request(`https://show.zoho.com/show/remotedoc.im?url=${url}&mode=collabedit&apikey=${zoho}`, { json: true }, (err, response, body) => {
//         if (err) { return console.log(err); }
//         console.log('Inside launchSheet body: ', body)
//         var arr = body.split('=');
//         console.log('arr: ', arr)
//         var body = arr[2] + '=' + arr[3].slice(0, -11);
//         console.log('body: ', body)
//         res.status(200).json(body)
//       });
//     };
//   });
// });


app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  db.fetchUser(email, (err, result) => {
    if (err) {
      res.redirect(500, '/login');
    } else if (!result.length) {
      res.redirect(401, '/login');
    } else {
      bcrypt.compare(password, result[0].password, (err, match) => {
        if (!match) {
          res.status(401).end();
        } else {
          req.session.regenerate(() => {
            req.session.folderId = 0;
            req.session.user = result[0].id;
            res.status(200).end();
          });
        }
      })
    }
  });
});

app.post('/signup', (req, res) => {
  let userData = req.body;
  bcrypt.hash(userData.password, null, null, (err, hash) => {
    if (err) {
      res.redirect(500, '/signup');
    }
    userData.password = hash;
  });
  db.checkUserExists(userData.email, (err, result) => {
    if (err) {
      res.redirect(500, '/signup');
    }
    if (result.length) {
      res.status(500).send('username already exists!');
    } else {
      db.createUser(userData, (err, result) => {
        if(err) {
          res.redirect(500, '/signup');
        } else {
          req.session.regenerate(() => {
            req.session.user = result.insertId;
            res.redirect('/home');
          });
        }
      });
    }
  });
});

app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        next(err);
      } else {
        res.clearCookie('connect.sid');
        res.redirect('/login');
      }
    });
  }
});

app.post('/upload', checkUser, upload.single('file'), function(req, res, next) {
  //TODO: validate user email/userid against the sessionid
  db.createFile(req, function(err, result) {
    if (err) {
      res.status = 404;
      res.write('UNABLE TO UPLOAD FILE');
      res.end();
    } else {
      res.status = 200;
      res.write('Successfully uploaded ' + req.file.length + ' files!');
      res.end();
    }
  });
});

app.get('/folder/:folderId', (req, res) => {
  req.session.folderId = req.params.folderId;

  db.verifyFileExistenceAndPermissions(req.params.folderId, req.session.user, function(err, result) {
    if (err || !result.length) {
      res.redirect('/login');
    } else {
      res.sendFile(path.resolve(__dirname + '/../client/dist/index.html'));
    }
  });
});

app.get('/getfiles', function(req, res) {

  let folderId = req.session.folderId;
  let userId = req.session.user;
  db.getFiles(folderId, userId, function(err, result) {
    if (err) {
      res.status = 404;
      res.write(JSON.stringify(err));
      res.end();
    } else {
      res.status = 200;
      db.searchPath(userId, folderId, function(err2, path) {
        let data = {
          'result': result,
          'path': path
        };
        res.write(JSON.stringify(data));
        res.end();
      });
    }
  });
});

app.get('/getfolders', function(req, res) {
  let folderId = req.session.folderId;
  let userId = req.session.user;
  db.getAllFolders(function(err, result) {
    if (err) {
      res.status = 404;
      res.write(JSON.stringify(err));
      res.end();
    } else {
      console.log('result in getfolders: ', result)
      res.status = 200;
        let data = {
          'result': result
        }
        res.write(JSON.stringify(data));
        res.end();
      };
    });
});

app.get('/path', (req, res) => {
  db.searchPath(req.session.user, req.query.fileId, (err, path) => {
    // console.log('userid', req.session.user);
    // console.log('body', req.query);
    res.end(JSON.stringify(path));
  })
})

app.post('/searchfiles', checkUser, function(req, res) {
  let keyword = req.body.keyword;
  let userId = req.session.user;
  db.searchFiles(userId, keyword, function(err, result) {
    if (err) {
      res.status = 404;
      res.write(err);
      res.end();
    } else {
      res.status = 200;
      res.write(JSON.stringify(result));
      res.end();
    }
  });
});

app.post('/delete', checkUser, function(req, res) {
  let fileId = req.body.id;
  let userId = req.session.user;
  let folderId = req.session.folderId;
  let is_folder = req.body.is_folder;

  db.deleteFiles(userId, fileId, is_folder, function(err, result) {
    if (err) {
      res.status = 404;
      res.write(err);
      res.end();
    } else {
      db.getFiles(folderId, userId, function(err2, result2) {
        if (err) {
          res.status = 404;
          res.write(err);
          res.end();
        } else {
          res.status = 200;
          res.write(JSON.stringify(result2));
          res.end();
        }
      });
    }
  });
});

app.put('/updateName', function(req, res) {
  let name = req.body.name;
  let id = req.body.id;
  db.updateName(name, id, (err, result) => {
    if (err) {
      res.status = 404;
      res.write(err);
      res.end();
    } else {
      res.status = 200;
      res.write(JSON.stringify(result));
      res.end();
    }
  });
});

app.post('/createFolder', createFolder, function(req, res) {
  db.createFolder(req, function(err, result) {
    console.log('inside db.createFolder!!!')
    if (err) {
      res.status = 404;
      res.write('UNABLE TO CREATE FOLDER');
      res.end();
    } else {
      console.log('this is the result from db.createFolder: ', result)
      res.status = 200;
      res.write(JSON.stringify({folder_id: result.insertId}));
      res.end();
    }
  });
});

app.post('/moveFile', createFolder, function(req, res) {
  db.moveFile(req.body.folder, req.body.id, function(err, result) {
    if (err) {
      res.status = 404;
      res.write('UNABLE TO CREATE FOLDER');
      res.end();
    } else {
      console.log('this is the result from db.moveFile: ', result)
      res.status = 200;
      res.write(JSON.stringify({folder_id: result.insertId}));
      res.end();
    }
  });
});

app.get('/download', function(req, res, next) {
  // download the file via aws s3 here
  db.getKey(req.query.id, function (err, result) {
    var filename;
    if (err) {
      res.status = 404;
      res.write(err);
      res.end();
    } else {
      var fileKey = result[0].s3_objectId;
      filename = result[0].name;
      var options = {
        Bucket: ABLEBOX_BUCKET,
        Key: fileKey,
      };

      s3.headObject(options, (err, data) => {
        if (err) {
          // an error occurred
          console.error(err);
          return next();
        }
        console.log('first data: ', data)
        var file = fs.createWriteStream(os.homedir() + '/Downloads/' + filename);
        var stream = s3.getObject(options).createReadStream();

        res.setHeader('Content-Type', data.ContentType);
        res.setHeader('Content-Disposition', 'attachment;', 'filename=' + filename);
        res.setHeader('Content-Length', data.ContentLength);

        stream.on('data', (data) => {
          file.write(data);
        }).on('end', function () {
          file.end();
          file.close();
          res.send(file.path);
        });
      });
    };
  });
});

// endpoint to handle sharing of files/folders. Share data inserted into
// different tables depending on whether shared-to user is registered.
app.post('/share', (req, res) => {
  let cb = (err, result) => {
    if (err) {
      res.redirect(500, '/home');
    } else {
      res.status(201).end();
    }
  };

  db.checkUserExists(req.body.email, (err, result) => {
    if (err) {
      res.status(500).end();
    } else if (result.length) {
      db.shareFileExistingUser(req.body.file, result[0].id, cb);
    } else {
      db.shareFilePendingUser(req.body.file, req.body.email, cb);
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../client/dist/index.html'));
});

app.listen(port, () => {
  console.log('listening on port ' + port);
});
