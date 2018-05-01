
$(document).ready(function(){ 
						   
	$(function() {
		$("#options_list_ul").sortable({ opacity: 0.3, cursor: 'move', update: function() {
			console.log("Reordered");
		}								  
		});
		$("#RSAqueries_list_ul").sortable({ opacity: 0.3, cursor: 'move', update: function() {
			console.log("Reordered Queries");
		}								  
		});
		$("#NWIqueries_list_ul").sortable({ opacity: 0.3, cursor: 'move', update: function() {
			console.log("Reordered Queries");
		}								  
		});		
	});
	

	$('#group1').blur(
        function() {
			var name = $(this)[0].value;
			$(this).attr('title', name);
			if(name.length > 0)
				setItem("_group1Name",name);
			chrome.extension.getBackgroundPage().updatemenu();
			var exportValue = {};
			exportValue.searchproviders = JSON.parse(getItem("_allsearch"));
			exportValue.groups = [["1",getItem("_group1Name")],["2",getItem("_group2Name")], ["3",getItem("_group3Name")]];
			exportValue.config = [getItem("_configUrl"),getItem("_configUseGroups"),getItem("_configEnc"),getItem("_configEncKey"),getItem("_configLastRefresh"),];
			document.getElementById("exporttext").value = JSON.stringify(exportValue);

        });


	$('#group2').blur(
        function() {
 			var name = $(this)[0].value;
			$(this).attr('title', name);
			if(name.length > 0)
				setItem("_group2Name",name);
			chrome.extension.getBackgroundPage().updatemenu();
			var exportValue = {};
			exportValue.searchproviders = JSON.parse(getItem("_allsearch"));
			exportValue.groups = [["1",getItem("_group1Name")],["2",getItem("_group2Name")], ["3",getItem("_group3Name")]];
			exportValue.config = [getItem("_configUrl"),getItem("_configUseGroups"),getItem("_configEnc"),getItem("_configEncKey"),getItem("_configLastRefresh"),];
			document.getElementById("exporttext").value = JSON.stringify(exportValue);
        });
		
	$('#group3').blur(
	function() {
		var name = $(this)[0].value;
		$(this).attr('title', name);
		if(name.length > 0)
			setItem("_group3Name",name);
		chrome.extension.getBackgroundPage().updatemenu();
		var exportValue = {};
		exportValue.searchproviders = JSON.parse(getItem("_allsearch"));
		exportValue.groups = [["1",getItem("_group1Name")],["2",getItem("_group2Name")], ["3",getItem("_group3Name")]];
		exportValue.config = [getItem("_configUrl"),getItem("_configUseGroups"),getItem("_configEnc"),getItem("_configEncKey"),getItem("_configLastRefresh"),];
		document.getElementById("exporttext").value = JSON.stringify(exportValue);
	});
	
	$('#enableGroup3').click(function(){
		var isChecked = $('#enableGroup3').is(':checked');
		if(isChecked) {
			setItem("_enableGroup3","true");
		} else {
			setItem("_enableGroup3","false");
		}
		chrome.extension.getBackgroundPage().updatemenu();
	});
	
	$('#newpost').click(function(){
		var isPost = $('#newpost').is(':checked');
		if(isPost) {
			$('#newpostdata').removeAttr('disabled');
			$('#newpostproxy').removeAttr('disabled');
		} else {
			$('#newpostdata').attr('disabled', 'true');
			$('#newpostproxy').attr('disabled', 'true');
			// $('newpostproxylink').val('');
		}
	});

	$('#newpostproxy').click(function(){
		var isPostProxy = $('#newpostproxy').is(':checked');
		if(isPostProxy) {
			$('#newpostproxylink').removeAttr('disabled');
		} else {
			$('#newpostproxylink').attr('disabled', 'true');
		}
	});

	initialise();
});	

