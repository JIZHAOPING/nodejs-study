#!/usr/bin/node
/*
var a = function(){
  function huf(){
    console.log("我出来啦");
  }
  huf();
}
*/
var assert = require('assert');
var roundFractional= require('./lib.js');
function hfm(data){
  //console.log("调用成功");
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

      //hfmTree[HEAD]={l:0,r:0,p:0,w:0};    

  function initData(data){
    //console.log(data);
    //console.log("爷爷在此~");
    for(var i = 0;i<SNUM_MAX;i++){
      //console.log(miniTFq+"可以吗");测试是否可以调用外部变量：可以
      p[i]=0;
      freq[i]=0;
      miniP[i]=0;
      miniFrq[i]=0;
      hfmTree[i]={l:0,r:0,p:0,w:0};
      hfmCode[i]='';
    }
    for(i=256;i<NNUM_MAX&&i>=SNUM_MAX;i++){
      hfmTree[i]={l:0,r:0,p:0,w:0};
    }
    console.log(hfmTree[510]);
    //console.log(hfmTree[510].l+"头节点？");
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
    //console.log("于书睿，我叫你一声你敢答应吗！？");
    srcData=data;
    for(var i=0;i<srcData.length;i++){
      freq[srcData[i]]++;
    }/*
    for(var k=0;k<SNUM_MAX;){
      console.log(freq[k],k++);
    }*/
    return {
      freq:freq
    }
  }
  function infoSrcAnaLyze(data){
    //console.log(data);
    //console.log("不敢");
    srcData=data;
    var total=srcData.length;
    console.log("srcdata.length"+total);

    for(var i=0;i<SNUM_MAX;i++){
      if(freq[i]==0) continue;
      p[i]=roundFractional(freq[i]/total,6);
      ++n;
    }
    console.log("信源符号个数为"+n);
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
    console.log("max"+max);
    if(max<SNUM_MAX) return(false);
    scale=(max/SNUM_MAX)+1;
    console.log("是否缩减："+scale);
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
    console.log("计算概率");
    var total=0;
    for(var i=0;i<SNUM_MAX;i++){
      total+=miniFrq[i];
    }
    console.log("缩减后符号整型数组频次之和"+total);
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
    for(var i=0;i<SNUM_MAX;i++){
      hfmTree[i].w=freq[i];
      //console.log(hfmTree[i].w);
    }
    hfmTree[HEAD].p=EOT;
    hfmTree[HEAD].w=SNUM_MAX;
    console.log("初始化后hfmTree的头节点："+hfmTree[HEAD]);
    return{
      hfmTree:hfmTree
    }
  }
  /*
  function proObj(){
    this.s1=0;
    this.s2=0;
  }
  var Gen=new proObj();
  var c=1;
  Gen.GenHfmTree=function(){
    //console.log(a.Select()+"夏天夏天");
    var s3=0;
    //console.log(hfmTree[256].l+"blue");
    while(a.Select()!=0){
      //assert(hfmTree[HEAD].w<NNUM_MAX);
      s3 = hfmTree[HEAD].w++;
      console.log("s3:"+s3);
      console.log(hfmTree[s3],c++);//256
      //console.log(hfmTree[256],c++);
      hfmTree[s3].l=this.s1;
      hfmTree[s3].r=this.s2;
      hfmTree[s3].w=hfmTree[this.s1].w+hfmTree[this.s2].w;

      hfmTree[this.s1].p=s3;
      hfmTree[this.s2].p=s3;

      //console.log(hfmTree);
    }
    return{
      hfmTree:hfmTree
    }
  }
  var a=new proObj();
  a.Select=function(){
    var i,j;
    const num=hfmTree[HEAD].w;
    console.log("num:"+num);
    var MinWeight=Number.MAX_VALUE;
    this.s1=this.s2=HEAD;
    //console.log(HEAD);511
    for(i=0;i<num;i++){
      if((hfmTree[i].w<MinWeight)&&(hfmTree[i].w!=0)&&(hfmTree[i].p==0)&&(i!=this.s1)&&(i!=this.s2)){
        MinWeight=hfmTree[i].w;
        this.s1=i;     
      }               
    }
    //console.log("MinWeight:"MinWeight);
    MinWeight=Number.MAX_VALUE;
    //console.log(num);
    for(j=0;j<num;j++){
      if((hfmTree[j].w<MinWeight)&&(hfmTree[j].w!=0)&&(hfmTree[j].p==0)&&(j!=this.s1)&&(j!=this.s2)){
        MinWeight=hfmTree[j].w;
        this.s2=j;                            
      }               
    }
    console.log("s1和s2分别为"+this.s1,this.s2);
    return(((this.s2 == HEAD) && (this.s1 == HEAD)) ? 0 : 1);
  }
  function GenHfmTree(){
    var s3=0;
    while(Select().s!=0){
      assert(hfmTree[HEAD].w<NNUM_MAX);
      s3=hfmTree[HEAD].w++;

      hfmTree[s3].l=Select().s1;
      hfmTree[s3].r=Select().s2;
      hfmTree[s3].w=hfmTree[Select().s1].w+hfmTree[Select().s2].w;

      hfmTree[Select().s1].p=s3;
      hfmTree[Select().s2].p=s3;
      return{
        hfmTree:hfmTree
      }
      console.log("hhhh");
    } 
  }*/
  function Select(){
    var i;
    const num=hfmTree[HEAD].w;
    var MinWeight=Number.MAX_VALUE;
    s1=s2=HEAD;
    for(i=0;i<num;i++){
      if((hfmTree[i].w<MinWeight)&&(hfmTree[i].w!=0)&&(hfmTree[i].p==0)){
        MinWeight=hfmTree[i].w;
        s1=i;
      }
    }
    MinWeight=Number.MAX_VALUE;
    for(i=0;i<num;i++){
      if((hfmTree[i].w<MinWeight)&&(hfmTree[i].w!=0)&&(hfmTree[i].p==0)&&(i!=s1)){
        MinWeight=hfmTree[i].w;
        s2=i;
      }
    }
    var s=((s2 == HEAD) && (s1 == num-1)) ? 0 : 1;
    //console.log("wocao"+s);
    return {
      s:s,
      s1:s1,
      s2:s2
    }
  }

  function compress(data){
    //console.log(data);
    //console.log("纪朝霞，我叫你一声你敢答应吗？！");
    initData(data);
    statFreq(data);
    infoSrcAnaLyze(data);
    if(scaledFreq()) scaledInfoSrcAnalyze();
    initHfmTree();
    //GenHfmTree();
    var s3=0;
    
    while(Select().s!=0){
      assert(hfmTree[HEAD].w<NNUM_MAX);
      s3=hfmTree[HEAD].w++;
      
      hfmTree[s3].l=Select().s1;
      hfmTree[s3].r=Select().s2;
      hfmTree[s3].w=hfmTree[Select().s1].w+hfmTree[Select().s2].w;

      hfmTree[Select().s1].p=s3;
      hfmTree[Select().s2].p=s3;
    }
  }  
  compress(data);
  
}
module.exports = hfm;
//exports.a = a;
