'use strict';

var Parser = require('../')
  , fs = require('fs');

var markdown = fs.readFileSync(__dirname + '/fixture.md', 'utf-8')
  , parsed = new Parser(markdown);

console.log('original:');
console.log(markdown +'\n');

console.log('output:');
console.log(parsed.toString());
