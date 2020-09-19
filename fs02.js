#!/usr/bin/node
var huff = require('./huffman');
var fs = require('fs');
//var hff = new huff();
var data = fs.readFileSync(process.argv[2],'utf-8');
console.log(data);
console.log(huff);
//huff();

huff.a();
