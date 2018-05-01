var _all;
var numentries;
var timeout = 604800000;

chrome.runtime.onInstalled.addListener(function(details) {
	chrome.tabs.create({"url":"http://www.criticalstart.com/threat-analytics-chrome-plugin/", "selected":true});
	updatemenu();
	configUpdateNow();
	});
chrome.runtime.onStartup.addListener(function() {
	updatemenu();
});



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
							setItem("_configLastRefresh", "Update failed - Decryption Error");
							return;
						}	
					}
					var newData = JSON.parse(configData);
					parseConfigData(newData,false);
				} catch(e)
				{
					setItem("_configLastRefresh", "Update failed - Invalid File");
				}
			}
			else			
			{
				setItem("_configLastRefresh", "Update failed - Invalid URL or File doesn't exist");
			}
		}
	}
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
	if(getItem("_configAutoRefresh") == "true")
		setTimeout(function(){configUpdateNow();},timeout);

}

function parseConfigDataRSA(newData)
{	var RSA = newData.RSA;
	if(RSA)
	{
		if(RSA.Config)
			setItem("_RSAConfig", JSON.stringify(RSA.Config));
		if(RSA.Queries)
			setItem("_RSAallquery", JSON.stringify(RSA.Queries));
	}
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
	parseConfigDataCBC(newData);
    
   
	if(overrideConfig)
	{
		var config = newData.config[0];
		setItem("_configUrl", config[0]);
		setItem("_configUseGroups", config[1]);
		setItem("_configEnc", config[2]);
		setItem("_configEncKey", config[3]);
		setItem("_configAutoRefresh", config[4]);
	}
	updatemenu();

}


function updatemenu()
{
	chrome.contextMenus.removeAll();
	
	var searchstring = getItem("_allsearch");
	
	if(searchstring==null)
	{
		setItem("_askbg","true");
		setItem("_asknext", "true");
		setItem("_asknewwindow", "true");
		setItem("_askoptions", "true");
		setItem("_group1Name", "Group 1");
		setItem("_group2Name", "Group 2");
		setItem("_group3Name", "Change Me");
		setItem("_enableGroup3","false");
		setItem("_configUrl", "http://www.criticalstart.com/wp-content/uploads/2018/02/criticalstart.txt");
		setItem("_configUseGroups", true);
		setItem("_configEnc", false);
		setItem("_configEncKey", "");
		setItem("_configAutoRefresh", false);
		setItem("_configLastRefresh", "");

		
		_all = new Array(1);
		
		// 0th item in the array is reserved for context menu item id
		
		_all[0] = new Array(6);
		_all[0][0] = "-1";
		_all[0][1] = "Google"; // Display label
		_all[0][2] = "http://www.google.com/search?q=TESTSEARCH"; // Link
		_all[0][3] = true; // whether this option is enabled or not
		_all[0][4] = false;  //whether this option comes from the config file
		_all[0][5] = 3;  //Group number
		_all[0][6] = false;  //Is Post
		_all[0][7] = "";  //Post request
		numentries = 1;
		
		var stringified = JSON.stringify(_all);
		setItem("_allsearch", stringified);		
	}
	else
	{
		_all = JSON.parse(searchstring);

		numentries = _all.length;
	}
		//alert(_all);

	updatemenuRSA();
	updatemenuNWI();
	updatemenuCBC();
    
	//Create the group menus
	var grp1 = [], grp2 = [], grp3 = [];
	var enableGrp3 = getItem("_enableGroup3");	
	for(var i=0; i<numentries; i++)
	{
		//alert(_all[i][3]);
		if(_all[i][3])
		{
			//Add to the corresponding group
			if(_all[i][5] & 1)
				grp1.push(_all[i]);
			if(_all[i][5] & 2)
				grp2.push(_all[i]);
			if(_all[i][5] & 4)
				grp3.push(_all[i]);
		}
	}
	
	if(grp1.length >= 1 || grp2.length >= 1 || grp3.length >= 1)
	{
		//show the item for linking to extension options
		if(grp1.length >= 1)
		chrome.contextMenus.create({"title": getItem("_group1Name"), "contexts":["selection"], "onclick": function(info, tab){searchGroup(info, tab, grp1);}});
		if(grp2.length >= 1)
		chrome.contextMenus.create({"title": getItem("_group2Name"), "contexts":["selection"], "onclick": function(info, tab){searchGroup(info, tab, grp2)}});
		if(grp3.length >= 1 && enableGrp3==="true")
		chrome.contextMenus.create({"title": getItem("_group3Name"), "contexts":["selection"], "onclick": function(info, tab){searchGroup(info, tab, grp3)}});
		//show separator
		chrome.contextMenus.create({"type": "separator", "contexts":["selection"]});
	}

	//Create all other menus
	for(var i=0; i<numentries; i++)
	{
		if(_all[i][3])
		{
			_all[i][0] = chrome.contextMenus.create({"title": _all[i][1], "contexts":["selection"], "onclick": searchOnClick});
		}
		else _all[i][0] = -1;
	}
	
	var ask_options = getItem("_askoptions")=="true"? true : false;
	
	if(ask_options){
		//show separator
		chrome.contextMenus.create({"type": "separator", "contexts":["selection"]});
		//show the item for linking to extension options
		chrome.contextMenus.create({"title": "Options", "contexts":["selection"], "onclick": function(){chrome.tabs.create({"url":"options.html"});}});
	}
}

