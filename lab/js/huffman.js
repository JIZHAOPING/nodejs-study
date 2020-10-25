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
        HEAD    = NNUM_MAX-1;

    let $output;

    function initData(data){
        srcData = data;
        for(let i=0;i<NNUM_MAX;i++){
            p[i]    = 0;
            freq[i] = 0;
            miniP[i]= 0;
            miniFrq[i] = 0;
            hfmTree[i] = {l:0,r:0,p:0,w:0};
            hfmCode[i] = '';
        }
        // hfmTree[HEAD] = {l:0,r:0,p:0,w:0};
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

    function printf(data){
        $output.append(data);
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

    function statFreq(){
        for(let i=0;i<srcData.length;i++){
            freq[srcData[i]]++;
        }
        printFreq();
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

    function scaleFreq(){
        let f = 0,max = 0,scale = 0;

        for(let i = 0;i<SNUM_MAX;i++){
            if(freq[i]>max) max = freq[i];
        }

        if(max<SNUM_MAX) return(false);

        scale = (max/SNUM_MAX)+1;

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

        var pHfmCode = null;
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


// 目的：利用信源符号对应的码字，对信源文件重新编码，实现
// 		 压缩。
//压缩文件由两部分组成：文件头、编码主体。其中文件头信息由三部分组成：HFM标识符、FLAG字段和频率表

    function WriteHfmFile()
    {
        var content='';
        var str = '';   
	
        for(i = 0;i<SNUM_MAX;i++){
            if(hfmCode[i]=='') continue;
            str = parseInt(hfmCode[i],2);
            str = str.toString(16);
            content += str;
            // console.log(content);
        }

        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "file.txt");//saveAs(blob,filename)
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
	    var	secNum			 = 0;		// 行程段的数量
	    var	totalLen		 = 0;		// 行程段中频次的总数量
	    var	SPAN			 = new Array();	// 行程段与段之间的间隙
	    var	strFrq           = new Array(SNUM_MAX+1);		// 频次字符串
	    var	p1 = NULL, p2  = NULL;	// 操作频次字符串的指针

	    // 初始化频次字符串
	    for(i=0; i<SNUM_MAX; i++)	strFrq[i] = (freq[i]==0) ? '0':'1';

        // #ifdef _DEBUG    
        // 	printf("频次表的行程分析：\nstart\tlen\tfreq\n");
        // 	printf("---------------------------------------------");
        // #endif

	    // p1 = strstr(strFrq, "1");//返回strFrq数组中1第一次出现的位置
	    while((p2 = strstr(p1, SPAN)) != NULL)//strFrq中000是否出现
	    {
		    secNum++;//行程段的数量
		    totalLen += p2 - p1;//行程段中频次的总数量

        // #ifdef _DEBUG
		//         printf("\n%0.2X\t%d    ", p1-strFrq, p2-p1);
		//         while(p1<p2)	printf("%5d", frequence[(p1++)-strFrq]);
        // #endif
		
		    if((p1 = strstr(p2, "1")) == NULL) break;//如果p2中1没有出现，那就退出循环
	    }
	
	    if(p1 != NULL)
	    {
		    if(p1 == '1')
		    {
			    secNum++;
			    while((p1++) != EOS) totalLen++;
		    }
	    }

        // #ifdef _DEBUG
	    //     printf("\n---------------------------------------------\n");
	    //     printf("行程段数：\t%d\n频次总数：\t%d", secNum, totalLen);
        // #endif

	    return(((totalLen + secNum * 2)< SNUM_MAX) ? secNum : 0);
    }

    /*------------------------------------------------------------
    目的：	按行程方式存储频次表。
    输入：
		    FILE* fpDst		压缩文件的文件指针
		    int   secNum	行程段的数量
    输出：
		    无
    ------------------------------------------------------------*/
    function SaveFrqRunLen(fpDst, secNum)
    {
	    var	i;
	    var	SPAN   = "000";	// 行程段与段之间的间隙
	    var	strFrq = new Array(SNUM_MAX+1);		// 频次字符串
	    var	p1 = NULL, p2  = NULL;	// 操作频次字符串的指针

	    // 初始化频次字符串
	    for(i=0; i<SNUM_MAX; i++)	strFrq[i] = (freq[i]==0) ? '0':'1';

	    p1 = strstr(strFrq, "1");
	    fputc(secNum, fpDst);					// 保存行程段的数量
	    while((p2 = strstr(p1, SPAN)) != NULL)
	    {
		    fputc(p1-strFrq, fpDst);			// 保存行程段的起始位置
		    fputc(p2-p1, fpDst);				// 保存行程段的长度
		
		    // 保存行程段中的频次值
		    while(p1<p2)	fputc(frequence[(p1++)-strFrq], fpDst);

		    if((p1 = strstr(p2, "1")) == NULL)	break;
	    }

	    if(p1 != NULL)
	    {
		    if(p1 == '1')
		    {
			    fputc(p1-strFrq, fpDst);		// 保存行程段的起始位置
			    // p2 = &strFrq[SNUM_MAX];
			    fputc(p2-p1, fpDst);			// 保存行程段的长度

			    while(p1 != EOS)
			    {
				    fputc(freq[(p1++)-strFrq], fpDst);
			    }
		    }
	    }
    }

    function compress(data,output){
        $output = output;

        initData(data);
        statFreq();
        infoSrcAnalyze();

        if(scaleFreq()) scaledInfoSrcAnalyze();

        initHfmTree();
        GenHfmTree();
        // console.log(hfmTree);
        GenHfmCode();
        WriteHfmFile();
    }

    return { compress, decompress };
})();