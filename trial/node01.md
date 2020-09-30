## createServer的用法

```javascript
var http = require('http');
http.createServer(function(req,res){
  //发送HTTP头部;HTTP状态值：200：ok;内容类型：text/plain
  res.writeHead(200,{'Content-Type':'text-plain'});
  //发送响应数据"Hello World"
  response.end('Hello World\n');
}).listen(8080);
//终端打印如下信息
console.log('Server running at http://127.0.0.1:8080/')
```
## fs模块

>**引入**
>>`var fs = require('fs');`

>**方法**
>> open与openSync：打开文件
>>>使用上基本相同，唯一的差距在于异步的数据是以**第二个参数**的形式传回回调函数，而同步的方法，**处理后的结果数据**就是返回值

>**fs.open(filename,flags,[mode],callback)**
>> 其中filename、flags、callback是必须指定的参数，mode参数为可选参数
>> filename:你要读取文件的路径，可以是绝对路径。也可以是相对路径
>> callback:打开文件**成功后**执行的回调函数
>> 格式：
``` javascript
    function(err,data){
      //err:读取失败时，出发的错误对象
      //data:回调函数的可用数据
      //在open的回调函数中data是一个整数值，代表打开文件时返回的文件描述符
      //每一个文件都有唯一的文件描述符，用于指代打开的文件
    }
```

## module.exports
> 当使用module.exports导出函数时，注意在源文件里只要require了，那么就可以直接调用。
如果你写的导出函数里面还有函数，当你用aa去调用是不行的
> **需求**：main.js调用a.js里函数里的函数
```javascript
//a.js
var aa = function(){
  console.log("调用成功了");
  function bb(){
    console.log("又调用成功了");
  }
  bb();//只能用这种方法使bb()执行
}
module.exports = aa;

//main.js
var aaa = require("./a");
aaa();//因为module.exports返回的是模块对象本身

//调用成功了
//又调用成功了
```
> exports
exports是module.exports的一个引用，exports指向的是module.exports
```javascript
//a.js
var aa = function(){
  console.log("我出来了！");
  function bb(){
    console.log("我也出来了！");
  }
}
//main.js
var aaa = require('./a');
aaa.aa();

//我出来了！
//我也出来了！
```

## js的原型继承
> 需求：写两个函数，一个主函数一个子函数，他们有公用的变量，于是我想起了在我记忆里尘封已久的**继承**
> 前导知识：
+ js对象是若干无序属性的集合（数据属性、访问器属性、内部属性）
+ 生成对象的3种方式：字面量直接生成、Object工厂方法、构造函数实例化对象
```javascript
//1.字面量直接生成
var obj = {
  num:10,
  show:function(){}
} 
//2.Objext工厂方法
var newobj = Object.create(obj);
newobj.age = 23;//自有属性
//3.构造函数实例化对象
function Person(name,age){
  this.name = name;
  this.age  = age;
}
Person.prototype.sayName = function(){
  console.log(this.name,this.age);
}
var p = new Person("Mike","12");
p.sayName();
```
> 属性访问链（自有属性和继承属性）
```javascript
var proObj = {
  z:3
}
var obj = Object.create(proObj);
obj.x=1;
obj.y=2;

/*obj{x=1,y=2}-->proObj{z=3}-->Object.prototype-->null  [可用__proto__来访问上一级]*/

obj.z=5;
obj.hasOwnProperty('z');//true
obj.z;//5
proObj.z;//还是3

delete obj.z;
obj.z;//变回3

//删除原型链上的属性
delete obj.__proyo__.z;
obj.z;//undefined
```

> 基于构造函数实现的原型继承
```javascript
function Person(){
  this.name=name;
  this.age =age;
}
Person.prototype.sayHi=function(){
  console.log("Hi,i'm"+this.name);
}
var p1=new Person(20,"jack");
```
![img](./yuanxing.jpg)

+ 属性操作
```javascript
function MyObj(){}
MyObj.prototype.z=3;
var obj=new MyObj();
obj.x=1;
obj.y=2;
obj.z;//3
obj.z=5;
obj.hasOwnProperty('z');//true
obj.z;//5
MyObj.prototype.z;//3
delete obj.z;
obj.z;//3
```