function searchGroup(info, tab, group)
{
	var ask_fg = getItem("_askbg")=="true"? false : true;
	var ask_next = getItem("_asknext")=="true"? true : false;
	var ask_newwindow = getItem("_asknewwindow")=="true"? true : false;
	var index = 1000;

	var urls = [];
	for(var i=0;i<group.length;i++)
	{
		
		var targetURL = group[i][2];
		targetURL = targetURL.replace(/TESTSEARCH/g, info.selectionText);
		targetURL = targetURL.replace(/%s/g, info.selectionText);
		if(group[i][6] === true) {
			var targetName = group[i][1];
			var postURL = "postHandler.html?name="+targetName + "&data="+info.selectionText;
			urls.push(postURL);
		} else {
			urls.push(targetURL);
		}
	}

	if(ask_newwindow)
	{
		chrome.windows.create({url:urls, focused:ask_fg});
	}
	else if(ask_next)
	{
		openGroupTabs(urls,ask_fg);
	}
	else
	{
		for(var i=0;i<urls.length;i++)
		{
			chrome.tabs.create({"url":urls[i], "selected":ask_fg});
		}
	}
}

function openGroupTabs(urls,ask_fg)
{
	chrome.tabs.getSelected(null, function(tab){
									var index = tab.index;
									for(var i=0;i<urls.length;i++)
									{
										index++;
										chrome.tabs.create({"url":urls[i], "selected":ask_fg, "index":index});
									}
									});
}

function searchOnClick(info, tab) 
{
	var itemindex = 0;
	for(var i=0; i<numentries; i++)
	{
		if(info.menuItemId == _all[i][0])
		{
			//alert(i);
			itemindex = i;
		}
	}
	var ask_fg = getItem("_askbg")=="true"? false : true;
	var ask_next = getItem("_asknext")=="true"? true : false;
	var index = 1000;
	
	var targetURL = _all[itemindex][2].replace(/TESTSEARCH/g, info.selectionText);
	targetURL = targetURL.replace(/%s/g, info.selectionText);
	if(_all[itemindex][6]===true) {
		var targetName = _all[itemindex][1];
		targetURL = "postHandler.html?name="+targetName + "&data="+info.selectionText;
	}
	
	if(ask_next)
	{
		chrome.tabs.getSelected(null, function(tab){
										index = tab.index + 1;
										chrome.tabs.create({"url":targetURL, "selected":ask_fg, "index":index});
										});
	}
	else
	{
		chrome.tabs.create({"url":targetURL, "selected":ask_fg});
	}
}



