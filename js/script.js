/*jshint unused:false*/
/*jshint strict:false*/
/*globals await*/
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js').then(function(response) {
		console.log('ServiceWorker Registered Successfully');
	}).catch(function(err) {
		console.log('ServiceWorker Registration Failed : ' + err);
	});
}
var key="ebc7ec7a3995b086924028b698bd51f7";
var USD=0;
var USD_to_XYZ=[];
var currencyFullDetail=[];
var selectTo=document.getElementById("select_to");
var selectFrom=document.getElementById("select_from");
var inputTo=document.getElementById("input_to");
var inputFrom=document.getElementById("input_from");
var fromHeading=document.getElementById("to_head");
var toHeading=document.getElementById("from_head");
var chart=document.getElementById("chart");
var chartTime="5Y";
var isReady=false;
var isfetchDone=false;
fetchAsync("https://openexchangerates.org/api/currencies.json").then(function(data) {
	currencyFullDetail=data;
	currencyFullDetail["BYR"]="Belarusian Ruble";
	currencyFullDetail["LTL"]="Lithuanian Litas";
	currencyFullDetail["LVL"]="Latvian Lats";
	currencyFullDetail["ZMK"]="Zambian Kwacha";
	isfetchDone=true;
}).catch(function(reason) {
	console.log(reason.message);
});
fetchAsync("http://www.apilayer.net/api/live?access_key=" + key + "&format=1").then(function(data) {
	var intial=setInterval(function(){
		if ( isfetchDone ) {  
			clearInterval(intial);
			fillSelectBox(data.quotes);
		} 
	},300);
}).catch(function(reason) {
	console.log(reason.message);
});
function fillSelectBox(data){
	USD_to_XYZ=[];
	Object.keys(data).forEach(function (key) {
		var opt='<option value="'+key.slice(3)+'">'+CurrencyName(key.slice(3))+'</option>';
		selectTo.innerHTML+=opt;
		selectFrom.innerHTML+=opt;
		USD_to_XYZ[key.slice(3)]=data[key];
	});
	selectFrom.value="USD";
	selectTo.value="PKR";
	inputFrom.value=1;
	isReady=true;
}
$(document).ready(function(e) {
	$(".chartTime").on("click", function(){
		$(".chartTime").each(function(index, element) {
            $(element).removeClass("active");
        });
		$(this).addClass("active");
		chartTime=$(this).attr("val");
		loadChart();
	});
	$(selectTo).add(selectFrom).add(inputTo).add(inputFrom).on("change", function(){
		var toVal=inputTo;
		var fromVal=inputFrom;
		var toType=selectTo;
		var fromType=selectFrom;
		fromHeading.innerHTML="1 "+CurrencyName(fromType.value);
		toHeading.innerHTML=roundVal((1/USD_to_XYZ[fromType.value])*USD_to_XYZ[toType.value],4)+" "+CurrencyName(toType.value);
		loadChart();
		if(this === inputTo && toVal.value != ""){
			toVal=inputFrom;
			fromVal=inputTo;
			toType=selectFrom;
			fromType=selectTo;
		} 
		var val=((1/USD_to_XYZ[fromType.value])*fromVal.value*USD_to_XYZ[toType.value]);
		toVal.value=roundVal(val,4);
	});
	var intial=setInterval(function(){
		if ( isReady ) {  
			$(inputFrom).change();
			clearInterval(intial);
		} 
	},300);
});
function CurrencyName(key){
	return (currencyFullDetail[key]==undefined ? key : currencyFullDetail[key]);
}
function loadChart(){
	chart.innerHTML='<img src="https://www.google.com/finance/chart?q=CURRENCY:'+selectFrom.value+selectTo.value+'&chst=vkc&tkr=1&chsc=1&chs=252x94&p='+chartTime+'">';
}
function roundVal(val, i){
	var t=i;
	for(k=0; k<10; k++){
		if(i==0)
			break;
		var temp=val.toFixed(i).toString();
		if(temp[temp.length-1]==0)
			i--;
		else{
			if(i==2+(t-4))
				break;
			if(i==4+(t-4)){
				if(temp[temp.length-2]==0)
					i--;
				else if((temp[temp.length-3]!=0 && temp[temp.length-4]!=0) || (temp[temp.length-3]==0 && temp[temp.length-4]!=0)){
					i=2+(t-4);
					break;
				} else if(temp[temp.length-3]!=0 && temp[temp.length-4]==0){
					i=3+(t-4);
					break;
				}
			} else if(i==3+(t-4)){
				if(temp[temp.length-2]==0 || temp[temp.length-3]!=0){
					i--;
					break;
				} if(temp[temp.length-3]!=0 && temp[temp.length-2]!=0 && temp[temp.length-1]!=0){
					i--;
					break;
				}
			} else {
				break
			}
		}
	}
	if(val.toFixed(i)==0)
		return roundVal(val, t+4);
	return val.toFixed(i);
}
async function fetchAsync (url) {
  var response = await fetch(url);
  var data = await response.json();
  return data;
}