var timeout = 604800000;
function initialise(){
	document.getElementById("linkSearchProviders").addEventListener("click", function(){showpage(1);}, false);
	document.getElementById("linkOtherOptions").addEventListener("click", function(){showpage(2);}, false);
	document.getElementById("linkAbout").addEventListener("click", function(){showpage(3);}, false);
	document.getElementById("buttonAddNewProvider").addEventListener("click", function(){add_option();}, false);
	document.getElementById("buttonSaveConfig").addEventListener("click", function(){save_options();}, false);
	document.getElementById("buttonResetDefault").addEventListener("click", function(){resetdefault();}, false);
	document.getElementById("buttonSaveSearchOptions").addEventListener("click", function(){save_otheroptions();}, false);
	document.getElementById("buttonConfigOptions").addEventListener("click", function(){save_configoptions();}, false);
	document.getElementById("buttonConfigUpdateNow").addEventListener("click", function(){configUpdateNow();}, false);
	document.getElementById("buttonSaveImport").addEventListener("click", function(){save_import();}, false);

	initialiseRSA();	
	initialiseNWI();
	initialiseCBC();
    
	showpage(1);
	restore_options();
}

function showpage(page){
	for(var i=1; i<=6; i++){
		if(i==page) document.getElementById("page"+i).style.display = "block";
		else document.getElementById("page"+i).style.display = "none";
	}	
}


function save_import()
{
	parseConfigData(JSON.parse(document.getElementById("exporttext").value),true);
	var status = document.getElementById("status_import");
	status.innerHTML = "New Configuration Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
	restore_options();
	chrome.extension.getBackgroundPage().updatemenu();
}


function configUpdateNow()
{
	var xmlhttp;
	var url = getItem("_configUrl"); //"js/json.txt";// 
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4)
		{
			if(xmlhttp.status==200)
			{
				try
				{
					var data = xmlhttp.responseText;
					var date = new Date();
					setItem("_configLastRefresh", date.toString());
					var configData = data.replace(/\n\r|\r\n/g,"");
					var encoded = 	getItem("_configEnc");
					if(encoded == "true")
					{
						var k1 = getItem("_configEncKey");
						try
						{
							configData = GibberishAES.dec(configData,k1);
						} catch(e) 
						{
							document.getElementById("configLastRefresh").innerHTML = "Update failed - Decryption Error";
							return;
						}	
					}
					var newData = JSON.parse(configData);
					parseConfigData(newData,false);
					document.getElementById("configLastRefresh").innerHTML = date.toString();
					restore_options();
				} catch(e)
				{
					document.getElementById("configLastRefresh").innerHTML = "Update failed - Invalid File";
				}
			}
			else			
			{
				document.getElementById("configLastRefresh").innerHTML = "Update failed - Invalid URL or File doesn't exist";
			}
		}
	}
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
	if(getItem("_configAutoRefresh") == "true")
		setTimeout(function(){configUpdateNow();},timeout);

}


