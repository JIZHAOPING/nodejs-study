#!/user/bin/env node
var fs = require('fs'),
    i,k=0;
for(i in fs){
 k+=1;
 console.log(k);
 //console.log("嘿嘿");
}

fs.open(process.argv[1],"r+",function(err,fd){
  //"r+":以读写的方式打开文件，当文件不存在时产生异常
  console.log("找到命令行参数指定的文件了");
  console.log(err);
  console.log(fd);
  //open一个文件成功之后，返回的是一个文件的描述符，是一个数字
});

fs.readFile("./fsf.txt",function(err,data){
  console.log(err);//null 如果err为null就证明读取成功了
  console.log(data);//<buffer>读取的内容数据
  console.log(data.length);//<buffer>读取的内容数据的长度
});

//writeFile()执行后文件原内容将被替换
fs.writeFile("./fsf.txt","1",function(err){
  console.log(err);
  console.log("success!")
});

fs.stat("./fsf.txt",(err,data)=>{
  console.log(err);
  console.log(data);
})

console.log(process.argv[1]);
