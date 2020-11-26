/* global huffman: true */

$(function() {
  var $btnCompress = $('#compress'),
      $btnDecompress = $('#decompress'),
      $output = $('.output>pre'),
      filePicker = $('input[type="file"]').get(0),
      fileReader = new FileReader(),
      fileName, // 要压缩或解压缩的文件名
      opt,      // 要做的操作：compress 或 decompress
      data;
      
  
  $btnCompress.click(onClickCompress);
  $btnDecompress.click(onClickDecompress);
  filePicker.onchange = onChangeFile;
  fileReader.onload = onLoadFile;


  function onClickCompress() {
    filePicker.click();
    
    opt = 'compress';
  }

  function onClickDecompress() {
    filePicker.click();
    opt = 'decompress';
  }

  function onChangeFile() {
    var files = filePicker.files;
    
    if(files.length === 0) return;
    fileName = files[0].name;
    
    // if(opt=='compress'){
    //   fileReader.readAsText(files[0]);
      // data=str2utf8(fileReader.result);
      // console.log(fileReader.result);
      // let utf8decoder = new TextDecoder();
      // console.log(utf8decoder.decode(st));
    // }else{
      fileReader.readAsArrayBuffer(files[0]);
    // }
  }
  // function str2utf8(str) {
  //   encoder = new TextEncoder('utf8');
  //   return encoder.encode(str);
  // }

  function onLoadFile() {
    // console.log(fileReader.result);
    // data=str2utf8(fileReader.result);
    // var str=newString(fileReader.result.getBytes(),"UTF-8");
    // console.log(str);

    let data = new window.Uint16Array(fileReader.result);
    // console.log(data);
    // function str2utf8(str) {
    //   encoder = new TextEncoder('utf8');
    //   return encoder.encode(str);
    // }
    // st=str2utf8(data);
    // console.log(st);
    // let utf8decoder = new TextDecoder();
    // console.log(utf8decoder.decode(st));


    if(opt=='compress'){
      // data=str2utf8(fileReader.result);
      huffman.compress(data,$output);
    }else{
      // data = new window.Uint8Array(fileReader.result);
      huffman.decompress(data,$output);
    }  

    // var str='才能九二五[个你从未和发热即可从文化人飓风才能火热开赛的每次看理解为哦竟然都成都市开发了uewhfreuifhdreqigferi';
    // console.log(str);
    // function str2utf8(str) {
    //   encoder = new TextEncoder('utf8');
    //   return encoder.encode(str);
    // }
    // st=str2utf8(str);
    // let utf8decoder = new TextDecoder();
    // console.log(utf8decoder.decode(st));

  }
});


