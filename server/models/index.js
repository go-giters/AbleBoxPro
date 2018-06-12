const db = require('../db/index.js');

const createUser = (user, cb) => {
  const userDetails = {
    password:  user.password,
    email: user.email,
    first_name: user.firstname,
    last_name: user.lastname
  };

  const query = 'INSERT INTO users SET ?';

  db.connection.query(query, userDetails, function(err, result, fields) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const checkUserExists = (email, cb) => {
  const query = 'SELECT email, id FROM users WHERE email = ?';

  db.connection.query(query, email, function(err, result, fields) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const fetchUser = (email, cb) => {
  const query = 'SELECT * FROM users WHERE email = ?';

  db.connection.query(query, email, (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const createFile = (req, cb) => {
  console.log('req.body inside db.createFile: ', req.body)
  const fileDetails = {
    name: req.file.originalname,
    folder_id: req.session.folderId,
    file_ext: req.file.contentType,
    user_id: req.session.user,
    s3_objectId: req.file.key,
    hash: req.body.body
  };

  const query = 'INSERT INTO files SET ?';

  db.connection.query(query, fileDetails, function(err, result, fields) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const createFolder = (req, cb) => {
  const folderDetails = {
    name: req.body.folderName,
    folder_id: req.session.folderId ? req.session.folderId : 0,
    user_id: req.session.user,
    s3_objectId: `${req.session.user}/${req.body.folderName}/`,
    is_folder: 1
  };

  const query = 'INSERT INTO files SET ?';

  db.connection.query(query, folderDetails, function(err, result, fields) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const deleteFiles = (userId, fileId, is_folder, cb) => {
  let query = 'DELETE FROM files WHERE user_id = ? AND id = ?';
    // need to refactor later to add recursive deletion.
  db.connection.query(query, [userId, fileId], (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const getFiles = (folderId, userId, cb) => {
  const query = 'SELECT id, name, s3_objectId, is_public, created_on as lastModified, is_folder FROM files WHERE folder_id = ? AND user_id = ? ORDER BY is_folder DESC, name';

  db.connection.query(query, [folderId, userId], (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const updateName = (name, id, cb) => {
  const query = 'UPDATE files SET name = ? WHERE id = ?';
  db.connection.query(query, [name, id], (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const verifyFileExistenceAndPermissions = (folderId, userId, cb) => {
  const query = 'SELECT id FROM files WHERE id = ? AND id <> 0 AND (user_id = ? OR is_public = 1)';

  db.connection.query(query, [folderId, userId], (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const getKey = (id, cb) => {
  const query = 'SELECT name, s3_objectId FROM files WHERE id=?';

  db.connection.query(query, id, (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const getHash = (id, cb) => {
  const query = 'SELECT hash, s3_objectId FROM files WHERE id=?';

  db.connection.query(query, id, (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const searchFiles = (userId, keyword, cb) => {
  keyword = '%' + keyword + '%';
  const query = 'SELECT id, name, s3_objectId, is_public, created_on as lastModified, is_folder FROM files WHERE user_id = ? AND name LIKE ? ORDER BY is_folder DESC, name';

  db.connection.query(query, [userId, keyword], (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const searchPath = (userId, folderId, cb) => {
  const query = '(SELECT SF.folder_id, F.name FROM (SELECT folder_id FROM files WHERE user_id = ? AND id IN (SELECT folder_id FROM files WHERE user_id = ? AND id IN (SELECT folder_id FROM files WHERE user_id = ?  AND id = ? )) UNION (SELECT folder_id FROM files WHERE user_id = ? AND id IN (SELECT folder_id FROM files WHERE user_id = ?  AND id = ? )) UNION (SELECT folder_id FROM files WHERE user_id = ? AND id = ?)) AS SF LEFT JOIN files As F ON SF.folder_id = F.id)  UNION (SELECT id, name FROM files WHERE user_id = ? AND id = ? )';
  const data = [userId, userId, userId, folderId, userId, userId, folderId, userId, folderId, userId, folderId];

  db.connection.query(query, data, (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

// data in this table is moved to collab once new user registers
const shareFilePendingUser = (file, email, cb) => {
  const query = 'INSERT INTO pending_user_share SET ?';
  const values = {
    file_id: file.id,
    email: email
  };

  db.connection.query(query, values, (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

const shareFileExistingUser = (file, userId, cb) => {
  const query = 'INSERT INTO collab SET ?';
  const values = {
    file_id: file.id,
    folder_id: file.folder_id,
    user_id: userId
  };

  db.connection.query(query, values, (err, result, fields) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

exports.checkUserExists = checkUserExists;
exports.createFile = createFile;
exports.createFolder = createFolder;
exports.createUser = createUser;
exports.deleteFiles = deleteFiles;
exports.fetchUser = fetchUser;
exports.getFiles = getFiles;
exports.searchFiles = searchFiles;
exports.createFolder = createFolder;
exports.getKey = getKey;
exports.searchPath = searchPath;
exports.shareFilePendingUser = shareFilePendingUser;
exports.shareFileExistingUser = shareFileExistingUser;
exports.verifyFileExistenceAndPermissions = verifyFileExistenceAndPermissions;
exports.getHash = getHash;
exports.updateName = updateName;
