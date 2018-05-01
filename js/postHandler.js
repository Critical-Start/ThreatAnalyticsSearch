$(document).ready(function(){ 
	init();
});

function init() {
	var matches = location.href.match(/postHandler.html\?name=(.*)&data=(.*)/);
	var name = matches[1];
	name = decodeURIComponent(name);
	var selectionText = matches[2];
	selectionText = decodeURIComponent(selectionText);
	var searchstring = getItem("_allsearch");
	_all = JSON.parse(searchstring);
	var itemindex = -1;
	for(var i=0; i<_all.length; i++)
	{
		if(name === _all[i][1])
		{
			//alert(i);
			itemindex = i;
			break;
		}
	}
	var reqData = _all[itemindex][7];
	reqData = reqData.replace(/TESTSEARCH/g, selectionText);
	reqData = reqData.replace(/%s/g, selectionText);

	var targetURL = _all[itemindex][2].replace(/TESTSEARCH/g, selectionText);
	targetURL = targetURL.replace(/%s/g, selectionText);

	if(_all[itemindex][8] === true) {
		var proxyURL = _all[itemindex][9];
		makeProxyRequest(targetURL, reqData, proxyURL);
	} else {
		makeRequest(targetURL, reqData);
	}
}

function makeProxyRequest(targetURL, reqData, proxyURL) {
	$.ajax({
	  type: "POST",
	  url: proxyURL,
	  data: {"url":targetURL, "data": reqData},
	  success : function(responseData) {
		console.log(responseData);
		$('.targetURL').html(targetURL);
		$('.reqData').html(reqData);
		$('.responseData').html(responseData);
	  },
	  error : function(responseData) {
	  	console.log(responseData);
		$('.targetURL').html(targetURL);
		$('.reqData').html(reqData);
		$('.responseData').html("Error in executing POST request");
	  }
	});
}

function makeRequest(targetURL, reqData) {
	$.ajax({
	  type: "POST",
	  url: targetURL,
	  data: reqData,
	  success : function(responseData) {
		console.log(responseData);
		$('.targetURL').html(targetURL);
		$('.reqData').html(reqData);
		$('.responseData').html(responseData);
	  },
	  error : function(responseData) {
	  	console.log(responseData);
		$('.targetURL').html(targetURL);
		$('.reqData').html(reqData);
		$('.responseData').html("Error in executing POST request");
	  }
	});

}
