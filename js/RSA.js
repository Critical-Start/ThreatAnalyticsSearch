function initialiseRSA()
{
	document.getElementById("linkRSASecurityAnalytics").addEventListener("click", function(){showpage(4);}, false);
	document.getElementById("formRSAConfigOptions").addEventListener("submit", function(e){save_RSA(); e.preventDefault();}, false);
	document.getElementById("buttonRSAAddNewQuery").addEventListener("click", function(){add_RSAQuery();}, false);
	document.getElementById("buttonRSASaveQueries").addEventListener("click", function(){save_RSA();}, false);
	document.getElementById("RSAConfigExampleLink").addEventListener("change", function(){autofill_RSAConfig();}, false);
}
function parseConfigDataRSA(newData)
{
	var RSA = newData.RSA;
	if(RSA)
	{
		if(RSA.Config)
			setItem("_RSAConfig", JSON.stringify(RSA.Config));
		if(RSA.Queries)
			setItem("_RSAallquery", JSON.stringify(RSA.Queries));
	}
}

function restore_optionsRSA(exportValue)
{
    //Restore Queries
    var queryList = document.getElementById("RSAqueries_list_ul");
	queryList.innerHTML = "";

    var parsedArray = exportValue.RSA.Queries;
	for(var i=0;i<parsedArray.length;i++)
	{
		add_itemRSA();
	}
	for(var i=0;i<parsedArray.length;i++)
	{
		document.getElementById("RSAlistItemName"+i).value = parsedArray[i][1];
		document.getElementById("RSAlistItemQuery"+i).value = parsedArray[i][2];
		if(parsedArray[i][3]) document.getElementById("RSAlistItemEnab"+i).checked = true;
		document.getElementById("RSAlistItemRemoveButton"+i).onclick = function(e){removeRSA(e.target.id.charAt(e.target.id.length-1));};
	}
    
    //Restore Query Config
    document.getElementById("RSAConfigEnable").checked = exportValue.RSA.Config.RSAConfigEnable || false;
    document.getElementById("RSAConfigPopup").checked = exportValue.RSA.Config.RSAConfigPopup || false;
	document.getElementById("RSAConfigUseHttps").checked = exportValue.RSA.Config.RSAConfigUseHttps || false;
	document.getElementById("RSAConfigNewTab").checked = exportValue.RSA.Config.RSAConfigNewTab || false;
	document.getElementById("RSAConfigHost").value = exportValue.RSA.Config.RSAConfigHost || "";
	document.getElementById("RSAConfigPort").value = exportValue.RSA.Config.RSAConfigPort || "";
	document.getElementById("RSAConfigDevId").value = exportValue.RSA.Config.RSAConfigDevId || "";
	document.getElementById("RSAConfigRange1").value = exportValue.RSA.Config.RSAConfigRange1 || "";
	document.getElementById("RSAConfigRange2").value = exportValue.RSA.Config.RSAConfigRange2 || "";
	document.getElementById("RSAConfigRange3").value = exportValue.RSA.Config.RSAConfigRange3 || "";
	document.getElementById("RSAConfigRange4").value = exportValue.RSA.Config.RSAConfigRange4 || "";
}

function add_itemRSA()
{
	var queryList = document.getElementById("RSAqueries_list_ul");
	var curnum = queryList.childElementCount;
	
	var appendListHTML = "<li index='"+curnum+"' id='RSAlistItem"+curnum+"'>\
							<div align='center'>\
							<div class='dragIcon'></div>\
							<input type='text' class='RSAlistItemName' id='RSAlistItemName"+curnum+"' size='20' maxlength='30'>\
							<input type='text' class='RSAlistItemLink' id='RSAlistItemQuery"+curnum+"' size='80' maxlength='200'>\
							<input type='checkbox' class='RSAcheckStyle' id='RSAlistItemEnab"+curnum+"'>\
							<button class='RSAremoveButtonStyle' id='RSAlistItemRemoveButton"+curnum+"'>X</button>\
							</div></li>"
	document.getElementById("RSAqueries_list_ul").innerHTML += appendListHTML;
}

function removeRSA(j)
{
	var listOfQueries = document.getElementById("RSAqueries_list_ul");
	var queryToRemove = document.getElementById("RSAlistItem"+j);
	listOfQueries.removeChild(queryToRemove);
}

