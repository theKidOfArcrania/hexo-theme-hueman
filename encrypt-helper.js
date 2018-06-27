// Stand-alone file that encrypts an input file 
// Invoke using: node encrypt.js <in> <out>

const yfm = require('hexo-front-matter');
const logger = new require('hexo-log')({name: 'encrypt-helper'});

if (process.argv.length != 4) {
  logger.info('Usage: node encrypt.js <in> <out>');
  logger.fatal('Invalid number of arguments!');
  process.exit(1);
}


