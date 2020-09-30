#!/usr/bin/node

function proObj(s1,s2){
  this.s1=3;
  this.s2=2;
}
var a1=new proObj(this.s1,this.s2);
var a2=new proObj(this.s1,this.s2);
a1.gen=function(){
  //console.log(a2.select().ss);
  while(a2.select().ss!=0){
    console.log(a2.select.prototype);
    //console.log(a2.select().ss);
  }
}
a2.select=function(){
  for(var i=0;i<23;i++){
    this.s1=i;
    this.s2=i+2;
  }
  var ss=(this.s1==22)?0:1;
  return{
    ss:ss,
    s1:this.s1,
    s2:this.s2
 }
}     
//console.log(a2.select)
console.log(a1.gen());

//console.log(a2.s1);
