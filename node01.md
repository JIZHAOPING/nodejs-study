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

##module.exports
当使用module.exports导出函数时，注意在源文件里只要require了，那么就可以直接调用。