function parseConfigData(newData,overrideConfig)
{
	var newProviders = newData.searchproviders;
	var stringified = getItem("_allsearch");
	var parsedArray = [];
	if(stringified != "" && stringified != null)
		parsedArray = JSON.parse(stringified);

	var groups = newData.groups;
	if(getItem("_configUseGroups") == "true")
	{
		setItem("_group1Name",groups[0][1]);
		setItem("_group2Name",groups[1][1]);
		if(groups[2]) {
			setItem("_group3Name",groups[2][1]);
		}
	}

	for(var i=0,j=parsedArray.length;i<newProviders.length;i++)
	{
		if(stringified.indexOf(newProviders[i][2]) == -1)
		{
			if(getItem("_configUseGroups") != "true")
				newProviders[i][5] = 0;
			parsedArray[j] = newProviders[i];
			j++;
		}
	}
	
	setItem("_allsearch", JSON.stringify(parsedArray));

	parseConfigDataRSA(newData);
	parseConfigDataNWI(newData);

	if(overrideConfig)
	{
		var config = newData.config[0];
		setItem("_configUrl", config[0]);
		setItem("_configUseGroups", config[1]);
		setItem("_configEnc", config[2]);
		setItem("_configEncKey", config[3]);
		setItem("_configAutoRefresh", config[4]);
	}
	chrome.extension.getBackgroundPage().updatemenu();

}
function save_configoptions()
{
	var configUrl = document.getElementById("configUrl").value;
	var configUseGroups = document.getElementById("configUseGroups").checked;
	var configEnc = document.getElementById("configEnc").checked;
	var configEncKey = document.getElementById("configEncKey").value;
	var configAutoRefresh = document.getElementById("configAutoRefresh").checked;
	
	setItem("_configUrl", configUrl);
	setItem("_configUseGroups", configUseGroups);
	setItem("_configEnc", configEnc);
	setItem("_configEncKey", configEncKey);
	setItem("_configAutoRefresh", configAutoRefresh);
	
	restore_options();
	configUpdateNow();
	
	var status = document.getElementById("status_configoptions");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
	
	chrome.extension.getBackgroundPage().updatemenu();

}

function save_otheroptions() 
{	
	var ask_bg = document.getElementById("ask_bg").checked;
	var ask_next = document.getElementById("ask_next").checked;
	var ask_options = document.getElementById("ask_options").checked;
	var ask_newwindow = document.getElementById("ask_newwindow").checked;
	
	setItem("_askbg", ask_bg);
	setItem("_asknext", ask_next);
	setItem("_asknewwindow", ask_newwindow);
	setItem("_askoptions", ask_options);
	
	var status = document.getElementById("status_otheroptions");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
	
	chrome.extension.getBackgroundPage().updatemenu();
}

function save_options() 
{
	var optionsList = document.getElementById("options_list_ul");
	var maxindex = optionsList.childElementCount;
	var _all = new Array(maxindex);
	
	for(var i=0; i<maxindex;i++)
	{
		curnum = optionsList.children[i].getAttribute('index');
		_all[i] = new Array(6);
		_all[i][0] = "-1";
		_all[i][1] = document.getElementById("listItemName"+curnum).value;
		_all[i][2] = document.getElementById("listItemLink"+curnum).value;
		_all[i][3] = document.getElementById("listItemEnab"+curnum).checked;
		_all[i][4] = (document.getElementById("listItemFromConfig"+curnum).innerHTML == "Y");
		_all[i][5] = document.getElementById("listItemGroup1"+curnum).checked + 2*document.getElementById("listItemGroup2"+curnum).checked +4*document.getElementById("listItemGroup3"+curnum).checked;
		_all[i][6] = ($("#listItemName"+curnum).attr("data-post") === "true");
		_all[i][7] = $("#listItemName"+curnum).attr("data-postdata");
		_all[i][8] = ($("#listItemName"+curnum).attr("data-postproxy") === "true");
		_all[i][9] = $("#listItemName"+curnum).attr("data-postproxylink");
		//alert(_all[i][3]);
	}
	
	//alert(_all);
	var stringified = JSON.stringify(_all);
	setItem("_allsearch", stringified);
	
	var exportValue = getExportValuesFromStorage();
	document.getElementById("exporttext").value = JSON.stringify(exportValue);	
	
	var status = document.getElementById("status");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
	
	chrome.extension.getBackgroundPage().updatemenu();
}

function getExportValuesFromStorage()
{
	var exportValue = {};
	exportValue.searchproviders = JSON.parse(getItem("_allsearch")) || {};
	exportValue.groups = [["1",getItem("_group1Name")],["2",getItem("_group2Name")], ["3",getItem("_group3Name")]];
	exportValue.config = [[getItem("_configUrl"),getItem("_configUseGroups"),getItem("_configEnc"),getItem("_configEncKey"),getItem("_configAutoRefresh")]];
    exportValue.RSA = {"Config":JSON.parse(getItem("_RSAConfig")) || {},"Queries":JSON.parse(getItem("_RSAallquery")) || []};
    exportValue.NWI = {"Config":JSON.parse(getItem("_NWIConfig")) || {},"Queries":JSON.parse(getItem("_NWIallquery")) || []};
    exportValue.CBC = {"Config":JSON.parse(getItem("_CBCConfig")) || {},"Queries":JSON.parse(getItem("_CBCallquery")) || []};
	return exportValue;
}

