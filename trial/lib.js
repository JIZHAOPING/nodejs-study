
//module.exports.roundFractional=(x,n)=>Math.round(x*Math.pow(10,n))/Math.pow(10,n);

function roundFractional(x,n){
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}
module.exports = roundFractional;
