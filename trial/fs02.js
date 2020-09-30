#!/usr/bin/node
var huff = require('./huffman');
var fs = require('fs');
//var hff = new huff();
var data = fs.readFileSync(process.argv[2]);
//console.log(data);
//console.log(huff);
huff(data);
//console.log(Number.MAX_VALUE);

//huff.a();
