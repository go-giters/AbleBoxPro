# AbleBox

> [AbleBox is a SaaS that enables users to upload their files to the cloud, offering individuals and teams the ability to create and collaborate efficiently.](https://glacial-island-66806.herokuapp.com/)

## Team

  - __Product Owner__: Sarkhan Koshkarli
  - __Scrum Master__: Joseph Gomez
  - __Development Team Members__: Yang Chen, Debalina Mukherjee, Hubert Nimitanakit, Ted Green, Adelle Housker, Seth Shill, Happy Situ

## Table of Contents

## Usage
1. Run schema.sql file from your terminal and make sure you do not have any password for root account:
    mysql -u root -p < PATH TO SCHEMA.SQL
2. Add a config.js file to the server folder
3. Open a S3 account and copy paste the key to config.js in following format
    const keys = {
      accessKeyId: YOUR ACCESS KEY,
      secretAccessKey: YOUR SECRET ACCESS KEY,
      region: REGION
    };
    exports.keys = keys;
4. Direct to this folder from Git bash and run [npm install]
5. Run npm run react-dev from your Git Bash from this directory
6. Open another Git Bash terminal and execute: npm run server-dev from this directory
7. Go to the browser and copy paste: http://127.0.0.1:3000/
8. To utilize blockchain encrypted storage of files (ipfs): "npm run ipfs-dev"

## Road Map

Recommended features to add:
1. Delete nested folder
2. Edit folder name
3. Edit file
4. Version control (with block chain or s3)
5. Collaboration
6. Organization access
7. Moving file or folders
8. Display the path for each file in searching mode


> Some usage instructions

## Requirements

- Node 9.x
- MySQL 5.7

## Development

### Installing Dependencies

From within the root directory:

```
npm install
```

### Roadmap

View the project roadmap [here](https://trello.com/b/LqvHxc9R/able-buffalos)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
```

### Roadmap

View the project roadmap [here](https://trello.com/b/LqvHxc9R/able-buffalos)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