function updatemenuRSA()
{
	if(getItem("_RSAConfig") == null)
	{
		var RSAConfigDefault = {};
		RSAConfigDefault.RSAConfigEnable = false;
		RSAConfigDefault.RSAConfigPopup = false;
		RSAConfigDefault.RSAConfigUseHttps = true;
		RSAConfigDefault.RSAConfigNewTab = true;
		RSAConfigDefault.RSAConfigHost = "192.168.1.10";
		RSAConfigDefault.RSAConfigPort = "";
		RSAConfigDefault.RSAConfigDevId = "2";
		RSAConfigDefault.RSAConfigRange1 = "1";
		RSAConfigDefault.RSAConfigRange2 = "24";
		RSAConfigDefault.RSAConfigRange3 = "48";
		RSAConfigDefault.RSAConfigRange4 = "720";
		
		setItem("_RSAConfig", JSON.stringify(RSAConfigDefault));
		
		var RSAQueriesDefault = [[-1,"Search Hostname","alias.host='TESTSEARCH'",true],
								 [-1,"Search Source IP","ip.src=TESTSEARCH",true],
								 [-1,"Search Destination IP","ip.dst=TESTSEARCH",true]];
		setItem("_RSAallquery", JSON.stringify(RSAQueriesDefault));
	}
	RSAConfig = JSON.parse(getItem("_RSAConfig")) || {};
	RSAQueries = JSON.parse(getItem("_RSAallquery")) || [];
	
	//Create the RSA Menu
	if(RSAConfig.RSAConfigEnable)
	{
		var menuL1 = chrome.contextMenus.create({"title": "RSA Security Analytics", "contexts":["selection"]});
		for(var i=0;i<RSAQueries.length;i++)
		{
			if(RSAQueries[i][3] == false)
				continue;
			RSAQueries[i][0] = chrome.contextMenus.create({"title": RSAQueries[i][1], "contexts":["selection"], "parentId": menuL1});

			chrome.contextMenus.create({"title": RSAConfig.RSAConfigRange1 + " Hour(s)", "contexts":["selection"], "parentId": RSAQueries[i][0], "onclick": function(info, tab){ searchRSA(info, tab, RSAConfig.RSAConfigRange1);} });
			chrome.contextMenus.create({"title": RSAConfig.RSAConfigRange2 + " Hour(s)", "contexts":["selection"], "parentId": RSAQueries[i][0], "onclick": function(info, tab){ searchRSA(info, tab, RSAConfig.RSAConfigRange2);} });
			chrome.contextMenus.create({"title": RSAConfig.RSAConfigRange3 + " Hour(s)", "contexts":["selection"], "parentId": RSAQueries[i][0], "onclick": function(info, tab){ searchRSA(info, tab, RSAConfig.RSAConfigRange3);} });
			chrome.contextMenus.create({"title": RSAConfig.RSAConfigRange4 +" Hour(s)", "contexts":["selection"], "parentId": RSAQueries[i][0], "onclick": function(info, tab){ searchRSA(info, tab, RSAConfig.RSAConfigRange4);} });
		}
		chrome.contextMenus.create({"type": "separator", "contexts":["selection"]});
	}
}

function searchRSA(info, tab, hours)
{
	for(var i=0; i<RSAQueries.length; i++)
	{
		if(info.parentMenuItemId  == RSAQueries[i][0])
		{
			itemindex = i;
			break;
		}
	}
	
	var query = RSAQueries[itemindex][2].replace(/TESTSEARCH/g, info.selectionText);
	query = query.replace(/%s/g, info.selectionText);
	query = encodeURIComponent(query);
	var port = RSAConfig.RSAConfigPort ? ":" + RSAConfig.RSAConfigPort : "";
	var endDate = new Date();
	var startDate = new Date(endDate.getTime() - hours*60*60*1000);
		
	if(RSAConfig.RSAConfigUseHttps)
		var url = "https://" + RSAConfig.RSAConfigHost + port + "/investigation/" + RSAConfig.RSAConfigDevId + "/navigate/query/" + query + "/date/" + startDate.toISOString().replace(/\.\d+Z$/,"Z") + "/" + endDate.toISOString().replace(/\.\d+Z$/,"Z");
	else
		var url = "http://" + RSAConfig.RSAConfigHost + port + "/investigation/" + RSAConfig.RSAConfigDevId + "/navigate/query/" + query + "/date/" + startDate.toISOString().replace(/\.\d+Z$/,"Z") + "/" + endDate.toISOString().replace(/\.\d+Z$/,"Z");

	if(RSAConfig.RSAConfigPopup)
		alert(url);
		
	chrome.tabs.create({"url":url, "selected":RSAConfig.RSAConfigNewTab});		
}

