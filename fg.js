#!/usr/bin/node
var s1=2;
function select(){
  console.log("select里面调用s1:"+s1);
  for(var i=0;i<22;i++){
    s1++;
  }
  console.log("select里的for循环调用s1:"+s1);
  var s2=((s1==21)?0:1);
  return{
    s1:s1,
    s2:s2
  }
}
function gen(){
  while(select().s2!=0){
    console.log(select().s1);
  }
}
gen();
