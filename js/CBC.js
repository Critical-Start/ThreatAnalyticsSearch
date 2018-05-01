function initialiseCBC()
{
	document.getElementById("linkCBCSecurityAnalytics").addEventListener("click", function(){showpage(6);}, false);
	document.getElementById("formCBCConfigOptions").addEventListener("submit", function(e){save_CBC(); e.preventDefault();}, false);
	document.getElementById("buttonCBCAddNewQuery").addEventListener("click", function(){add_CBCQuery();}, false);
	document.getElementById("buttonCBCSaveQueries").addEventListener("click", function(){save_CBC();}, false);
}
function parseConfigDataCBC(newData)
{
	var CBC = newData.CBC;
	if(CBC)
	{
		if(CBC.Config)
			setItem("_CBCConfig", JSON.stringify(CBC.Config));
		if(CBC.Queries)
			setItem("_CBCallquery", JSON.stringify(CBC.Queries));
	}
}

function restore_optionsCBC(exportValue)
{
    //Restore Queries
    var queryList = document.getElementById("CBCqueries_list_ul");
	queryList.innerHTML = "";

    var parsedArray = exportValue.CBC.Queries;
	for(var i=0;i<parsedArray.length;i++)
	{
		add_itemCBC();
	}
	for(var i=0;i<parsedArray.length;i++)
	{
		document.getElementById("CBClistItemName"+i).value = parsedArray[i][1];
		document.getElementById("CBClistItemQuery"+i).value = parsedArray[i][2];
		if(parsedArray[i][3]) document.getElementById("CBClistItemEnab"+i).checked = true;
		document.getElementById("CBClistItemRemoveButton"+i).onclick = function(e){removeCBC(e.target.id.charAt(e.target.id.length-1));};
	}
    
    //Restore Query Config
    document.getElementById("CBCConfigEnable").checked = exportValue.CBC.Config.CBCConfigEnable || false;
    document.getElementById("CBCConfigPopup").checked = exportValue.CBC.Config.CBCConfigPopup || false;
	document.getElementById("CBCConfigUseHttps").checked = exportValue.CBC.Config.CBCConfigUseHttps || false;
	document.getElementById("CBCConfigNewTab").checked = exportValue.CBC.Config.CBCConfigNewTab || false;
	document.getElementById("CBCConfigHost").value = exportValue.CBC.Config.CBCConfigHost || "";
	document.getElementById("CBCConfigPort").value = exportValue.CBC.Config.CBCConfigPort || "";
	document.getElementById("CBCConfigURLVersion").value = exportValue.CBC.Config.CBCConfigURLVersion || "";
}

function add_itemCBC()
{
	var queryList = document.getElementById("CBCqueries_list_ul");
	var curnum = queryList.childElementCount;
	
	var appendListHTML = "<li index='"+curnum+"' id='CBClistItem"+curnum+"'>\
							<div align='center'>\
							<div class='dragIcon'></div>\
							<input type='text' class='CBClistItemName' id='CBClistItemName"+curnum+"' size='20' maxlength='30'>\
							<input type='text' class='CBClistItemLink' id='CBClistItemQuery"+curnum+"' size='80' maxlength='200'>\
							<input type='checkbox' class='CBCcheckStyle' id='CBClistItemEnab"+curnum+"'>\
							<button class='CBCremoveButtonStyle' id='CBClistItemRemoveButton"+curnum+"'>X</button>\
							</div></li>"
	document.getElementById("CBCqueries_list_ul").innerHTML += appendListHTML;
}

function removeCBC(j)
{
	var listOfQueries = document.getElementById("CBCqueries_list_ul");
	var queryToRemove = document.getElementById("CBClistItem"+j);
	listOfQueries.removeChild(queryToRemove);
}

function save_CBC()
{
	save_CBCconfigoptions();
	save_CBCQuery();
	restore_options();
	chrome.extension.getBackgroundPage().updatemenu();
}

function save_CBCconfigoptions()
{
    var CBCConfig = {};
	CBCConfig.CBCConfigEnable = document.getElementById("CBCConfigEnable").checked;
	CBCConfig.CBCConfigPopup = document.getElementById("CBCConfigPopup").checked;
	CBCConfig.CBCConfigUseHttps = document.getElementById("CBCConfigUseHttps").checked;
	CBCConfig.CBCConfigNewTab = document.getElementById("CBCConfigNewTab").checked;
	CBCConfig.CBCConfigHost = document.getElementById("CBCConfigHost").value;
	CBCConfig.CBCConfigPort = document.getElementById("CBCConfigPort").value;
	CBCConfig.CBCConfigURLVersion = document.getElementById("CBCConfigURLVersion").value;

	setItem("_CBCConfig", JSON.stringify(CBCConfig));
	
	var status = document.getElementById("status_CBCConfigOptions");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}


function add_CBCQuery()
{
	var nname = document.getElementById("CBCNewName").value;
	var nquery = document.getElementById("CBCNewQuery").value;

	var stringified = getItem("_CBCallquery");
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
	setItem("_CBCallquery", newstring);

	restore_options();

	document.getElementById("CBCNewName").value = "";
	document.getElementById("CBCNewQuery").value = "";
	var status = document.getElementById("statusCBCAddQuery");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}


function save_CBCQuery() 
{
	var queryList = document.getElementById("CBCqueries_list_ul");
	var maxindex = queryList.childElementCount;
	var _all = new Array(maxindex);
	
	for(var i=0; i<maxindex;i++)
	{
		curnum = queryList.children[i].getAttribute('index');
		_all[i] = new Array(4);
		_all[i][0] = "-1";
		_all[i][1] = document.getElementById("CBClistItemName"+curnum).value;
		_all[i][2] = document.getElementById("CBClistItemQuery"+curnum).value;
		_all[i][3] = document.getElementById("CBClistItemEnab"+curnum).checked;
		//alert(_all[i][3]);
	}
	
	//alert(_all);
	var stringified = JSON.stringify(_all);
	setItem("_CBCallquery", stringified);
	
	var status = document.getElementById("statusCBCsaveQueries");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}