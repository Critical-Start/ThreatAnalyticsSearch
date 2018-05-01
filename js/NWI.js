function initialiseNWI()
{
	document.getElementById("linkNWISecurityAnalytics").addEventListener("click", function(){showpage(5);}, false);
	document.getElementById("formNWIConfigOptions").addEventListener("submit", function(e){save_NWI(); e.preventDefault();}, false);
	document.getElementById("buttonNWIAddNewQuery").addEventListener("click", function(){add_NWIQuery();}, false);
	document.getElementById("buttonNWISaveQueries").addEventListener("click", function(){save_NWI();}, false);
	document.getElementById("NWIConfigExampleLink").addEventListener("change", function(){autofill_NWIConfig();}, false);
}
function parseConfigDataNWI(newData)
{
	var NWI = newData.NWI;
	if(NWI)
	{
		if(NWI.Config)
			setItem("_NWIConfig", JSON.stringify(NWI.Config));
		if(NWI.Queries)
			setItem("_NWIallquery", JSON.stringify(NWI.Queries));
	}
}

function restore_optionsNWI(exportValue)
{
    //Restore Queries
    var queryList = document.getElementById("NWIqueries_list_ul");
	queryList.innerHTML = "";

    var parsedArray = exportValue.NWI.Queries;
	for(var i=0;i<parsedArray.length;i++)
	{
		add_itemNWI();
	}
	for(var i=0;i<parsedArray.length;i++)
	{
		document.getElementById("NWIlistItemName"+i).value = parsedArray[i][1];
		document.getElementById("NWIlistItemQuery"+i).value = parsedArray[i][2];
		if(parsedArray[i][3]) document.getElementById("NWIlistItemEnab"+i).checked = true;
		document.getElementById("NWIlistItemRemoveButton"+i).onclick = function(e){removeNWI(e.target.id.charAt(e.target.id.length-1));};
	}
    
    //Restore Query Config
    document.getElementById("NWIConfigEnable").checked = exportValue.NWI.Config.NWIConfigEnable || false;
    document.getElementById("NWIConfigPopup").checked = exportValue.NWI.Config.NWIConfigPopup || false;
	document.getElementById("NWIConfigGMT").checked = exportValue.NWI.Config.NWIConfigGMT || false;
	document.getElementById("NWIConfigHost").value = exportValue.NWI.Config.NWIConfigHost || "";
	document.getElementById("NWIConfigPort").value = exportValue.NWI.Config.NWIConfigPort || "";
	document.getElementById("NWIConfigCollectionName").value = exportValue.NWI.Config.NWIConfigCollectionName || "";
	document.getElementById("NWIConfigRange1").value = exportValue.NWI.Config.NWIConfigRange1 || "";
	document.getElementById("NWIConfigRange2").value = exportValue.NWI.Config.NWIConfigRange2 || "";
	document.getElementById("NWIConfigRange3").value = exportValue.NWI.Config.NWIConfigRange3 || "";
	document.getElementById("NWIConfigRange4").value = exportValue.NWI.Config.NWIConfigRange4 || "";
}

function add_itemNWI()
{
	var queryList = document.getElementById("NWIqueries_list_ul");
	var curnum = queryList.childElementCount;
	
	var appendListHTML = "<li index='"+curnum+"' id='NWIlistItem"+curnum+"'>\
							<div align='center'>\
							<div class='dragIcon'></div>\
							<input type='text' class='NWIlistItemName' id='NWIlistItemName"+curnum+"' size='20' maxlength='30'>\
							<input type='text' class='NWIlistItemLink' id='NWIlistItemQuery"+curnum+"' size='80' maxlength='200'>\
							<input type='checkbox' class='NWIcheckStyle' id='NWIlistItemEnab"+curnum+"'>\
							<button class='NWIremoveButtonStyle' id='NWIlistItemRemoveButton"+curnum+"'>X</button>\
							</div></li>"
	document.getElementById("NWIqueries_list_ul").innerHTML += appendListHTML;
}

