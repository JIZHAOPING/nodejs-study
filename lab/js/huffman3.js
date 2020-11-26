/* exported huffman */
/* global entropy roundFractional redundancy */
let huffman = (function(){
    const SNUM_MAX = 256,
          NNUM_MAX = 512,
          CHAR_BIT = 8,
          LB10     = 3.321928095;

    let srcData = null,
        n       = 0,
        scaled  = false,
        freq    = new Array(SNUM_MAX),
        p       = new Array(SNUM_MAX),
        miniFrq = new Array(SNUM_MAX),
        miniP   = new Array(SNUM_MAX),
        miniTFq = 0,
        hfmTree = new Array(SNUM_MAX),
        hfmCode = new Array(SNUM_MAX),
        HEAD    = NNUM_MAX-1,
        HFM_FILE_TOKEN = "Hfm",
        // map     = new Array(SNUM_MAX);
        map=[];
    let $output;

    function printf(data){
        $output.append(data);
    }


    function initData(data){
        srcData = data;
        for(let i=0; i<SNUM_MAX; i++)  {
            p[i]       = 0;
            freq[i]    = 0;
            miniP[i]   = 0;
            miniFrq[i] = 0;
            hfmCode[i] = '';
          }
        
          for(let i=0; i<NNUM_MAX; i++) hfmTree[i] = { l: 0, r: 0, p: 0, w: 0 };
    } 

    function statFreq(){
        for(let i=0;i<srcData.length;i++){
            freq[srcData[i]]++;
            // map[srcData[i]]=srcData[i];
        }
        printFreq();
        
    }
    function printFreq(){
        let num   = 0;
        let total = 0;

        printf("信源符号的频次：\n");
        printf("xi    value\tfreq\n");
        printf("-------------------------\n");
        for(let i = 0; i<SNUM_MAX; i++){
            if(freq[i]!=0){
                total += freq[i];
                printf(`x${++num} \t${i}\t${freq[i]}\n`);
            }
        }
        printf("-------------------------\n");
        printf(`频次合计:\t${total}\n\n`);
    }

    function infoSrcAnalyze(){
        let total = srcData.length;

        for(let i = 0;i<SNUM_MAX;i++){
            if(freq[i]===0) continue;
            p[i] = roundFractional(freq[i]/total,6);
            ++n;
        }

        printInfoSrcSum();
    }
    function printInfoSrcSum(){
        let h   = entropy(p),
            num = 0;
        
        printf("信源符号的概率分布：\n");
        printf("xi    value\tp\n");
        printf("-------------------------\n");
        for(let i = 0;i<SNUM_MAX;i++){
            if(freq[i]!=0) printf(`x${++num} \t${i}\t${p[i]}\n`)
        }
        printf("-------------------------\n");
        printf(`熵:\t\t${h} bit\n`);
        printf(`剩余度:\t\t${redundancy(h, num)}\n\n`);
    }

    function scaleFreq(){
        let f = 0,max = 0,scale = 0;

        for(let i = 0;i<SNUM_MAX;i++){
            if(freq[i]>max) max = freq[i];
        }

        if(max<SNUM_MAX) return(false);

        scale = (max/SNUM_MAX)+1;
        // console.log("scale:"+scale);
        for(let i=0;i<SNUM_MAX;i++){
            if(freq[i]!=0){
                f = roundFractional(freq[i]/scale,0);
                miniFrq[i] = (f==0)?1:f;
            }
        }

        printScaleFreq();

        return(scaled = true);
    }
    var total;
    function printScaleFreq(){
        let num = 0;
        let total = 0;

        printf("等比例缩小之后信源符号的频次：");
        printf("信源符号的频次：\n");
        printf("xi    value\tfreq\n");
        printf("-------------------------\n");
        for(let i = 0;i<SNUM_MAX;i++){
            if(freq[i]!=0){
                total += miniFrq[i];
                printf(`x${++num} \t${i}\t${miniFrq[i]}\n`);
            }
        }
        printf("-------------------------\n");
        printf(`频次合计:\t${total}\n\n`);
        return{
            total:total
        }
    }


    function scaledInfoSrcAnalyze(){
        let total = 0;

        for(let i = 0;i<SNUM_MAX;i++){
            total += miniFrq[i];
        }

        for(i = 0;i<SNUM_MAX;i++){
            miniP[i] = roundFractional(miniFrq[i]/total,6);
        }

        miniTFq = total;
    }

    /**
      * 计算压缩文件头部存储频次表等信息的开销
      *
      * @return inti 以字节为单位的开销大小
      */
    function storeCost() {
        // 码表保存方式：
        // 1. 保存信源符号频次数据，而不是保存码字或者保存频率
        // 2. 频次数据最大值为 256，大于 256 的，做等比缩减
        // 3. 频次缩减小于 1 的，直接设为 1
      
        // 码表的存储方案有三种：
        // 1. 按位存储，每个信源符号，的频次保存在该符号 ASCII 值所在的数组位置
        //    这种方式，存储机制简单，消耗存储空间为固定的 256 字节
        // 2. 按行程存储，信源符号 ASCII 值连续的符号，组成一个行程段
        //    每个行程段的存储方式为：[START][LENGTH][...]
        //    [START] 是行程段中 ASCII 值最小的信源符号其 ASCII 值，占一个字节
        //    [LENGTH] 是行程段中 ASCII 值连续的符号个数，占一个字节
        //    [...] 是该行程段中按 ASCII 值从小到大，每个信源符号的频次
        //    这样保存的码表消耗的存储空间为：secNum * 2 + n 字节
        //    其中：secNum 是行程段数，n 为信源符号个数
        // 3. 配对存储，存储方式为：[SYMBOL][FREQUENCE]
        //    [SYMBOL] 是信源符号的 ASCII 值，占一个字节
        //    [REQUENCE] 是信源符号的频次，占一个字节
        //    这样保存的码表消耗的存储空间为：2 * n 字节
      
        // 三种存储方案，应选择占用空间最小的存储方案
      
        let freqNew = freq.map(f => f === 0 ? 'x' : 1);
        let str = freqNew.join('');
        let secNum = str.match(/\d+/g).length;    // 行程段的数量
      
        // 三种存储方案的存储总开销，取最小值
        let size = Math.min(SNUM_MAX, 2 * secNum + n, 2 * n) + HFM_FILE_TOKEN.length + 1;
        printf(`文件头部存储开销：${size} 字节\n\n`);
        return(size);
    }

    function initHfmTree(){
        for(let i = 0;i<SNUM_MAX;i++) hfmTree[i].w = freq[i];

        hfmTree[HEAD].p = -1;
        hfmTree[HEAD].w = SNUM_MAX;
    }

    function GenHfmTree(){
        let s1=0,s2=0,s3=0;
        while(Select(s1,s2).a!=0){
            s1 = Select(s1,s2).s1;
            s2 = Select(s1,s2).s2;

            if(hfmTree[HEAD].w>NNUM_MAX) break;

            s3 = hfmTree[HEAD].w++;
            hfmTree[s3].l = s1;
            hfmTree[s3].r = s2;
            hfmTree[s3].w = hfmTree[s1].w + hfmTree[s2].w;

            hfmTree[s1].p = s3;
            hfmTree[s2].p = s3;    
        }
    }
    function Select(s1,s2){
        let i;
        const num = hfmTree[HEAD].w;
        // console.log(num);
        let MinWeight = Number.MAX_SAFE_INTEGER;

        s1 = s2 = HEAD;
        for(i=0;i<num;i++){
            if((hfmTree[i].w<MinWeight)&&(hfmTree[i].w!=0)&&(hfmTree[i].p==0)){
                MinWeight = hfmTree[i].w;
                s1 = i;
            }
        }

        MinWeight = Number.MAX_SAFE_INTEGER;
        for(i = 0;i<num;i++){
            if((hfmTree[i].w<MinWeight)&&(hfmTree[i].w!=0)&&(hfmTree[i].p==0)&&(i!=s1)){
                MinWeight = hfmTree[i].w;
                s2 = i;
            }
        }
        let a = ((s2 == HEAD) && (s1 == num-1)) ? 0 : 1
        return{
            a:a,
            s1:s1,
            s2:s2
        };

    }
    function GenHfmCode(){
        var i,pos;
        var code = new Array(SNUM_MAX);
        var pCode = '';

        // var pHfmCode = null;
        var node = {l:0,r:0,p:0,w:0};

        for(i = 0;i<SNUM_MAX;i++){
            if(hfmTree[i].p==0) continue;
            node = hfmTree[i];
            pos = i;
            code[i] = '';

            while(node.p!=0){
                pCode = (hfmTree[node.p].l == pos) ? '1':'0';
                code[i] += pCode;
                pos = node.p;	
                node = hfmTree[pos];
            }

            let str = code[i].split("");
            let str1 = str.reverse();
            let str2 = str1.join("");

            hfmCode[i] = str2;
        }
        PrintHfmCode();
    }
    function PrintHfmCode(){
        let i, num = 0;
	    let avgLen = 0;

	    printf("码字：\n");
	    printf("xi\tpos\tfreq\tlen\tCode\n");
	    printf("---------------------------------------------\n");
	    for(i=0; i<SNUM_MAX; i++)
	    {
		    if(freq[i] != 0)
		    {
			    num++;
			    avgLen += p[i] * (hfmCode[i].length);
			    printf(`x${num}\t${i}\t${freq[i]}\t${(hfmCode[i].length)}\t${hfmCode[i]}\n`);
		    }
	    }
	    printf("---------------------------------------------\n");
	    printf(`平均码长：\t${avgLen.toFixed(3)}\n`);
	    printf(`编码效率：\t${100.0 * Entropy() / avgLen.toFixed(2)}%\n`);
	    printf(`理论压缩率：\t${100.0 * avgLen / CHAR_BIT.toFixed(2)}%\n\n`);
    }
    function Entropy()
    {
	    var		i;
	    var  	H = 0;

	    for(i=0; i<SNUM_MAX; i++)
	    {
		    if(freq[i]!=0)	H += -p[i] * Math.log10(p[i]) * LB10;
	    }

	    return(H);
    }


    /* 目的：利用信源符号对应的码字，对信源文件重新编码，实现
 	 *	     压缩。
     * 压缩文件由两部分组成：文件头、编码主体。其中文件头信息由三部分组成：HFM标识符、FLAG字段和频率表
     */
    function WriteHfmFile()
    {
        var buf = 0x00;
        var mask = 0x80;
        var leng=0;
        // var str = '';   
        // for(i = 0;i<SNUM_MAX;i++){
        //     if(hfmCode[i]=='') continue;
        //     str = parseInt(hfmCode[i],2);//求出每一个Huffman结点在2进制下表示的（十进制）值
        //     str = str.toString(16);//然后再转为十六进制
        //     content += str;//拼接
        //     // console.log(content);
        // }

        
        const len = HFM_FILE_TOKEN.length + 1 + srcData.length;
        // console.log(len);
        var data = new Uint8Array(len);//必须用uintArray,因为读取文件时用的就是uintarray
        var lth = WriteHfmHeadFile(data);
    
        
        
        for(var i =0;i<srcData.length;i++){			// 写压缩文件编码主体
		    for(var j=0; j<hfmCode[srcData[i]].length; j++)
		    {

			    if(hfmCode[srcData[srcData[i]]][j] == '1')	buf |= mask >> leng;
			    if(leng == (CHAR_BIT - 1))
			    {   
                    // console.log(data);
                    // lth=data.length;
                    data[lth++]=buf;//data.push(buf)//fputc(buf, fpDst);
                    // console.log(data);
				    leng = -1;
				    buf = 0x00;
			    }

			    leng++;
		    }
        }
        // data[lth]=HFM_FILE_TOKEN.charCodeAt(0);
        data=data.slice(0,lth);
        // console.log(data);
        // data = data.filter(str=>{return !!str});
        console.log(data,lth);
        var blob = new Blob([data]);
        saveAs(blob, "file.txt");//saveAs(blob,filename)
    }
    function WriteHfmHeadFile(data){
        var secNum = 0;
        var flag = 0X00;

	    // 写Huffman文件标识符
        // fwrite(&HFM_FILE_TOKEN, sizeof(char), strlen(HFM_FILE_TOKEN), fpDst);
        // const len = HFM_FILE_TOKEN.length + 1 + srcData.length;
        // console.log(len);
        // const data = new Array(len);
        data[0] = HFM_FILE_TOKEN.charCodeAt(0);
        data[1] = HFM_FILE_TOKEN.charCodeAt(1);
        data[2] = HFM_FILE_TOKEN.charCodeAt(2);

	    if((secNum = SuitRunLen()) != 0)
	    {
		    flag = 0X40;			// 第8位置0，代表对信源文件进行压缩
								    // 第7位置1，代表采用行程方式存储频次
            // fputc(flag, fpDst);
            //如果字符串中包含有效的十六进制格式，例如”0xf“，则默认将其转换为相同大小的十进制整数值
            // flag = flag.toString(16);
            data[3]=flag;
            console.log("用行程方式存储");          
		    var lth = SaveFrqRunLen(secNum,data);
	    }
	    else
	    {
		    flag = 0x00;			// 第8位置0，代表对信源文件进行压缩
								// 第7位置0，代表采用顺序方式存储频次
            // fputc(flag, fpDst);
            // flag = flag.toString(16);
            data[3] = flag;
            console.log(data);
            console.log("顺序存储");
		    SaveFrqSerial(data);
        }
        return lth;
    }
    /*------------------------------------------------------------
    目的：	判断频次表是否适合用行程方式压缩。
    输入：
		    无
    输出：
		    int			是否适合
		    <>0			适合，行程段的数量
		    ==0			不适合
    -----------------------------------------------------------*/
    function SuitRunLen()
    {
	    var	i;
        var	strFrq = new Array(SNUM_MAX+1);		// 频次字符串
        var SPAN   = '000';//间隔
        var secNum = 0;
        var totalLen = 0;
        var	p1     = null;	// 操作频次字符串的指针
        var p2     = null;

	    // 初始化频次字符串：如果字符频次为0则为0，不为0则为1
        for(i=0; i<SNUM_MAX; i++)	strFrq[i] = (freq[i]==0) ? '0':'1';
        var strFrq = strFrq.toString();//转换为字符串
        strFrq = strFrq.replace(/,/g, "");
        var p1 = strstr(strFrq,'1');//第一次出现1的位置后面的字符串
        while((p2 = strstr(p1, SPAN)) != -1)
	    {
            secNum++;
            //统计p1-p2的总长度---频次总数量
            totalLen += (p1.length-p2.length);
            
		    if((p1 = strstr(p2, '1')) == -1) break;
        } 
        // console.log(secNum);//63 ：63个行程段

        
        if(p1 != -1)
	    {
		     if(p1[0] == '1')
		    {
                var i= 0;
                secNum++;
			    while((p1[i++]) != undefined) totalLen++;//i++:先算再加
            }
            console.log(p1);
        }
        // console.log(totalLen);
        return(((totalLen + secNum * 2)< SNUM_MAX) ? secNum : 0);

    }
    
    /**查找strFrq中第一次出现index的位置
     * 并返回剩下的字符串？
     * @param {*} strFrq 
     * @param {*} index 
     */
    function strstr(strFrq,index){
        index = strFrq.indexOf(index);
        if(index==-1){
            return -1;
        }
        strFrq = strFrq.substring(index);
        return strFrq;
    }
    /*------------------------------------------------------------
    目的：	按行程方式存储频次表。
    输入：
		    FILE* fpDst		压缩文件的文件指针
		    int   secNum	行程段的数量
    输出：
		    无
    ------------------------------------------------------------*/
    function SaveFrqRunLen(secNum,data)
    {
	    var	i=0;
	    var	SPAN   = "000";	// 行程段与段之间的间隙
	    var	strFrq = new Array(SNUM_MAX+1);		// 频次字符串
	    var	p1 = null, p2  = null;	// 操作频次字符串的指针

	    // 初始化频次字符串
	    for(i=0; i<SNUM_MAX; i++)	strFrq[i] = (freq[i]==0) ? '0':'1';

        var strFrq = strFrq.toString();//转换为字符串
        strFrq = strFrq.replace(/,/g, "");
        // console.log(strFrq);
        p1 = strstr(strFrq, '1');

        // fputc(secNum, fpDst);					// 保存行程段的数量
        data[4]=secNum;
        i = 5;
	    while((p2 = strstr(p1, SPAN)) != -1)
	    {   

            // fputc(p1-strFrq, fpDst);	
            // 保存行程段的起始位置
            var site = strFrq.length-p1.length;
            data[i++] = site;
            // console.log(site);
            // fputc(p2-p1, fpDst);				// 保存行程段的长度
            var pp=p1.length-p2.length;
            data[i++]=pp;
            // data[i][0]=site;
            // data[i][1]=pp;
            // console.log(data[i]);
            // var sp=strFrq.length-p1.length;
            // var l=2;
		    // 保存行程段中的频次值
		    while(pp--)	{
                data[i++]=freq[site++];
            }//fputc(frequence[(p1++)-strFrq], fpDst);


            if((p1 = strstr(p2, "1")) == -1)	break;
            
	    }

	    if(p1 != -1)
	    {
		    if(p1[0] == '1')
		    {
                k++;

                //fputc(p1-strFrq, fpDst);		// 保存行程段的起始位置
                data[k]=[];
                data[k][0]=strFrq.length-p1.length;
			    // p2 = &strFrq[SNUM_MAX];
                //fputc(p2-p1, fpDst);			// 保存行程段的长度
                data[i][1]=p1.length-p2.length;

                var j= 0;
                var l=0;
                var sp=strFrq.length-p1.length;
			    while((p1[j++]) != undefined)
			    {
                    //fputc(freq[(p1++)-strFrq], fpDst);
                    data[i][l]=freq[sp++];
                    
			    }
		    }
        }
        return i;
    }

    function SaveFrqSerial(data,len)    {
	    var i=0;

	    //_ASSERT(fpDst != NULL);
        for(let i=4; i<len; i++) data[i] = srcData[i-4];//fputc(frequence[i], fpDst);
        // return data;
    }

    function DecodeFile(data,i)
    {
	var bit = 0x00;
	const mask  = 0x80;		// 取最高位的掩码
	const LFour = 0x0f;		// 取低四位的掩码
	// HufNode *node = HEAD_NODE;
	// var i, ch, pos = hfmTree[HEAD].w - 1;
	var fpos = 0, flen = 0, len = 0;

	// _ASSERT(fpSrc != NULL);
	// _ASSERT(fpDst != NULL);
	
	// fpos = ftell(fpSrc);//文件指针的当前位置，返回当前的读写位置
	// fseek(fpSrc, strlen(HFM_FILE_TOKEN), SEEK_SET);//在文件开头，fpsrc移到hft长度以后
	// len = fgetc(fpSrc) & LFour;//令第四个元素和00001111按位与
	
	// fseek(fpSrc, 0, SEEK_END);//移到文件末尾
	// flen = ftell(fpSrc);//文件指针的当前位置

	// fseek(fpSrc, fpos, SEEK_SET);//在文件开头，fpsrc移到文件开头？

    // while(ftell(fpSrc) < (flen-1))//如果
    // for(var i=0;i<)
	// {
	// 	ch = fgetc(fpSrc);
	// 	for(i=0; i<CHAR_BIT; i++)
	// 	{
	// 		bit = ch & (mask >> i);

	// 		MOVE_TO_LEAF;

	// 		if(IS_LEAF_NODE)
	// 		{
	// 			fputc(pos, fpDst);
	// 			node = HEAD_NODE;
	// 		}
	// 	}
	// }
	
	// 翻译最后一个字节，最后一个字节可能没有填满
	// ch  = fgetc(fpSrc);
	// len = (len == 0) ? CHAR_BIT : len;
	// for(i=0; i<len; i++)
	// {
	// 	bit = ch & (mask >> i);

	// 	MOVE_TO_LEAF;

	// 	if(IS_LEAF_NODE)
	// 	{
	// 		fputc(pos, fpDst);
	// 		node = HEAD_NODE;
	// 	}
    // }
    var lrn = data[4];
    var k=5;
    var c=0;
    console.log(i);
    for(;i<data.length;i++){
        // for(var j=0;j<lrn&&k<data.length;j++){
        //     n=k;
        //     k=k+2;
        //     var m=0;
        //     while(m<data[n+1]) {
        //         if(data[i]===data[k]){
        //             map[c++]=String.fromCharCode(data[k]);
                    
        //             break;
        //         }else{
        //             k++;
        //             m++;
        //         }    
        //     }
        // }
        for(var j=0;j<SNUM_MAX;j++){
            if(data[i]==freq[j]){
                map[c++]=String.fromCharCode(data[i]);
                break;
            }
        }
    }
    console.log(map);
    
    
    }
    function ReadFrq(flag){
	    var i,secNum, len;
	    // long *p = NULL;							// 频次数组操作指针
	    const mask = 0x40;					// 取FLAG字段的第六位
	    var total = 0;
        var m,k=5;
        if((flag & mask) == mask){  				// 行程模式读取频次表
		    secNum = data[4];
		    for(i=0; i<secNum; i++){
                m=data[k];
                len=data[k++];
                k++;
                for(var i=0;i<secNum;i++) freq[m++]=data[k++];
		    }
	    }
	    else{									// 顺序模式读取频次表
		    for(i=0; i<SNUM_MAX; i++)		freq[i] = data[k++];
	    }
	
	    // 检验频次读取是否正确。频次不能为负，所有频次不能为0。
	    for(i=0; i<SNUM_MAX; i++){
		    if(freq[i] < 0){
			    printf("ERROR: 原文件格式不正确或者已损坏！\n");
			    return(0);
		    }
		    total += freq[i];
	    }
	    if(total == 0){
		    printf("ERROR: 原文件格式不正确或者已损坏！\n");
		    return(0);
	    }
	    return(1);
    }
    function Freqmap(data,i){
        for(;i<data.length;i++){
            freq[data[i]]++;
        }
        console.log(freq);
    }
    function compress(data,output){
        $output = output;

        initData(data);
        statFreq();
        infoSrcAnalyze();

        let h       = entropy(p),
          flenSrc = srcData.length;
    
        let notNeedCompress = (flenSrc - flenSrc * h / CHAR_BIT) < storeCost();
    
        if(notNeedCompress) {
        //   wrapSrcFile();
            console.log("无需压缩");
            return;
        }

        if(scaleFreq()) scaledInfoSrcAnalyze();

        initHfmTree();
        GenHfmTree();
        // console.log(hfmTree);
        GenHfmCode();
        WriteHfmFile();
        console.log("压缩成功");
    }


    function decompress(data,output){
        $output = output;
        console.log("解压缩哈哈哈");
        var ch = 0;
	    const mask  = 0x80;				// 取最高位的掩码
	    const HFour = 0xf0;				// 取高4位的掩码
	    fpSrc = null, fpDst = null;

        //文件找不到
	    /* if((fpSrc=fopen(srcFile, "rb")) == NULL)
		    Error("%s 文件找不到！\n", srcFile); */


	    /* if(IsHFMFile(fpSrc) != 1)
	    {
		    fclose(fpSrc);
		    Error("%s 压缩文件格式不正确！\n", srcFile);
	    } */

        

	    ch = data[3];						// 读取FLAG字段
	    // 对FLAG 字段进行合法性校验，参考设计文档
	    if(((ch & HFour) != 0x80)
		    && ((ch & HFour) != 0x40) 
		    && ((ch & HFour) != 0x00))
	    {
            console.log("压缩格式不正确");
		    // fclose(fpSrc);
		    // Error("%s 压缩文件格式不正确！！\n", srcFile);
	    }

       

	    // if((fpDst=fopen(dstFile, "wb")) == NULL)
	    // {
		//     fclose(fpSrc);
		//     Error("%s 文件创建失败！\n", dstFile);
	    // }

	    // if((ch & mask) == mask)					// 信源文件没有被压缩
	    // {
		//     while((ch=fgetc(fpSrc)) != EOF)		fputc(ch, fpDst);
		//     fclose(fpSrc);
		//     fclose(fpDst);
		//     return; 
	    // }

        if(((ch & HFour) != 0x80)
		    && ((ch & HFour) != 0x40) 
		    && ((ch & HFour) != 0x00))
	    {
            console.log("压缩格式不正确");
        }

        initData(data);
        if(ReadFrq(ch) == 0)				// 频次读取错误的处理
	    {
		    console.log("删除压缩文件！");
	    }
        var i=5,m=0;
        for(var j = 0;j<data[4];j++){
            i++;//6:2
            i+=data[i];//8
            i++;//9
        }
        Freqmap(data,i);
        infoSrcAnalyze();
        initHfmTree();
        GenHfmTree();
        GenHfmCode();
	    DecodeFile(data,i); 

	 
    }

    return { compress, decompress };
})();






