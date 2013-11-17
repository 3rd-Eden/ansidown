#! /usr/bin/env node

'use strict';

var ansidown = require('./');
var fs = require('fs');

if (!process.argv[2])
  return console.error('Usage: ansidown FILE');

fs.readFile(process.argv[2], function(err, data) {
  if (err)
    return console.error('Problems reading file: ' + process.arv[2])

  console.log(ansidown(data.toString()).toString());
});
