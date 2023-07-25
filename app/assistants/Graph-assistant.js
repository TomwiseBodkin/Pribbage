/*
 *     Copyright 2010 Mark A. Crowder
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


function GraphAssistant(name,group) {
   if (name) {
      this.name = name;
   } else {
      this.name = "player";
   }
   if (group) {
      this.scoreGroup = group;
   } else {
      this.scoreGroup = "hand";
   }
   this.db = new pribDataStorage();
   this.game = new Game(this.db);
   this.game.checkPrefCookie();
   this.game.backgroundCanvas();
}

GraphAssistant.prototype.setup = function() {

   $("Graph").setStyle({'position':'absolute','left':'10px','top':'10px'});
   
   menuLabel = $L("Change graph");
   
   this.game.cmdMenuModel =
     {visible: false,
	items: [{},{label: menuLabel,command:'changeStats'}]};
   this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.game.cmdMenuModel);
   
   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);
   
}

GraphAssistant.prototype.activate = function(event) {
   // set up canvas element
   cardNode = new Element('canvas',{'id':'graph','width':'320','height':'480','x-mojo-element':'button'});
   this.ctx = cardNode.getContext('2d');
   $("Graph").appendChild(cardNode);
   
   this.popupperHandler = this.popupper.bindAsEventListener(this);
   
   this.controller.setupWidget("graph",{},{});
   Mojo.Event.listen(this.controller.get("graph"), Mojo.Event.tap, this.popupperHandler);
   
   if (!this.game.statData.length) {
      this.game.loadStats(this.pullGraphData.bind(this));
   } else {
      this.pullGraphData();
   }
   
   // this.showGraph();
}


GraphAssistant.prototype.deactivate = function() {
   Mojo.Event.stopListening(this.controller.get("graph"), Mojo.Event.tap, this.popupperHandler);
   while ($("Graph").lastChild) {
      $("Graph").lastChild.remove();
   }
}

GraphAssistant.prototype.cleanup = function() {
   while ($("Graph").lastChild) {
      $("Graph").lastChild.remove();
   }
}


GraphAssistant.prototype.popupChooser = function(value) {
   if (value != undefined) {
      if (value.split("-").length == 2) {
	 this.name = value.split("-")[0];
	 this.scoreGroup = value.split("-")[1];
      } else {
	 this.name = this.game.gamePrefs.playerName;
	 this.scoreGroup = "hand";
      }

      ctx = this.ctx;
      ctx.clearRect(0,0,320,480);
      this.game.cmdMenuModel.visible = false;
      this.controller.modelChanged(this.game.cmdMenuModel);
      this.pullGraphData();
   }
};


GraphAssistant.prototype.popupper = function(event) {
   // Mojo.Log.info("id", event.target.id);
   if (this.game.cmdMenuModel.visible) {
      this.game.cmdMenuModel.visible = false;
   } else {
      this.game.cmdMenuModel.visible = true;
   }
   
   this.controller.modelChanged(this.game.cmdMenuModel);
}


GraphAssistant.prototype.handleCommand = function(event) {
   if (event.type === Mojo.Event.command) {
      switch (event.command) {
       case 'dump':
	 ctx = this.ctx;
	 ctx.clearRect(0,0,320,480);
	 break;
       case 'changeStats':
	 this.controller.popupSubmenu({onChoose:this.popupChooser,
	    placeNear:event.originalEvent.target,
	    items:
	    [{label:"Hand stats", command: this.name+"-hand"},
	     {label:"Crib stats", command: this.name+"-crib"},
	     {label:"Score as dealer", command: this.name+"-dealer"},
	     {label:"Score as pone", command: this.name+"-pone"}]
	 });
	 break;
      }
   }
}


GraphAssistant.prototype.pullGraphData = function(gameStatData) {
   this.plyrArr = {};
   this.compArr = {};
   
   if (gameStatData) {
      while (gameStatData.length) {
	 this.game.statData.push(gameStatData.pop());
      }
   }
   
   if (this.game.statData.length) {
      statDataLen = this.game.statData.length;
      for (i=0; i < statDataLen; i++) {
	 var Pdata = this.game.statData[i];
	 if (Pdata.name == this.name) {
	    var dataset = Pdata.data;
	    break;
	 }
      }
      if (!dataset) {
	 var Pdata = this.game.statData[0];
	 this.name = Pdata.name;
	 dataset = Pdata.data;
      }
      // Mojo.Log.error("data: %j",Pdata.data.pDealerPts);
      if (this.scoreGroup == "hand") {
	 if (dataset.handpointsArr)
	   this.plyrArr = dataset.handpointsArr;
	 if (dataset.comphandpointsArr)
	   this.compArr = dataset.comphandpointsArr;
      } else if (this.scoreGroup == "crib") {
	 if (dataset.cribpointsArr)
	   this.plyrArr = dataset.cribpointsArr;
	 if (dataset.compcribpointsArr)
	   this.compArr = dataset.compcribpointsArr;
      } else if (this.scoreGroup == "dealer") {
	 if (dataset.pDealerPts)
	   this.plyrArr = dataset.pDealerPts;
	 if (dataset.cDealerPts)
	   this.compArr = dataset.cDealerPts;
      } else if (this.scoreGroup == "pone") {
	 if (dataset.pPonePts)
	   this.plyrArr = dataset.pPonePts;
	 if (dataset.cPonePts)
	   this.compArr = dataset.cPonePts;
      } else {
	 if (dataset.handpointsArr)
	   this.plyrArr = dataset.handpointsArr;
	 if (dataset.comphandpointsArr)
	   this.compArr = dataset.comphandpointsArr;
      }
   }
   
   this.showGraph();
}


GraphAssistant.prototype.showGraph = function() {
   ctx = this.ctx;
   
   // Colvert's analysis
   ColDealer = {"0": 8, "1": 2, "2": 65, "3": 15, "4": 100, "5": 39, "6": 160, "7": 75, "8": 170, "9": 56, "10": 88, "11": 16, "12": 98, "13": 5, "14": 35, "15": 8, "16": 39, "17": 5, "18": 2, "19": 0, "20": 6, "21": 2, "22": 1, "23": 1, "24": 4, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0};
   ColNondealer = {"0": 4, "1": 2, "2": 65, "3": 16, "4": 95, "5": 35, "6": 145, "7": 78, "8": 174, "9": 60, "10": 90, "11": 17, "12": 110, "13": 10, "14": 35, "15": 6, "16": 39, "17": 5, "18": 1, "19": 0, "20": 5, "21": 2, "22": 1, "23": 1, "24": 4, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0};
   ColCrib = {"0": 80, "1": 10, "2": 220, "3": 30, "4": 200, "5": 68, "6": 150, "7": 50, "8": 88, "9": 20, "10": 38, "11": 3, "12": 28, "13": 1, "14": 5, "15": 2, "16": 5, "17": 1, "18": 0, "19": 0, "20": 1, "21": 0, "22": 0, "23": 0, "24": 0, "25": 0, "26": 0, "27": 0, "28": 0, "29": 0};
   // total per round
   dealerBG = {"0": 0, "1": 1, "2": 0, "3": 1, "4": 2, "5": 6, "6": 9, "7": 20, "8": 25, "9": 34, "10": 44, "11": 49, "12": 55, "13": 76, "14": 77, "15": 87, "16": 75, "17": 80, "18": 70, "19": 53, "20": 46, "21": 38, "22": 28, "23": 27, "24": 22, "25": 18, "26": 16, "27": 12, "28": 9, "29": 4, "30": 3, "31": 3, "32": 3, "33": 2, "34": 1, "35": 1, "36": 1, "37": 1, "38": 1, "39": 1, "40": 1, "41": 1};
   nondealerBG = {"0": 1, "1": 3, "2": 10, "3": 19, "4": 36, "5": 48, "6": 74, "7": 85, "8": 98, "9": 105, "10": 98, "11": 78, "12": 83, "13": 64, "14": 45, "15": 32, "16": 31, "17": 29, "18": 14, "19": 12, "20": 11, "21": 5, "22": 5, "23": 2, "24": 2, "25": 2, "26": 2, "27": 1, "28": 1, "29": 1, "30": 1, "31": 1};
   
   // simulated using Pribbage code
   bgProbC = {"0": 88311, "1": 3963, "2": 916238, "3": 231570, "4": 1753916, "5": 565456, "6": 2353844, "7": 973724, "8": 2601896, "9": 944813, "10": 1323149, "11": 217341, "12": 1544663, "13": 114170, "14": 503801, "15": 75156, "16": 492593, "17": 99500, "18": 27746, "20": 87292, "21": 26297, "22": 5896, "23": 3311, "24": 44342, "28": 975, "29": 37};
   bgProbP = {"0": 57178, "1": 7035, "2": 636774, "3": 214320, "4": 1806524, "5": 538862, "6": 2324502, "7": 1026436, "8": 2829936, "9": 997221, "10": 1296844, "11": 238275, "12": 1537071, "13": 130051, "14": 510466, "15": 71649, "16": 473412, "17": 102868, "18": 28388, "20": 88968, "21": 27394, "22": 6082, "23": 3802, "24": 44909, "28": 971, "29": 62};
   bgProbCrib = {"0": 1149311, "1": 92346, "2": 3555900, "3": 605288, "4": 3040483, "5": 834434, "6": 2118215, "7": 718723, "8": 1319999, "9": 343492, "10": 451249, "11": 41343, "12": 479206, "13": 17969, "14": 92031, "15": 13502, "16": 86992, "17": 13465, "18": 3768, "20": 12454, "21": 4491, "22": 120, "23": 48, "24": 5158, "28": 11, "29": 2};

   var bgProb = {};
   
   var numBins = 30;
   var legend = true;
   scoreLabs = [0,2,4,6,8,10,12,14,16,19,22,24,29];
   AUTxt = $L("# per score");
   
   if (this.scoreGroup == "crib") {
      bgProb = bgProbCrib;
      AUTxt = $L("# cribs per score");
   } else if (this.scoreGroup == "dealer"){
      bgProb = dealerBG;
      scoreLabs = [];
      var numBins = 42;
      for (i=0; i<numBins;i+=2) {
	 scoreLabs.push(i);
      }
      var legend = true;
      AUTxt = $L("# rounds per score as dealer");
   } else if (this.scoreGroup == "pone"){
      bgProb = nondealerBG;
      scoreLabs = [];
      var numBins = 32;
      for (i=0; i<numBins;i+=2) {
	 scoreLabs.push(i);
      }
      var legend = true;
      AUTxt = $L("# rounds per score as nondealer");
   } else if (this.scoreGroup == "hand"){
      bgProb = {};
      for (xi in bgProbC) {
	 bgProb[xi] = bgProbC[xi];
	 if (bgProbP[xi]) {
	    bgProb[xi] += bgProbP[xi];
	    bgProb[xi] /= 2.0;
	 }
      }
      AUTxt = $L("# hands per score");
   }
   for (i in bgProb) 
     if (parseInt(i) > numBins)
       numBins = parseInt(i);
       
   var screenWidth = Mojo.Environment.DeviceInfo.screenWidth-20;
   var screenHeight = Mojo.Environment.DeviceInfo.screenHeight-50;
   var lineWidth = 2;
   var bgPColor = '#C0C0C0';
   var pColor = 'LimeGreen';
   var cColor = 'MediumVioletRed';
   
   ctx.fillStyle = '#B0C4DE';
   ctx.strokeStyle = 'black';
   ctx.lineWidth=lineWidth;
   
   roundedRectGr(ctx,lineWidth,lineWidth,screenWidth - 2*lineWidth,screenHeight - 2*lineWidth,10);
   
   graphXstrt = 27;
   graphYstrt = 50;
   graphWidth = screenWidth - graphXstrt - 10;
   graphHeight = screenHeight - graphYstrt - 10;
   
   
   ctx.strokeStyle = 'black';
   ctx.fillStyle = '#e4e4e2';
   roundedRectGr(ctx,graphXstrt,graphYstrt,graphWidth,graphHeight,8);
   
   // score labels along bottom
   ctx.font = "12px sans-serif";
   ctx.fillStyle = 'black';
   for (i=0; i < numBins; i++) {
      yPnt = parseInt(graphYstrt + (i+1)*(graphHeight/(numBins+1)));
      if (scoreLabs.indexOf(i) >=0) {
	 var txtWid = ctx.measureText(i);
	 ctx.fillText(i,graphXstrt-txtWid.width-5,yPnt+4);
      }
   }
   
   maxValScr = 0;
   maxValBG = 0;
   for (i in bgProb) {
      if (bgProb[i] > maxValBG) {
	 maxValBG = bgProb[i];
      }
   }
   for (i in this.plyrArr) {
      if (this.plyrArr[i] > maxValScr) {
	 maxValScr = this.plyrArr[i];
      }
   }
   for (i in this.compArr) {
      if (this.compArr[i] > maxValScr) {
	 maxValScr = this.compArr[i];
      }
   }
   
   if (maxValScr < 100) {
      var mVDiff = 100 - maxValScr;
      maxValScr += Math.min(mVDiff,6);
   }
   
   ctx.beginPath();
   xPnt = graphXstrt + graphWidth/1.03;
   ctx.moveTo(xPnt,graphYstrt+4*tickLen);
   ctx.lineTo(xPnt,graphYstrt);
   ctx.stroke();
   
   ctx.font = "12px sans-serif";
   ctx.fillStyle = 'black';
   maxValTxt = makeTheNumberPretty(maxValScr);
   txtWid = ctx.measureText(maxValTxt).width;
   ctx.fillText(maxValTxt, (xPnt-txtWid-6), (graphYstrt+12));
   
   var barWidth = parseInt(screenHeight/80) - 1;
   var barOffset = 1;
   xPnt = graphXstrt + barOffset;
   
   maxValScr *= 1.03;
   
   ctx.fillStyle = bgPColor;
   ctx.strokeStyle = bgPColor;
   for (i in bgProb) {
      scr = parseInt(i);
      scrPer = (bgProb[i]/maxValBG)/1.03;
      yPnt = parseInt(graphYstrt + (scr+1)*(graphHeight/(numBins+1)));
      xWidth = parseInt(scrPer * graphWidth)+0.5;
      ctx.fillRect(xPnt,yPnt-barWidth,xWidth,2*barWidth);
      ctx.strokeRect(xPnt,yPnt-barWidth,xWidth,2*barWidth);
   }
   
   ctx.fillStyle = pColor;
   for (i in this.plyrArr) {
      scr = parseInt(i);
      scrPer = this.plyrArr[i]/maxValScr;
      yPnt = parseInt(graphYstrt + (scr+1)*(graphHeight/(numBins+1))-barWidth);
      xWidth = parseInt(scrPer * graphWidth)+0.5;
      ctx.fillRect(xPnt,yPnt,xWidth,barWidth);
   }
   ctx.fillStyle = cColor;
   for (i in this.compArr) {
      scr = parseInt(i);
      scrPer = this.compArr[i]/maxValScr;
      yPnt = parseInt(graphYstrt + (scr+1)*(graphHeight/(numBins+1)));
      xWidth = parseInt(scrPer * graphWidth)+0.5;
      ctx.fillRect(xPnt,yPnt,xWidth,barWidth);
   }
   
   // ticks along bottom
   ctx.strokeStyle = 'black';
   var tickLen = 4;
   for (i=0; i < (numBins+1); i++) {
      ctx.beginPath();
      yPnt = parseInt(graphYstrt + (i+0.5)*(graphHeight/(numBins+1)));
      ctx.moveTo(graphXstrt+tickLen,yPnt);
      ctx.lineTo(graphXstrt,yPnt);
      ctx.stroke();
   }
   
   ctx.fillStyle = 'black';
    
   ctx.font = "18px sans-serif";
   AUTxtWid = ctx.measureText(AUTxt).width;
   AUTxtXPos = graphXstrt + 0.5*(graphWidth)-0.5*AUTxtWid;
   ctx.fillText(AUTxt,AUTxtXPos,(2/3)*graphYstrt);

   // add legend
   if (legend) {
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'white';
      plyrTxt = "= "+this.name;
      cmpTxt = $L("= computer");
      txtWidthp = ctx.measureText(plyrTxt).width + 0;
      txtWidthc = ctx.measureText(cmpTxt).width + 0;
      txtWidth = Math.max(txtWidthp,txtWidthc);
      legendWidth = txtWidth + 40;
      legendHeight = 40;
      legendYPos = screenHeight - legendHeight - 30;
      roundedRectGr(ctx,screenWidth-legendWidth-30,legendYPos,legendWidth,legendHeight,5);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = 'black';
      ctx.fillText('= '+this.name, screenWidth-30-txtWidth, (legendYPos+legendHeight - 23));
      ctx.fillText(cmpTxt, screenWidth-30-txtWidth, (legendYPos+legendHeight - 6));
      ctx.fillStyle = pColor;
      ctx.fillRect(screenWidth-legendWidth-20,legendYPos+5,20,15);
      ctx.fillStyle = cColor;
      ctx.fillRect(screenWidth-legendWidth-20,legendYPos+21,20,15);
   }
   
}

function roundedRectGr(ctx,x,y,width,height,radius) {
   ctx.lineJoin = 'round';
   ctx.beginPath();
   ctx.moveTo(x,y+radius);  
   ctx.lineTo(x,y+height-radius);
   ctx.arc(x+radius,y+height-radius, radius, (Math.PI/180.)*180, (Math.PI/180.)*90,true);
   ctx.lineTo(x+width-radius,y+height);  
   ctx.arc(x+width-radius,y+height-radius, radius, (Math.PI/180.)*90, (Math.PI/180.)*0,true);
   ctx.lineTo(x+width,y+radius);  
   ctx.arc(x+width-radius,y+radius, radius, (Math.PI/180.)*0, (Math.PI/180.)*270,true);
   ctx.lineTo(x+radius,y);  
   ctx.arc(x+radius,y+radius, radius, (Math.PI/180.)*270, (Math.PI/180.)*180,true);
   ctx.fill();
   ctx.stroke();
}

function makeTheNumberPretty(number){
   if (number < 1000) {
      prettyNumber = number;
   } else if (number < 10000) {
      prettyNumber = parseInt(number/100)/10+"k";
   } else if (number < 1000000) {
      prettyNumber = parseInt(number/1000)+"k";
   } else {
      prettyNumber = parseInt(number/100)/10+"M";
   }
   return prettyNumber;
}
