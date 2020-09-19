#!/usr/bin/node
var a = function(){
  function huf(){
    console.log("我出来啦");
  }
  huf();
}
function hfm(){
  console.log("调用成功");
  const SNUM_MAX = 256,//信源符号的个数不超过256个
        NNUM_MAX = 511;//树节点最多为511个

  var srcData = null,     //源文件无符号字节数组
      n       = 0,
      scaled  = false,
      freq    = new Array(SNUM_MAX),
      p       = new Array(SNUM_MAX),
      miniFrq = new Array(SNUM_MAX),
      miniP   = new Array(SNUM_MAX),
      miniTFq = 0,
      hfmTree = new Array(NNUM_MAX),
      HEAD    = NNUM_MAX-1,
      EOT     = -1,
      hfmCode = new Array(SNUM_MAX);

  function initData(data){}
  function statFreq(data){}
  function infoSrcAnaLyze(data){}
  function scaledFreq(){}
  function scaledInfoSrcAnalyze(){}
  function compress(data){
    console.log("又调用成功了");
  }
  compress();
  
}
//module.exports = hfm;
exports.a = a;