function updatemenuNWI()
{
	if(getItem("_NWIConfig") == null)
	{
		var NWIConfigDefault = {};
		NWIConfigDefault.NWIConfigEnable = false;
		NWIConfigDefault.NWIConfigPopup = false;
		NWIConfigDefault.NWIConfigGMT = false;
		NWIConfigDefault.NWIConfigHost = "192.168.1.10";
		NWIConfigDefault.NWIConfigPort = "";
		NWIConfigDefault.NWIConfigCollectionName = "";
		NWIConfigDefault.NWIConfigRange1 = "1";
		NWIConfigDefault.NWIConfigRange2 = "24";
		NWIConfigDefault.NWIConfigRange3 = "48";
		NWIConfigDefault.NWIConfigRange4 = "720";
		
		setItem("_NWIConfig", JSON.stringify(NWIConfigDefault));
		
		var NWIQueriesDefault = [[-1,"Search Hostname","alias.host='TESTSEARCH'",true],
								 [-1,"Search Source IP","ip.src=TESTSEARCH",true],
								 [-1,"Search Destination IP","ip.dst=TESTSEARCH",true]];
		setItem("_NWIallquery", JSON.stringify(NWIQueriesDefault));
	}
	NWIConfig = JSON.parse(getItem("_NWIConfig")) || {};
	NWIQueries = JSON.parse(getItem("_NWIallquery")) || [];
	
	//Create the NWI Menu
	if(NWIConfig.NWIConfigEnable)
	{
		var menuL1 = chrome.contextMenus.create({"title": "NetWitness Investigator", "contexts":["selection"]});
		for(var i=0;i<NWIQueries.length;i++)
		{
			if(NWIQueries[i][3] == false)
				continue;
			NWIQueries[i][0] = chrome.contextMenus.create({"title": NWIQueries[i][1], "contexts":["selection"], "parentId": menuL1});

			chrome.contextMenus.create({"title": NWIConfig.NWIConfigRange1 + " Hour(s)", "contexts":["selection"], "parentId": NWIQueries[i][0], "onclick": function(info, tab){ searchNWI(info, tab, NWIConfig.NWIConfigRange1);} });
			chrome.contextMenus.create({"title": NWIConfig.NWIConfigRange2 + " Hour(s)", "contexts":["selection"], "parentId": NWIQueries[i][0], "onclick": function(info, tab){ searchNWI(info, tab, NWIConfig.NWIConfigRange2);} });
			chrome.contextMenus.create({"title": NWIConfig.NWIConfigRange3 + " Hour(s)", "contexts":["selection"], "parentId": NWIQueries[i][0], "onclick": function(info, tab){ searchNWI(info, tab, NWIConfig.NWIConfigRange3);} });
			chrome.contextMenus.create({"title": NWIConfig.NWIConfigRange4 +" Hour(s)", "contexts":["selection"], "parentId": NWIQueries[i][0], "onclick": function(info, tab){ searchNWI(info, tab, NWIConfig.NWIConfigRange4);} });
		}
		chrome.contextMenus.create({"type": "separator", "contexts":["selection"]});
	}
}

function searchNWI(info, tab, hours)
{
	for(var i=0; i<NWIQueries.length; i++)
	{
		if(info.parentMenuItemId  == NWIQueries[i][0])
		{
			itemindex = i;
			break;
		}
	}
	var port = NWIConfig.NWIConfigPort ? ":" + NWIConfig.NWIConfigPort : "";
	var useGMT = NWIConfig.NWIConfigGMT;

	var historyString = "collection=" + NWIConfig.NWIConfigCollectionName;
	historyString = escape(historyString);
	
	var query = NWIQueries[itemindex][2].replace(/TESTSEARCH/g, info.selectionText);
	query = query.replace(/%s/g, info.selectionText);
	
	var queryName = 'Critical+Start+Drill+' + escape('"') + encodeURIComponent(query) + escape('"');
	query = escape("(") + encodeURIComponent(query) + escape(")");

	var endDate = new Date();
	var startDate = new Date(endDate.getTime() - hours*60*60*1000);
	var timeString1 = escape(formatDate(useGMT,startDate)) + "+" + escape(formatAMPM(useGMT,startDate));
	var timeString2 = escape(formatDate(useGMT,endDate)) + "+" + escape(formatAMPM(useGMT,endDate));
	var timeString = timeString1 + "++to++" + timeString2;
	
	var url = "nw://" + NWIConfig.NWIConfigHost + port + "/?collection=" + NWIConfig.NWIConfigCollectionName + "&where=" + query + "&time=" + timeString + "&name=" + queryName + "&history=" + historyString;

	if(NWIConfig.NWIConfigPopup)
		alert(url);

	chrome.tabs.create({"url":url});		
}

