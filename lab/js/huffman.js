/* exported  GetData */
/* global entropy roundFractional redundancy */

// var huffman = (function(){
    function Huffman(data,$output){
        this.SNUM_MAX = 256;
        this.NNUM_MAX = 512;
        this.CHAR_BIT = 8;
        this.LB10     = 3.321928095
        this.srcData  = null;
        this.n        = 0;
        this.scaled   = false;
        this.freq     = new Array(this.SNUM_MAX);
        this.p        = new Array(this.SNUM_MAX);
        this.miniFrq  = new Array(this.SNUM_MAX);
        this.miniP    = new Array(this.SNUM_MAX);
        this.miniTFq  = 0;
        this.hfmTree  = new Array(this.SNUM_MAX);
        this.hfmCode  = new Array(this.SNUM_MAX);
        this.HEAD     = this.NNUM_MAX-1;
        // this.$output  = $output;
    }
    Huffman.prototype.initdata = function initdata(){
        for(var i = 0;i<this.SNUM_MAX;i++){

            this.p[i]      = 0;
            this.freq[i]   = 0;
            this.miniP[i]  = 0;
            this.miniFrq[i]= 0;
            this.hfmCode[i]= '';
        }
        for(var i = 0;i<this.NNUM_MAX;i++){
            this.hfmTree[i]= {l:0,r:0,p:0,w:0};
        }
    }
    Huffman.prototype.statFreq = function statFreq(data){
        this.srcData = data;
        console.log(this.srcData);
        for(let i = 0;i<this.srcData.length;i++){
            this.freq[this.srcData[i]]++;
        }
        this.printFreq();
    }
    Huffman.prototype.printFreq = function printFreq(){
        let num   = 0;
        let total = 0;

        this.printf("信源符号的频次：\n");
        this.printf("xi    value\tfreq\n");
        this.printf("-------------------------\n");
        for(let i = 0; i<this.SNUM_MAX; i++){
            if(this.freq[i]!=0){
                total += this.freq[i];
                this.printf(`x${++num} \t${i}\t${this.freq[i]}\n`);
            }
        }
        this.printf("-------------------------\n");
        this.printf(`频次合计:\t${total}\n\n`);
    }
    Huffman.prototype.printf = function printf(data){
        $output.append(data);
    }

    
    Huffman.prototype.infoSrcAnalyze = function infoSrcAnalyze(){
        var total = this.srcData.length;
        for(var i = 0;i<this.SNUM_MAX;i++){
            if(this.freq[i]===0) continue;
            this.p[i] = roundFractional(this.freq[i] / total, 6);
            ++this.n;
        }
        this.printInfoSrcSum();
    }
    Huffman.prototype.printInfoSrcSum = function printInfoSrcSum(){
        let h   = entropy(this.p),
            num = 0;
        
        this.printf("信源符号的概率分布：\n");
        this.printf("xi    value\tp\n");
        this.printf("-------------------------\n");
        for(let i = 0;i<this.SNUM_MAX;i++){
            if(this.freq[i]!=0) this.printf(`x${++num} \t${i}\t${this.p[i]}\n`)
        }
        this.printf("-------------------------\n");
        this.printf(`熵:\t\t${h} bit\n`);
        this.printf(`剩余度:\t\t${redundancy(h, num)}\n\n`);
    }
    
    Huffman.prototype.scaleFreq = function scaleFreq(){
        let f = 0,max = 0,scale = 0;
        for(let i=0;i<this.SNUM_MAX;i++){
            if(this.freq[i]>max) max = this.freq[i];
        }
        if(max<this.SNUM_MAX) return(false);
        scale = (max / this.SNUM_MAX)+1;
        for(i=0;i<this.SNUM_MAX;i++){
            if(this.freq[i]!=0){
                f = roundFractional(this.freq[i] / scale, 0);
                this.miniFrq[i] = (f==0) ? 1 : f;
            }
        }
        this.printScaleFreq();
        return(scaled=true);
    }
    Huffman.prototype.printScaleFreq = function printScaleFreq(){
        let num = 0;
        let total = 0;

        this.printf("等比例缩小之后信源符号的频次：");
        this.printf("信源符号的频次：\n");
        this.printf("xi    value\tfreq\n");
        this.printf("-------------------------\n");
        for(let i = 0;i<this.SNUM_MAX;i++){
            if(this.freq[i]!=0){
                total += this.miniFrq[i];
                this.printf(`x${++num} \t${i}\t${this.miniFrq[i]}\n`);
            }
        }
        this.printf("-------------------------\n");
        this.printf(`频次合计:\t${total}\n\n`);
    }

    Huffman.prototype.scaledInfoSrcAnalyse = function scaledInfoSrcAnalyse(){
        let total = 0;
        for(let i = 0;i<this.SNUM_MAX;i++){
            total+=this.miniFrq[i];
        }
        for(i=0;i<this.SNUM_MAX;i++){
            this.miniP[i] = roundFractional(this.miniFrq[i] / total,6);
        }
        this.miniTFq = total;
    }
    Huffman.prototype.initHfmTree = function initHfmTree(){
        for(let i = 0;i<this.SNUM_MAX;i++){
            this.hfmTree[i].w = this.miniFrq[i];
            // console.log(this.hfmTree[i].w);
        } 

        this.hfmTree[this.HEAD].p = -1;
        this.hfmTree[this.HEAD].w = this.SNUM_MAX;
        this.PrintHfmTree();
    }
    Huffman.prototype.PrintHfmTree = function PrintHfmTree(){
	    let i, num = 0;

	    this.printf("Huffman树：\n");
	    this.printf("xi\tpos\tweight\tl\tr\tp\n");
	    this.printf("---------------------------------------------\n");
	    for(i=0; i<this.NNUM_MAX; i++)
	    {
		    if(this.hfmTree[i].w != 0)
		    {
			    this.printf(`x${++num}\t${i}\t${this.hfmTree[i].w}\t${this.hfmTree[i].l}\t${this.hfmTree[i].r}\t${this.hfmTree[i].p}\n`);
		    }
	    }
	    this.printf("---------------------------------------------\n\n");
    }
    Huffman.prototype.GenhfmTree = function GenhfmTree(){
        let s1=0,s2=0,s3=0;
        while(this.Select(s1,s2).a){
            s1 = this.Select(s1,s2).s1;
            s2 = this.Select(s1,s2).s2;
            // console.assert(this.hfmTree[this.HEAD].w<this.NNUM_MAX,"头节点不合法！");
            if(this.hfmTree[this.HEAD].w>this.NNUM_MAX) break;
            s3 = this.hfmTree[this.HEAD].w++;
            // console.log("s3为： "+s3);
            // console.log("s1和s2分别为："+s1+'  '+s2);
            // console.log(s1);
            this.hfmTree[s3].l = s1;
            this.hfmTree[s3].r = s2;
            this.hfmTree[s3].w = this.hfmTree[s1].w + this.hfmTree[s2].w;

            this.hfmTree[s1].p = s3;
            this.hfmTree[s2].p = s3;
        }
        this.PrintHfmTree();
    }
    Huffman.prototype.Select = function Select(s1,s2){
        let i;
        const num = this.hfmTree[this.HEAD].w;
        // if(num>this.NNUM_MAX) return 0;//判断hfmTree[HEAD]是不是已经是最后一个父节点了
        let MinWeight = Number.MAX_SAFE_INTEGER;

        s1 = s2 = this.HEAD;
        for(i=0;i<num;i++){
            if((this.hfmTree[i].w<MinWeight)&&(this.hfmTree[i].w!=0)&&(this.hfmTree[i].p==0)){
                MinWeight = this.hfmTree[i].w;
                s1 = i;
            }
        }

        MinWeight = Number.MAX_SAFE_INTEGER;
        for(i = 0;i<num;i++){
            if((this.hfmTree[i].w<MinWeight)&&(this.hfmTree[i].w!=0)&&(this.hfmTree[i].p==0) &&(i!=s1)){         	
                MinWeight = this.hfmTree[i].w;
                s2 = i;
            }
        }
        // console.log("s1和s2分别为："+s1+'  '+s2);
        let a = (((s2 == this.HEAD) && (s1 == num-1))||(s1==s2)) ? 0 : 1
        return{
            a:a,
            s1:s1,
            s2:s2
        };

    }
    Huffman.prototype.compress = function compress(data,output){
        console.log(output);
        $output = output;
        this.initdata();
        this.statFreq(data);
        this.infoSrcAnalyze();
        if(this.scaleFreq()) this.scaledInfoSrcAnalyse();

        this.initHfmTree();
        this.GenhfmTree();
        
    }
    var str = '';
    var $output;
    function GetData(data){
        str = data;
        return {
            str:str,

        }
    }
    
    let hh = new Huffman(str);
    // hh.compress(str,output);
    // return {compress:hh.compress};
// })();