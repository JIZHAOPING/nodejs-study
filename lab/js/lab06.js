/* global huffman: true */

$(function() {
  var $btnCompress = $('#compress'),
      $btnDecompress = $('#decompress'),
      $output = $('.output>pre'),
      filePicker = $('input[type="file"]').get(0),
      fileReader = new FileReader(),
      fileName, // 要压缩或解压缩的文件名
      opt;      // 要做的操作：compress 或 decompress
      
  
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
    fileReader.readAsArrayBuffer(files[0]);
  }

  function onLoadFile() {
    
    let data = new window.Uint8Array(fileReader.result);
    // //获取读取我文件的File对象
    // var files = filePicker.files;
    // var name = files[0].name;//读取选中文件的文件名
    // var size = files[0].size;//读取选中文件的大小
    // console.log("文件名："+name+"大小："+size);

    // hh.compress(data,$output);
    huffman.compress(data,$output);
  }
});
