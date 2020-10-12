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
        while(Select(s1,s2)!=0){
            console.assert(hfmTree[HEAD].w<NNUM_MAX,"头节点不合法！");
            // if(hfmTree[HEAD].w<NNUM_MAX) 
            s3 = hfmTree[HEAD].w++;
            console.log("s3为： "+s3);
            hfmTree[s3].l = s1;
            hfmTree[s3].r = s2;
            hfmTree[s3].w = hfmTree[s1].w + hfmTree[s2].w;

            hfmTree[s1].p = s3;
            hfmTree[s2].p = s3;

            hfmTree = {
                
            }
            // console.log(hfmTree[s3]);
        }
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
        console.log("s1和s2分别为："+s1+'  '+s2);
        return(((s2 == HEAD) && (s1 == num-1)) ? 0 : 1);

    }

    function compress(data,output){
        $output = output;

        initData(data);
        statFreq();
        infoSrcAnalyze();

        if(scaleFreq()) scaledInfoSrcAnalyze();

        initHfmTree();
        GenHfmTree();
        console.log(this.hfmTree);
    }

    return { compress, decompress };
})();