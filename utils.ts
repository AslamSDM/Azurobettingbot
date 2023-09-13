function chunkArray(array:any[], size:number) {
    const result:any = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
  function formatDate(timestamp:any) {
    let date = new Date(Number(timestamp) * 1000);
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes.substr(-2);
}
function padString(str: string, length: number, char: string = ' '): string {
  let totalPadding = length - str.length;
  if (totalPadding < 0) {
      return str;
  }
  let leftPadding = Math.floor(totalPadding / 2);
  let rightPadding = totalPadding - leftPadding;
  return char.repeat(leftPadding) + str + char.repeat(rightPadding);
}
  
  export{chunkArray,formatDate,padString}