function restore_options() 
{
	var optionsList = document.getElementById("options_list_ul");
	optionsList.innerHTML = "";

	var exportValue = getExportValuesFromStorage();
	document.getElementById("exporttext").value = JSON.stringify(exportValue);

	var parsedArray = exportValue.searchproviders;
	
	var grp1 = document.getElementById("group1");
	var name1 = getItem("_group1Name");
	grp1.value = name1;
	grp1.setAttribute("title",name1);
	var grp2 = document.getElementById("group2");
	var name2 = getItem("_group2Name");
	grp2.value = name2;
	grp2.setAttribute("title",name2);
	var grp3 = document.getElementById("group3");
	var name3 = getItem("_group3Name") || "Change Me";
	grp3.value = name3;
	grp3.setAttribute("title",name3);
	var enableGroup3 = getItem('_enableGroup3');
	if(enableGroup3==="true") {
		$('#enableGroup3').attr("checked", true);
	} else {
		$('#enableGroup3').attr("checked", false)
	}
	
	for(var i=0;i<parsedArray.length;i++)
	{
		add_item();
	}
	for(var i=0;i<parsedArray.length;i++)
	{
		document.getElementById("listItemName"+i).value = parsedArray[i][1];
		$("#listItemName"+i).attr("data-post", parsedArray[i][6] || "false");
		$("#listItemName"+i).attr("data-postdata", parsedArray[i][7] || "");
		$("#listItemName"+i).attr("data-postproxy", parsedArray[i][8] || "false");
		$("#listItemName"+i).attr("data-postproxylink", parsedArray[i][9] || "");
		document.getElementById("listItemLink"+i).value = parsedArray[i][2];
		if(parsedArray[i][6]==="true" || parsedArray[i][6]===true) {
			if(parsedArray[i][8]==="true" || parsedArray[i][8]===true) {
				document.getElementById("listItemPost"+i).innerHTML = "PP";
				var title = parsedArray[i][7] + "***" + parsedArray[i][9];
				$("#listItemPost"+i).attr("title",title);
			} else {
				document.getElementById("listItemPost"+i).innerHTML = "P";
				$("#listItemPost"+i).attr("title",parsedArray[i][7]);
			}
		}
		if(parsedArray[i][3]) document.getElementById("listItemEnab"+i).checked = true;
		if(parsedArray[i][4]) document.getElementById("listItemFromConfig"+i).innerHTML = "Y";
		if(parsedArray[i][5] & 1) document.getElementById("listItemGroup1"+i).checked = true;						//Check group 1
		if(parsedArray[i][5] & 2) document.getElementById("listItemGroup2"+i).checked = true;					//Check group 2
		if(parsedArray[i][5] & 4) document.getElementById("listItemGroup3"+i).checked = true;					//Check group 3
		document.getElementById("listItemRemoveButton"+i).onclick = function(e){remove($('#'+e.target.id).closest('li').attr('id'));};
	}

	restore_optionsRSA(exportValue);
	restore_optionsNWI(exportValue);
    restore_optionsCBC(exportValue);
    
	var ask_bg = getItem("_askbg");
	var ask_next = getItem("_asknext");
	var ask_newwindow = getItem("_asknewwindow");
	var ask_options = getItem("_askoptions");

	if(ask_bg=="true") document.getElementById("ask_bg").checked = true;
	if(ask_next=="true") document.getElementById("ask_next").checked = true;
	if(ask_newwindow=="true") document.getElementById("ask_newwindow").checked = true;
	if(ask_options=="true") document.getElementById("ask_options").checked = true;

	document.getElementById("configUseGroups").checked = (getItem("_configUseGroups") == "true");
	document.getElementById("configEnc").checked = (getItem("_configEnc") == "true");
	document.getElementById("configAutoRefresh").checked = (getItem("_configAutoRefresh") == "true");
	document.getElementById("configUrl").value = getItem("_configUrl");
	document.getElementById("configEncKey").value = getItem("_configEncKey");
	document.getElementById("configLastRefresh").innerHTML = getItem("_configLastRefresh");
}

