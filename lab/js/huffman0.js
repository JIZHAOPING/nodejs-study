/* exported huffman */
/* global entropy roundFractional redundancy */
let huffman = (function() {
    const SNUM_MAX = 256,         // 信源符号个数最多为 SNUM_MAX 个
          NNUM_MAX = 512,         // 树节点个数最多为 512 个
          CHAR_BIT = 8,           // 一个字节有 8 位
          LB10     = 3.321928095; // 以 2 为底 10 的对数
  
    let srcData = null,                   // 源文件无符号字节数组
        n       = 0,                      // 信源符号个数
        scaled  = false,                  // 是否发生信源缩减
        freq    = new Array(SNUM_MAX),    // 符号频次整型数组
        p       = new Array(SNUM_MAX),    // 符号概率浮点数组
        miniFrq = new Array(SNUM_MAX),    // 缩减后符号频次整型数组
        miniP   = new Array(SNUM_MAX),    // 缩减后符号概率浮点数组
        miniTFq = 0,                      // 缩减后符号频次总和
        hfmTree = new Array(SNUM_MAX),    // Huffman 结点数组 
        hfmCode = new Array(SNUM_MAX);    // Huffman 码字字符串数组
  
    let $output;                          // 用来打印输出的 DOM 对象
  
    /**
     * 初始化全局数据，包括：频次数组、概率数组、Huffman树
     * 的节点数组以及码字数组
     *
     * @param obj {object} 初始化数据
     *
     * @returns 无
     */
    function initData(data) {
      srcData = data;     // 信源文件的字节数组
  
      for(let i=0; i<SNUM_MAX; i++)  {
        p[i]       = 0;
        freq[i]    = 0;
        miniP[i]   = 0;
        miniFrq[i] = 0;
        hfmTree[i] = { l: 0, r: 0, p: 0, w: 0 };
        hfmCode[i] = '';
      }
    }
  
    /**
     * 统计信源文件中每个符号出现的频次
     *
     * @returns 无
     */
    function statFreq() {
      for(let i=0; i<srcData.length; i++) {
        freq[srcData[i]]++;
      }
      printFreq();
    }
  
    /**
     * 打印输出信源文件中每个符号出现的频次
     *
     * @returns 无
     */
    function printFreq() {
      let num = 0;
      let total = 0;
  
      printf("信源符号的频次：\n");
      printf("xi    value\tfreq\n");
      printf("-------------------------\n");
      for(let i=0; i<SNUM_MAX; i++)	{
        if(freq[i] !== 0) {
          total += freq[i];
          printf(`x${++num} \t${i}\t${freq[i]}\n`);
        }
      }
      printf("-------------------------\n");
      printf(`频次合计:\t${total}\n\n`);
    }
  
    /**
     * 打印输出信息
     *
     * @returns 无
     */
    function printf(data) {
      $output.append(data);
    }
  
    /**
     * 信源文件分析——计算信源文件每个符号的概率
     *
     * @returns 无
     */
    function infoSrcAnalyze() {
      let total = srcData.length;
  
      for(let i=0; i<SNUM_MAX; i++)    {
        if(freq[i] === 0) continue;
        p[i] = roundFractional(freq[i] / total, 6);
        ++n;
      }
  
      printInfoSrcSum();
    }
  
    /**
     * 打印信源文件分析结果，信源文件每个符号的概率、信源熵以及信源的剩余度。
     *
     * @returns 无
     */
    function printInfoSrcSum() {
      let h   = entropy(p),       // 信源熵
          num = 0;
  
      printf("信源符号的概率分布：\n");
      printf("xi    value\tp\n");
      printf("-------------------------\n");
      for(let i=0; i<SNUM_MAX; i++) {
        if(freq[i] !== 0) printf(`x${++num} \t${i}\t${p[i]}\n`);
      }
      printf("-------------------------\n");
      printf(`熵:\t\t${h} bit\n`);
      printf(`剩余度:\t\t${redundancy(h, num)}\n\n`);
    }
  
    /**
     * 将信源文件中每个符号出现的频次，等比例缩小，使缩小
     * 后的频次取值在0～255之间。频次为零的保持不变，频次
     * 不为零的等比例缩小不会为零。
     *
     * @returns {bool}  是否进行了等比缩小，true 缩小了，false 没有缩小
     */
    function scaleFreq() {
      let f = 0, max = 0, scale = 0;
  
      for(let i=0; i<SNUM_MAX; i++) {
        if(freq[i] > max)  max = freq[i];
      }
  
      if(max < SNUM_MAX) return(false);
  
      scale = (max / SNUM_MAX) + 1;
  
      for(let i=0; i<SNUM_MAX; i++) {
        if(freq[i] !== 0) {
          f = roundFractional(freq[i] / scale, 0);
          miniFrq[i] = (f == 0) ? 1 : f;
        }
      }
  
      printScaleFreq();
  
      return(scaled = true);
    }
  
    function printScaleFreq() {
      let num = 0;
      let total = 0;
  
      printf("等比例缩小之后信源符号的频次：");
      printf("信源符号的频次：\n");
      printf("xi    value\tfreq\n");
      printf("-------------------------\n");
      for(let i=0; i<SNUM_MAX; i++)	{
        if(freq[i] !== 0) {
          total += miniFrq[i];
          printf(`x${++num} \t${i}\t${miniFrq[i]}\n`);
        }
      }
      printf("-------------------------\n");
      printf(`频次合计:\t${total}\n\n`);
    }
  
    /**
     * 缩减后的信源文件分析——计算信源文件每个符号的概率
     *
     * @returns 无
     */
    function scaledInfoSrcAnalyze() {
      let total = 0;
  
      for(let i=0; i<SNUM_MAX; i++) {
        total += miniFrq[i];
      }
  
      for(i=0; i<SNUM_MAX; i++)    {
        miniP[i] = roundFractional(miniFrq[i] / total, 6);
      }
  
      miniTFq = total;
    }
  
    /**
     * 计算压缩文件头部存储频次表等信息的开销。
     *
     * @return inti 以字节为单位的开销大小
    function StoreCost() {
      let secNum    = 0;    // 行程段的数量
      let totalLen  = 0;    // 存储总开销
      const char SPAN[] = "000";    // 行程段与段之间的间隙
      char strFrq[SNUM_MAX+1] = ""; // 频次字符串
      char *p1 = NULL, *p2  = NULL; // 操作频次字符串的指针
  
      // 初始化频次字符串
      for(let i=0; i<SNUM_MAX; i++) strFrq[i] = (frequence[i] === 0) ? '0' : '1';
  
      p1 = strstr(strFrq, "1");
      while((p2 = strstr(p1, SPAN)) != NULL) {
        secNum++;
        totalLen += p2 - p1;
        if((p1 = strstr(p2, "1")) == NULL) break;
      }
  
      if(p1 != NULL) {
        if(*p1 == '1') {
          secNum++;
          while(*(p1++) != EOS) totalLen++;
        }
      }
  
      totalLen += secNum * 2;
      totalLen = (totalLen < SNUM_MAX) ? (totalLen + 1) : SNUM_MAX;
      totalLen += sizeof(HFM_FILE_TOKEN);
  
      printf(`文件头部存储开销：${totalLen} 字节\n\n`);
  
      return(totalLen);
    }
     */
  
    /**
    function initHfmTree() {
      for(var i=0; i<SNUM_MAX; i++) HfmTree[i].w = frequence[i];
  
      HfmTree[HEAD].p = EOT;
      HfmTree[HEAD].w = SNUM_MAX;
    }
  */
  
    /**
     * 对信源文件做 Huffman 压缩编码
     *
     * @param data 信源文件的字节数组
     *
     * @returns 无
     */
    function compress(data, output) {
      $output = output;
  
      initData(data);
      statFreq();
      infoSrcAnalyze();
  
      /*
      let h       = entropy(p),
          flenSrc = srcData.length;
  
      let notNeedCompress = (flenSrc - flenSrc * h / CHAR_BIT) < StoreCost();
  
      if(notNeedCompress) {
        WrapSrcFile();
        return;
      }
      */
  
      if(scaleFreq())  scaledInfoSrcAnalyze();
  
      //initHfmTree();
      /*
      genHfmTree();
      genHfmCode();
      writeHfmFile();
      */
    }
  
    function decompress(data, output) {
      // 解压缩
    }
  
    return { compress, decompress };
  })();
  