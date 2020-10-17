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

    function WriteHfmFile()
    {
	    var ch = 0;
	    var  i, len = 0;
	    var buf = 0x00;
        const mask = 0x80;
        
        
        // var fso = new ActiveXObject("Scripting.FileSystemObject");
        // var a = fso.CreateTextFile("f:\\毕业设计\\新建文件夹(3)\\text0.txt", true);        
        // a.WriteLine("This is a test.");
        // a.Close();    

        
	// if((fpDst=fopen(dstFile, "w+b")) == NULL)
	// {
	// 	fclose(fpSrc);
	// 	Error("%s 文件创建失败！\n", dstFile);
	// }

	// WriteHfmFileHead(fpDst);

	// while((ch=fgetc(fpSrc)) != EOF)			// 写压缩文件编码主体
	// {
	// 	for(i=0; HfmCode[ch][i] != EOS; i++)
	// 	{
	// 		if(HfmCode[ch][i] == '1')	buf |= mask >> len;

	// 		if(len == (CHAR_BIT - 1))
	// 		{
	// 			fputc(buf, fpDst);
	// 			len = -1;
	// 			buf = 0x00;
	// 		}

	// 		len++;
	// 	}
	// }
	
	// _ASSERT(len != -1);

	// if(len != 0)	// buf没有填充完毕，写压缩文件的最后一个字节
	// {
	// 	fputc(buf, fpDst);
	// 	fseek(fpDst, strlen(HFM_FILE_TOKEN), SEEK_SET);
	// 	buf = fgetc(fpDst) + len;
	// 	fseek(fpDst, strlen(HFM_FILE_TOKEN), SEEK_SET);
	// 	fputc(buf, fpDst);
	// 	fseek(fpDst, 0, SEEK_END);
	// }


	// fclose(fpSrc);
	// fclose(fpDst);
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