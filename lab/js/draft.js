// function SuitRunLen()
// {
// 	var	  i;
// 	var	  secNum	= 0;		// 行程段的数量
// 	var	  totalLen	= 0;		// 行程段中频次的总数量
// 	const SPAN		= "000";	// 行程段与段之间的间隙
// 	var	  strFrq    = new Array(SNUM_MAX+1);		// 频次字符串
// 	var	  p1 = NULL, p2  = NULL;	// 操作频次字符串的指针

// 	// 初始化频次字符串
// 	for(i=0; i<SNUM_MAX; i++)	strFrq[i] = (frequence[i]==0) ? '0':'1';//频次为0则为0；频次不为0则为1

//     //#ifdef _DEBUG
// 	printf("频次表的行程分析：\nstart\tlen\tfreq\n");
// 	printf("---------------------------------------------");
//     //#endif

//     // p1 = strstr(strFrq, "1");
//     var index = 0;
//     for(let i = 0;i<strFrq.length;i++){
//         if(strFrq[i]==0) index = i;
//     }
//     p1 = strFrq.substring(index);
//     /*
//     var haystack = 'cndfreofgnerjknvfjzpcndoshgirenj';
//     var needle   = 'jzp';
//     var hayLen   = haystack.length;
//     var nedLen   = needle.length;
//     for (let index = 0; index <= hayLen - nedLen; index++) {
//         if (haystack[index] !== needle[0]) {
//         continue;
//         }
//         if (haystack.substring(index, index + nedLen) === needle) {
//         console.log(index);
//         }
//     }*/
// 	while((p2 = strstr(p1, SPAN)) != NULL)
// 	{
// 		secNum++;
// 		totalLen += p2 - p1;

//     // #ifdef _DEBUG
// 		printf("\n%0.2X\t%d    ", p1-strFrq, p2-p1);
// 		while(p1<p2)	printf("%5d", frequence[(p1++)-strFrq]);
//     // #endif
		
// 		if((p1 = strstr(p2, "1")) == NULL) break;
// 	}
	
// 	if(p1 != NULL)
// 	{
// 		if(*p1 == '1')
// 		{
// 			secNum++;
// 			while(*(p1++) != EOS) totalLen++;
// 		}
// 	}

// #ifdef _DEBUG
// 	printf("\n---------------------------------------------\n");
// 	printf("行程段数：\t%d\n频次总数：\t%d", secNum, totalLen);
// #endif

// 	return(((totalLen + secNum * 2)< SNUM_MAX) ? secNum : 0);
// }

/*
var haystack = 'cndfreofgnerjknvfjzpcndoshgirenj';
var needle   = 'jzp';
var hayLen   = haystack.length;
var nedLen   = needle.length;
for (let index = 0; index <= hayLen - nedLen; index++) {
    if (haystack[index] !== needle[0]) {
      continue;
    }
    if (haystack.substring(index, index + nedLen) === needle) {
      console.log(index);
    }
  }
*/

var strFrq = '0001000101010101001110011';
var index = 0;
for(let i = 0;i<strFrq.length&&index==0;i++){
    if(strFrq[i]==1) index = i;
}
var p1 = strFrq.substring(index);
console.log(p1);