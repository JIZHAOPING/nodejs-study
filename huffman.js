#!/usr/bin/node
/*
var a = function(){
  function huf(){
    console.log("我出来啦");
  }
  huf();
}
*/
var roundFractional= require('./lib.js');
function hfm(data){
  console.log("调用成功");
  const SNUM_MAX = 256,//信源符号的个数不超过256个
        NNUM_MAX = 512;//树节点最多为511个

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

      hfmTree[HEAD]={1:0,r:0,p:0,w:0};    

  function initData(data){
    //console.log(data);
    console.log("爷爷在此~");
    for(var i = 0;i<SNUM_MAX;i++){
      //console.log(miniTFq);测试是否可以调用外部变量
      p[i]=0;
      freq[i]=0;
      miniP[i]=0;
      miniFrq[i]=0;
      hfmTree[i]={1:0,r:0,p:0,w:0};
      hfmCode[i]='';
    }
    console.log(hfmTree[511]);
    return{
      p:p,
      freq:freq,
      miniP:miniP,
      miniFrq:miniFrq,
      hfmTree:hfmTree,
      hfmCode:hfmCode
    }
  }
  function statFreq(data){
    //console.log(data);
    console.log("于书睿，我叫你一声你敢答应吗！？");
    srcData=data;
    for(var i=0;i<srcData.length;i++){
      freq[srcData[i]]++;
      //console.log(freq[srcData[i]]);
    }
    return {
      freq:freq
    }
  }
  function infoSrcAnaLyze(data){
    //console.log(data);
    console.log("不敢");
    srcData=data;
    var total=srcData.length;
    console.log(total);

    for(var i=0;i<SNUM_MAX;i++){
      if(freq[i]==0) continue;
      p[i]=roundFractional(freq[i]/total,6);
      ++n;
    }
    return {
      p:p,
      n:n
    }

  }
  function scaledFreq(){
    var i,f=0,max=0,scale=0;
    for(i=0;i<SNUM_MAX;i++){
      if(freq[i]>max) max=freq[i];
    }
    if(max<SNUM_MAX) return(false);
    scale=(max/SNUM_MAX)+1;
    //console.log(scale);
    for(i=0;i<SNUM_MAX;i++){
      if(freq[i]!==0){
        f=roundFractional(freq[i]/scale,0);
        miniFrq[i]=(f==0)?1:f;
      }
    }
    return {
      scale:true,
      miniFrq:miniFrq
    }
  }
  function scaledInfoSrcAnalyze(){
    var total=0;
    for(var i=0;i<SNUM_MAX;i++){
      total+=miniFrq[i];
    }
    console.log(total);
    for(i=0;i<SNUM_MAX;i++){
      miniP[i]=roundFractional(miniFrq[i]/total,6);
    }
    miniTFq=total;
    return {
      miniP:miniP,
      miniTFq:miniTFq
    }
  }
  function initHfmTree(){
    for(var i=0;i<SNUM_MAX;i++) hfmTree[i].w=freq[i];
    hfmTree[HEAD].b=EOT;
    hfmTree[HEAD].w=SNUM_MAX;
    return{
      hfmTree:hfmTree
    }
  }
  function compress(data){
    //console.log(data);
    console.log("纪朝霞，我叫你一声你敢答应吗？！");
    initData(data);
    statFreq(data);
    infoSrcAnaLyze(data);
    if(scaledFreq()) scaledInfoSrcAnalyze();
    initHfmTree();

  }
  compress(data);
  
}
module.exports = hfm;
//exports.a = a;