function remove(eleId)
{
	var listOfSearchOptions = document.getElementById("options_list_ul");
	var listItemToRemove = document.getElementById(eleId);
	listOfSearchOptions.removeChild(listItemToRemove);
}

function add_item()
{
	var optionsList = document.getElementById("options_list_ul");
	var curnum = optionsList.childElementCount;
	
	var appendListHTML = "<li index='"+curnum+"' id='listItem"+curnum+"'>\
							<div align='center'>\
							<div class='dragIcon'></div>\
							<input type='text' class='listItemName' id='listItemName"+curnum+"' size='20' maxlength='30'>\
							<span style='width:10px;' id='listItemPost"+curnum+"' ></span>\
							<input type='text' class='listItemLink' id='listItemLink"+curnum+"' size='80' maxlength='200'>\
							<input type='checkbox' class='checkStyle' id='listItemEnab"+curnum+"'>\
							<button class='removeButtonStyle' id='listItemRemoveButton"+curnum+"'>X</button>\
							<span style='width:40px;' id='listItemFromConfig"+curnum+"'></span>\
							<input type='checkbox' class='checkStyle' id='listItemGroup1"+curnum+"'>\
							<input type='checkbox' class='checkStyle' id='listItemGroup2"+curnum+"'>\
							<input type='checkbox' class='checkStyle' id='listItemGroup3"+curnum+"'>\
							</div></li>";
	document.getElementById("options_list_ul").innerHTML += appendListHTML;
}

function add_option()
{
	var nname = document.getElementById("newname").value;
	var nlink = document.getElementById("newlink").value;
	var npost = $("#newpost").is(':checked');
	var npostdata = $("#newpostdata").val();
	var npostproxy = npost && $("#newpostproxy").is(':checked');
	var npostproxylink = $("#newpostproxylink").val();

	var stringified = getItem("_allsearch");
	var parsedArray = JSON.parse(stringified);

	var newoptions = new Array(parsedArray.length+1);
	
	for(var i=0;i<parsedArray.length;i++)
	{
		newoptions[i] = new Array(10);
		newoptions[i] = parsedArray[i].slice(0);
	}
	
	newoptions[i] = new Array(10);
	newoptions[i][0] = "-1";
	newoptions[i][1] = nname;
	newoptions[i][2] = nlink;
	newoptions[i][3] = true;
	newoptions[i][4] = false;
	newoptions[i][5] = 0;
	newoptions[i][6] = npost;
	newoptions[i][7] = npost ? npostdata : "";
	newoptions[i][8] = npostproxy;
	newoptions[i][9] = npostproxy ? npostproxylink : "";
	
	var newstring = JSON.stringify(newoptions);
	setItem("_allsearch", newstring);

	restore_options();
	save_options();
	
	document.getElementById("newname").value = "";
	document.getElementById("newlink").value = "";
	$('#newpost').removeAttr('checked');
	$('#newpostdata').val('').attr('disabled', "true");
	$('#newpostproxy').removeAttr('checked');
	$('#newpostproxylink').val('').attr('disabled', "true");
	var status = document.getElementById("status_addmanually");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {status.innerHTML = "";},1250);
}

function resetdefault()
{
	clearStrg();
	chrome.extension.getBackgroundPage().updatemenu();
	//alert(parsedArray);
	restore_options();
}