function removeNWI(j)
{
	var listOfQueries = document.getElementById("NWIqueries_list_ul");
	var queryToRemove = document.getElementById("NWIlistItem"+j);
	listOfQueries.removeChild(queryToRemove);
}

function save_NWI()
{
	save_NWIconfigoptions();
	save_NWIQuery();
	restore_options();
	chrome.extension.getBackgroundPage().updatemenu();
}
function save_NWIconfigoptions()
{
    var NWIConfig = {};
	NWIConfig.NWIConfigEnable = document.getElementById("NWIConfigEnable").checked;
	NWIConfig.NWIConfigPopup = document.getElementById("NWIConfigPopup").checked;
	NWIConfig.NWIConfigGMT = document.getElementById("NWIConfigGMT").checked;
	NWIConfig.NWIConfigHost = document.getElementById("NWIConfigHost").value;
	NWIConfig.NWIConfigPort = document.getElementById("NWIConfigPort").value;
	NWIConfig.NWIConfigCollectionName = document.getElementById("NWIConfigCollectionName").value;
	NWIConfig.NWIConfigRange1 = document.getElementById("NWIConfigRange1").value;
	NWIConfig.NWIConfigRange2 = document.getElementById("NWIConfigRange2").value;
	NWIConfig.NWIConfigRange3 = document.getElementById("NWIConfigRange3").value;
	NWIConfig.NWIConfigRange4 = document.getElementById("NWIConfigRange4").value;
	
	setItem("_NWIConfig", JSON.stringify(NWIConfig));
	
	var status = document.getElementById("status_NWIConfigOptions");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}


function add_NWIQuery()
{
	var nname = document.getElementById("NWINewName").value;
	var nquery = document.getElementById("NWINewQuery").value;

	var stringified = getItem("_NWIallquery");
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
	setItem("_NWIallquery", newstring);

	restore_options();

	document.getElementById("NWINewName").value = "";
	document.getElementById("NWINewQuery").value = "";
	var status = document.getElementById("statusNWIAddQuery");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}


function save_NWIQuery() 
{
	var queryList = document.getElementById("NWIqueries_list_ul");
	var maxindex = queryList.childElementCount;
	var _all = new Array(maxindex);
	
	for(var i=0; i<maxindex;i++)
	{
		curnum = queryList.children[i].getAttribute('index');
		_all[i] = new Array(4);
		_all[i][0] = "-1";
		_all[i][1] = document.getElementById("NWIlistItemName"+curnum).value;
		_all[i][2] = document.getElementById("NWIlistItemQuery"+curnum).value;
		_all[i][3] = document.getElementById("NWIlistItemEnab"+curnum).checked;
		//alert(_all[i][3]);
	}
	
	//alert(_all);
	var stringified = JSON.stringify(_all);
	setItem("_NWIallquery", stringified);
	
	var status = document.getElementById("statusNWIsaveQueries");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}




function autofill_NWIConfig()
{
	var link = document.getElementById("NWIConfigExampleLink").value;
	if(!link)
		return;
	var temp = link.match(/:\/\/([^:\/?]*)(:(\d+)|[\/?])/);
	var hostname = temp ? ( temp[1] ? temp[1] : "") : "";
	var port = temp ? (temp[3] ? temp[3] : "") : "";
	temp = link.match(/collection=([^&]*)/);
	var collectionName = temp ? (temp[1] ? temp[1] : "" ) : "";
	
	var enableField = document.getElementById("NWIConfigEnable");
	var hostnameField = document.getElementById("NWIConfigHost");
	var portField = document.getElementById("NWIConfigPort");
	var collectionNameField = document.getElementById("NWIConfigCollectionName");
	
	enableField.checked = true;
	hostnameField.value = hostname;
	portField.value = port;
	collectionNameField.value = collectionName;
	
}