function getMonthName(month)
{
var monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
	];
    return monthNames[month].substr(0, 3);
}

function formatDate(useGMT,date) {
  var years = useGMT ? date.getUTCFullYear() : date.getFullYear();
  var month = useGMT ? date.getUTCMonth() : date.getUTCMonth();
  var dateNum = useGMT ? date.getUTCDate(): date.getUTCDate();

  dateNum = dateNum < 10 ? '0'+dateNum : dateNum;
  var strDate = years + '-' + getMonthName(month) + '-' + dateNum;
  return strDate;
}

function formatAMPM(useGMT,date) {
  var hours = useGMT ? date.getUTCHours() : date.getHours();
  var minutes = useGMT ? date.getUTCMinutes() : date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  //hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  hours = hours < 10 ? '0'+hours : hours;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}


function updatemenuCBC()
{
	if(getItem("_CBCConfig") == null)
	{
		var CBCConfigDefault = {};
		CBCConfigDefault.CBCConfigEnable = false;
		CBCConfigDefault.CBCConfigPopup = false;
		CBCConfigDefault.CBCConfigUseHttps = true;
		CBCConfigDefault.CBCConfigNewTab = true;
		CBCConfigDefault.CBCConfigHost = "192.168.1.10";
		CBCConfigDefault.CBCConfigPort = "";
		CBCConfigDefault.CBCConfigURLVersion = "1";

		
		setItem("_CBCConfig", JSON.stringify(CBCConfigDefault));
		
		var CBCQueriesDefault = [[-1,"Search All (Mostly Use This)","q=TESTSEARCH",true],
								 [-1,"Domain Name (FQDN)","cb.q.domain=TESTSEARCH",true],
								 [-1,"Hostname (Has CB Sensor)","cb.q.hostname=TESTSEARCH",true],
								 [-1,"Process or EXE","cb.q.process_name=TESTSEARCH",true],
								 [-1,"MD5 Hash Search","cb.q.md5=TESTSEARCH",true]];
		setItem("_CBCallquery", JSON.stringify(CBCQueriesDefault));
	}
	CBCConfig = JSON.parse(getItem("_CBCConfig")) || {};
	CBCQueries = JSON.parse(getItem("_CBCallquery")) || [];
	
	//Create the CBC Menu
	if(CBCConfig.CBCConfigEnable)
	{
		var menuL1 = chrome.contextMenus.create({"title": "Carbon Black", "contexts":["selection"]});
		for(var i=0;i<CBCQueries.length;i++)
		{
			if(CBCQueries[i][3] == false)
				continue;
			CBCQueries[i][0] = chrome.contextMenus.create({"title": CBCQueries[i][1], "contexts":["selection"], "parentId": menuL1, "onclick": function(info, tab){ searchCBC(info, tab);} });
		}
		chrome.contextMenus.create({"type": "separator", "contexts":["selection"]});
	}
}

function searchCBC(info, tab)
{
	for(var i=0; i<CBCQueries.length; i++)
	{
		if(info.menuItemId   == CBCQueries[i][0])
		{
			itemindex = i;
			break;
		}
	}
	
	var query = CBCQueries[itemindex][2].replace(/TESTSEARCH/g, info.selectionText);
	query = query.replace(/%s/g, info.selectionText);
	query = encodeURI(query);
	var port = CBCConfig.CBCConfigPort ? ":" + CBCConfig.CBCConfigPort : "";
    var urlVersion = CBCConfig.CBCConfigURLVersion ? CBCConfig.CBCConfigURLVersion : 1;
		
	if(CBCConfig.CBCConfigUseHttps)
		var url = "https://" + CBCConfig.CBCConfigHost + port + "/#/search/cb.urlver=" +  urlVersion + "&" +  query + "&sort=start%20desc&rows=10&start=0";
	else
		var url = "http://" + CBCConfig.CBCConfigHost + port + "/#/search/cb.urlver=" +  urlVersion + "&" +  query + "&sort=start%20desc&rows=10&start=0";

	if(CBCConfig.CBCConfigPopup)
		alert(url);
		
	chrome.tabs.create({"url":url, "selected":CBCConfig.CBCConfigNewTab});		
}

// End of file;
