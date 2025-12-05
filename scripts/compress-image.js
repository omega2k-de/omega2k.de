const fs = require('fs');
const sharp = require('sharp');

const minifyFile = filename => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, function (err, sourceData) {
      if (err) throw err;
      sharp(sourceData).toFile(filename, (err, _info) => {
        return err ? reject(err) : resolve();
      });
    });
  });
};

Promise.resolve(process.argv)
  .then(x => x.slice(2))
  .then(x => x.map(minifyFile))
  .then(x => Promise.all(x))
  .catch(_ => {
    process.exit(1);
  });