function save_RSA()
{
	save_RSAconfigoptions();
	save_RSAQuery();
	restore_options();
	chrome.extension.getBackgroundPage().updatemenu();
}

function save_RSAconfigoptions()
{
    var RSAConfig = {};
	RSAConfig.RSAConfigEnable = document.getElementById("RSAConfigEnable").checked;
	RSAConfig.RSAConfigPopup = document.getElementById("RSAConfigPopup").checked;
	RSAConfig.RSAConfigUseHttps = document.getElementById("RSAConfigUseHttps").checked;
	RSAConfig.RSAConfigNewTab = document.getElementById("RSAConfigNewTab").checked;
	RSAConfig.RSAConfigHost = document.getElementById("RSAConfigHost").value;
	RSAConfig.RSAConfigPort = document.getElementById("RSAConfigPort").value;
	RSAConfig.RSAConfigDevId = document.getElementById("RSAConfigDevId").value;
	RSAConfig.RSAConfigRange1 = document.getElementById("RSAConfigRange1").value;
	RSAConfig.RSAConfigRange2 = document.getElementById("RSAConfigRange2").value;
	RSAConfig.RSAConfigRange3 = document.getElementById("RSAConfigRange3").value;
	RSAConfig.RSAConfigRange4 = document.getElementById("RSAConfigRange4").value;
	
	setItem("_RSAConfig", JSON.stringify(RSAConfig));
	
	var status = document.getElementById("status_RSAConfigOptions");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}


function add_RSAQuery()
{
	var nname = document.getElementById("RSANewName").value;
	var nquery = document.getElementById("RSANewQuery").value;

	var stringified = getItem("_RSAallquery");
	var parsedArray = JSON.parse(stringified) || []; //Empty array in case of null returned by parse

	var newoptions = new Array(parsedArray.length+1);
	
	for(var i=0;i<parsedArray.length;i++)
	{
		newoptions[i] = new Array(4);
		newoptions[i] = parsedArray[i].slice(0);
	}
	
	newoptions[i] = new Array(4);
	newoptions[i][0] = "-1";
	newoptions[i][1] = nname;
	newoptions[i][2] = nquery;
	newoptions[i][3] = true; //Enabled by default

	
	var newstring = JSON.stringify(newoptions);
	setItem("_RSAallquery", newstring);

	restore_options();

	document.getElementById("RSANewName").value = "";
	document.getElementById("RSANewQuery").value = "";
	var status = document.getElementById("statusRSAAddQuery");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}


function save_RSAQuery() 
{
	var queryList = document.getElementById("RSAqueries_list_ul");
	var maxindex = queryList.childElementCount;
	var _all = new Array(maxindex);
	
	for(var i=0; i<maxindex;i++)
	{
		curnum = queryList.children[i].getAttribute('index');
		_all[i] = new Array(4);
		_all[i][0] = "-1";
		_all[i][1] = document.getElementById("RSAlistItemName"+curnum).value;
		_all[i][2] = document.getElementById("RSAlistItemQuery"+curnum).value;
		_all[i][3] = document.getElementById("RSAlistItemEnab"+curnum).checked;
		//alert(_all[i][3]);
	}
	
	//alert(_all);
	var stringified = JSON.stringify(_all);
	setItem("_RSAallquery", stringified);
	
	var status = document.getElementById("statusRSAsaveQueries");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}




function autofill_RSAConfig()
{
	var link = document.getElementById("RSAConfigExampleLink").value;
	if(!link)
		return;
	var ssl = link.search(/https:/) == 0 ? true : false;
	var temp = link.match(/:\/\/([^:\/?]*)(:(\d+)|[\/?])/);
	var hostname = temp ? ( temp[1] ? temp[1] : "") : "";
	var port = temp ? (temp[3] ? temp[3] : "") : "";
	temp = link.match(/investigation\/([^\/]*)\//);
	var devId = temp ? (temp[1] ? temp[1] : "" ) : "";
	
	var enableField = document.getElementById("RSAConfigEnable");
	var sslField = document.getElementById("RSAConfigUseHttps");
	var hostnameField = document.getElementById("RSAConfigHost");
	var portField = document.getElementById("RSAConfigPort");
	var devIdField = document.getElementById("RSAConfigDevId");
	
	enableField.checked = true;
	sslField.checked = ssl;
	hostnameField.value = hostname;
	portField.value = port;
	devIdField.value = devId;
	
}