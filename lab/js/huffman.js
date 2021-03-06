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
        map     = new Array(SNUM_MAX);
    let $output;

    function initData(data) {
        srcData = data;     // 信源文件的字节数组
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
    function storeCost() {
        let freqNew = freq.map(f => f === 0 ? 'x' : 1);
        let str = freqNew.join('');
        let secNum = str.match(/\d+/g).length;    // 行程段的数量
      
        // 三种存储方案的存储总开销，取最小值
        let size = Math.min(SNUM_MAX, 2 * secNum + n, 2 * n) + HFM_FILE_TOKEN.length + 1;
        printf(`文件头部存储开销：${size} 字节\n\n`);
        return(size);
    }
    function wrapSrcFile(){
        const flag = 0x80;    // 最高位为1，代表信源文件没有被压缩
    
        const len = HFM_FILE_TOKEN.length + 1 + srcData.length;
        const data = new Uint8Array(len);
    
        data[0] = HFM_FILE_TOKEN.charCodeAt(0);
        data[1] = HFM_FILE_TOKEN.charCodeAt(1);
        data[2] = HFM_FILE_TOKEN.charCodeAt(2);
        data[3] = flag;
    
        for(let i=4; i<len; i++) data[i] = srcData[i-4];
    
        var blob = new Blob([data],{type: "text/plain;charset=utf-8"});
        saveAs(blob, "file.txt");
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
        for(let i = 0;i<SNUM_MAX;i++) hfmTree[i].w = miniFrq[i];

        hfmTree[HEAD].p = -1;
        hfmTree[HEAD].w = SNUM_MAX;
    }
    function initHfmTree2(){
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
        // console.log(hfmTree);
    }
    function Select(s1,s2){
        let i;
        const num = hfmTree[HEAD].w;
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
            let str1 = str.reverse();//反转字符串
            let str2 = str1.join("");

            // hfmCode[i]=('0000000'+str2).slice(-8);
            // hfmCode[i] = '0b'+str2;
            // hfmCode[i] = Number(hfmCode[i]);
            hfmCode[i]=str2;
        }
        PrintHfmCode();
    }
    function WriteHfmFile(content)
    {
        var buf = 0x00;
        const mask = 0x80;
        var leng=0;
        var lth = WriteHfmHeadFile(content);
        for(var i =0;i<srcData.length;i++){	
		    for(var j=0; j<hfmCode[srcData[i]].length; j++)
		    {
			    if(hfmCode[srcData[i]][j] == '1')	buf |= mask >> leng;
			    if(leng == (CHAR_BIT - 1))
			    {   
                    content[lth++]=buf;
                    leng = -1;    
				    buf = 0x00;
			    }
                leng++;
            }
        }
        content=content.slice(0,lth);
        var blob = new Blob([content],{type: "text/plain;charset=utf-8"});
        saveAs(blob, "file.txt");
    }
    function WriteHfmHeadFile(content){
        var secNum = 0;
        var flag = 0X00;

        content[0] = HFM_FILE_TOKEN.charCodeAt(0);
        content[1] = HFM_FILE_TOKEN.charCodeAt(1);
        content[2] = HFM_FILE_TOKEN.charCodeAt(2);

	    if((secNum = SuitRunLen()) != 0)
	    {
		    flag = 0X40;			// 第8位置0，代表对信源文件进行压缩
								    // 第7位置1，代表采用行程方式存储频次
            content[3]=flag;
            console.log("用行程方式存储");          
		    var lth = SaveFrqRunLen(secNum,content);
	    }
	    else
	    {
		    flag = 0x00;			// 第8位置0，代表对信源文件进行压缩
								// 第7位置0，代表采用顺序方式存储频次
            content[3] = flag;
            console.log("顺序存储");
		    SaveFrqSerial(content);
        }
        return lth;
    }
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
        return(((totalLen + secNum * 2)< SNUM_MAX) ? secNum : 0);

    }
    function SaveFrqRunLen(secNum,content)
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
        // 保存行程段的数量
        content[4]=secNum;
        i = 5;
        
	    while((p2 = strstr(p1, SPAN)) != -1)
	    {   
            // 保存行程段的起始位置
            var site = strFrq.length-p1.length;
            console.log(site);
            content[i++] = site;
			// 保存行程段的长度
            var pp=p1.length-p2.length;
            content[i++]=pp;
		    // 保存行程段中的频次值
		    while(pp--)	{
                content[i++]=miniFrq[site++];
            }
            if((p1 = strstr(p2, "1")) == -1)	break;          
	    }

	    if(p1 != -1)
	    {
		    if(p1[0] == '1')
		    {

                // 保存行程段的起始位置
                content[i++]=strFrq.length-p1.length;
			    // 保存行程段的长度
                content[i++]=p1.length-p2.length;

                var j= 0;
                var sp=strFrq.length-p1.length;
                console.log(sp);
			    while((p1[j++]) != undefined)
			    {
                    content[i++]=miniFrq[sp++];                   
			    }
		    }
        }
        // console.log(data);
        return i;
    }
    function SaveFrqSerial(content,len)    {
        for(let i=4; i<len; i++) content[i] = srcData[i-4];
    }
    function ReadFrq(data,flag){
	    var i,secNum, len;
	    // long *p = NULL;							// 频次数组操作指针
	    const mask = 0x40;					// 取FLAG字段的第六位
	    var total = 0;
        var m,k=5;
        if((flag & mask) == mask){  				// 行程模式读取频次表
		    secNum = data[4];
		    for(i=0; i<secNum; i++){
                m=data[k++];
                len=data[k];
                k++;
                for(var j=0;j<len;j++) miniFrq[m++]=data[k++];
            }
            // console.log(miniFrq);
	    }
	    else{									// 顺序模式读取频次表
		    for(i=0; i<SNUM_MAX; i++)		miniFrq[i] = data[k++];
	    }
	
	    // 检验频次读取是否正确。频次不能为负，所有频次不能为0。
	    for(i=0; i<SNUM_MAX; i++){
		    if(miniFrq[i] < 0){
			    printf("ERROR: 原文件格式不正确或者已损坏！\n");
			    return(0);
		    }
		    total += miniFrq[i];
	    }
	    if(total == 0){
		    printf("ERROR: 原文件格式不正确或者已损坏！\n");
		    return(0);
	    }
	    return(1);
    }
    function DecodeFile(data,lth){
        var text="";
        const mask=0X80;
        const LFour=0x0f;
        var pos=hfmTree[HEAD].w-1;
        var node=hfmTree[hfmTree[HEAD].w - 1];
        var len=data[3]&LFour;
        for(;lth<data.length-1;){
            ch=data[lth++];
            for(let j=0;j<CHAR_BIT;j++){
                bit = ch&(mask>>j);
                pos=(bit==0X00)?node.r:node.l;
                node=hfmTree[pos];
                if((node.l==0)
                 &&(node.r==0)
                 &&(node.p!=0)){
                    text +=String.fromCharCode(pos);
                    node=hfmTree[hfmTree[HEAD].w - 1]
                 }
            }
        }
        ch  = data[data.length-1];
	    len = (len == 0) ? CHAR_BIT : len;
	    for(i=0; i<len; i++){
		    bit = ch & (mask >> i);
		    pos=(bit==0X00)?node.r:node.l;
            node=hfmTree[pos];
            if((node.l==0)
             &&(node.r==0)
             &&(node.p!=0)){
                text +=String.fromCharCode(pos);
                node=hfmTree[hfmTree[HEAD].w - 1]
            }
        }
        // var txt=new Uint8Array(text.length);
        // for(let i=0;i<text.length;i++){
        //     txt[i]=text.charAt(i);
        // }
        // let utf8decoder = new TextDecoder();
        // console.log(utf8decoder.decode(txt));
        var blob = new Blob([utf8decoder.decode(text)],{type: "text/plain;charset=utf-8"});
        saveAs(blob, "file.txt");
    }

    function printf(data){
        $output.append(data);
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
    function PrintHfmCode(){
        let i, num = 0;
	    let avgLen = 0;

	    printf("码字：\n");
	    printf("xi\tpos\tfreq\tlen\tCode\n");
	    printf("---------------------------------------------\n");
	    for(i=0; i<SNUM_MAX; i++)
	    {
		    if(miniFrq[i] != 0)
		    {
			    num++;
			    avgLen += p[i] * (hfmCode[i].length);
			    printf(`x${num}\t${i}\t${miniFrq[i]}\t${(hfmCode[i].length)}\t${hfmCode[i]}\n`);
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
		    if(miniFrq[i]!=0)	H += -p[i] * Math.log10(p[i]) * LB10;
	    }

	    return(H);
    }
    function strstr(strFrq,index){
        index = strFrq.indexOf(index);
        if(index==-1){
            return -1;
        }
        strFrq = strFrq.substring(index);
        // console.log(strFrq)
        return strFrq;
    }


    function compress(data,output){
        $output = output;
        // let encoder = new TextEncoder();
        // let data= encoder.encode(data);
        initData(data);
        statFreq();
        infoSrcAnalyze();

        let h       = entropy(p),
          flenSrc = srcData.length;
    
        let notNeedCompress = (flenSrc - flenSrc * h / CHAR_BIT) < storeCost();
    
        if(notNeedCompress) {
            wrapSrcFile();
            console.log("无需压缩");
            return;
        }

        if(scaleFreq()) scaledInfoSrcAnalyze();

        if(scaleFreq()){
            initHfmTree();
            GenHfmTree();
            console.log(hfmTree);
            GenHfmCode();
            const len = HFM_FILE_TOKEN.length + 1 + srcData.length+256;
            var content = new Uint8Array(len);
            WriteHfmFile(content);
        }else{
            initHfmTree2();
            GenHfmTree();
            console.log(hfmTree);
            GenHfmCode();
            const len = HFM_FILE_TOKEN.length + 1 + srcData.length+256;
            var content = new Uint8Array(len);
            miniFrq=freq;
            WriteHfmFile(content);
        }  
    }
    function decompress(data,output){
        $output = output;
        console.log("解压缩");
        var ch = 0;
	    const mask  = 0x80;				// 取最高位的掩码
	    const HFour = 0xf0;				// 取高4位的掩码

	    ch = data[3];						// 读取FLAG字段
	    // 对FLAG 字段进行合法性校验，参考设计文档
	    if(((ch & HFour) != 0x80)
		    && ((ch & HFour) != 0x40) 
		    && ((ch & HFour) != 0x00))
	    {
            console.log("压缩格式不正确");
            return;
        }
        if((ch & mask) == mask){				// 信源文件没有被压缩
            var container = '';
            for(var i=0;i<data.length;i++){
                container+=String.fromCharCode(data[i]);
            }		
            var blob = new Blob([text],{type: "text/plain;charset=utf-8"});
            saveAs(blob, "file.txt");
		    return;
	    }
        initData(data);
        if(ReadFrq(data,ch) == 0){				// 频次读取错误的处理{
            console.log("文件错误！");
            return;
        }
        var lth=5;
        for(var j = 0;j<data[4];j++){
            lth++;//6:2
            lth=lth+data[lth];//8
            lth++;//9
        }
        scaledInfoSrcAnalyze();
        initHfmTree();
        GenHfmTree();
        GenHfmCode();
        DecodeFile(data,lth); 
        
    }
    

    return { compress, decompress };
})();