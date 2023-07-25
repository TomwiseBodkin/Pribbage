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


function StatsAssistant() {
   this.db = new pribDataStorage();
   this.game = new Game(this.db);
   this.game.checkPrefCookie();
   this.game.backgroundCanvas();
}

StatsAssistant.prototype.setup = function() {
   if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
      // Mojo.Log.info("I am on a pixi");
      this.game.palmType = 'pixi';
   }
   // if (this.game.gamePrefs.backGroundColor) {
   //   $("finale").setStyle({'background-color':this.game.gamePrefs.backGroundColor});
   // }
   
   this.game.cmdMenuModel = {
      visible: true,
	items: [{label: $L("Play game"),command:'newGame'},
		{label: $L("Game Stats"),command:'lessStats'}
		]
   };
   this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.game.cmdMenuModel);

   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);
   
   // listeners for popup menus
   this.listeners = [];

};

StatsAssistant.prototype.activate = function(event) {
   
   this.popupperHandler = this.popupper.bindAsEventListener(this);
   
   $("statTitle").innerHTML = $L("Player Stats");
   
   statFooter = new Element('div', {'id':'statFooter','class':'footer-wrapper'});
   $('finale').appendChild(statFooter);
   statFooter.innerHTML = '&nbsp;';
   
   if (!this.game.statData.length) {
      this.game.loadStats(this.calcGameStats.bind(this));
   } else {
      this.calcGameStats();
   }
   
};

StatsAssistant.prototype.deactivate = function(event) {
   while (this.listeners.length){
      lName = this.listeners.pop();
      Mojo.Event.stopListening(this.controller.get(lName), Mojo.Event.tap, this.popupperHandler); 
   }
};

StatsAssistant.prototype.cleanup = function(event) {
   ;
};

StatsAssistant.prototype.calcGameStats = function(gameStatData) {
   if (gameStatData) {
      while (gameStatData.length) {
	 this.game.statData.push(gameStatData.pop());
      }
   }
   
   
   if (this.game.statData.length){
      statDataLen = this.game.statData.length;
      
      while ($("statDataArea").lastChild) {
	 $("statDataArea").lastChild.remove();
      }
      
      for (i=0; i < statDataLen; i++) {
	 var Pdata = this.game.statData[i];
	 var dataset = Pdata.data;
	 // Mojo.Log.info('data: %j', Pdata);
	 Pgroup = new Element('div',{'id':Pdata.name+'PG','class':'palm-group'});
	 $("statDataArea").appendChild(Pgroup);
	 PgroupTitle = new Element('div',{'id':Pdata.name+'PGT','class':'palm-group-title'});
	 Pgroup.appendChild(PgroupTitle);
	 PgroupTitle.innerHTML = $L("Stats for #{name}").interpolate({name:Pdata.name});
	 PList  = new Element('div',{'id':Pdata.name+'PL','class':'palm-list'});
	 PRowSingle  = new Element('div',{'id':Pdata.name+'PRS','class':'palm-row single'});
	 PRowWrap  = new Element('div',{'id':Pdata.name+'PRW','class':'palm-row-wrapper'});
	 PRowText  = new Element('div',{'id':Pdata.name+'PRT','class':'palm-body-text','style':'font-size:14px;text-align:justify'});
	 Pgroup.appendChild(PList);
	 PList.appendChild(PRowSingle);
	 PRowSingle.appendChild(PRowWrap);
	 PRowWrap.appendChild(PRowText);
	 
	 PRowText.innerHTML = this.showTable(dataset);
	 
	 var divh = Pgroup.offsetHeight;
	 var divw = Pgroup.offsetWidth;
	 var divt = Pgroup.offsetTop;

	 // Mojo.Log.info('height/width',divh,divw);
	 PgroupButton = new Element('div',{'id':Pdata.name+'-Button','x-mojo-element':'button'});
	 PgroupButton.setStyle({'position':'absolute','zIndex':666,'opacity':'0','height':divh+'px','width':divw+'px','top':divt+'px'});
	 Pgroup.appendChild(PgroupButton);
	 this.controller.setupWidget(Pdata.name+'-Button',{},{});
	 Mojo.Event.listen(this.controller.get(Pdata.name+'-Button'), Mojo.Event.tap, this.popupperHandler);
	 this.listeners.push(Pdata.name+'-Button');
	 
      }
      Pgroup = new Element('div',{'id':'endPG','class':'palm-group unlabeled'});
      $("statDataArea").appendChild(Pgroup);
      PList  = new Element('div',{'id':'endPL','class':'palm-list'});
      PRowSingle  = new Element('div',{'id':'endPRS','class':'palm-row single'});
      PRowWrap  = new Element('div',{'id':'endPRW','class':'palm-row-wrapper'});
      PRowText  = new Element('div',{'id':'endPRT','class':'palm-body-text','style':'font-size:14px;text-align:justify'});
      Pgroup.appendChild(PList);
      PList.appendChild(PRowSingle);
      PRowSingle.appendChild(PRowWrap);
      PRowWrap.appendChild(PRowText);
      PRowText.innerHTML = $L("All numbers are averages from all games per player name. No guarantees, express or implied, about their accuracy.");
      this.moveScreenUp();
   } else {
      Pdata = {};
      Pdata.name = 'Smeagol';
      dataset = {games: 999, shortgames: 0, skunks: 999, skunked: 0, 
	   loseDelta: 0, Phands: 9590, Pcutwins: 672, Ccutwins: 327, Pcribs: 4795, 
	   hands: 9590, avgPlayLevel: 1998, lost: 0, 
	   compplaypoints: 23206, Chands: 9590, Ccribs: 4795, comphandpoints: 47478, 
	   winDelta: 31968, won: 999, playpoints: 26231, compcribpoints: 18227, 
	   cribpoints: 19220, handpoints: 75428, shorthands: 0};
      Pgroup = new Element('div',{'id':Pdata.name+'PG','class':'palm-group'});
      $("statDataArea").appendChild(Pgroup);
      PgroupTitle = new Element('div',{'id':Pdata.name+'PGT','class':'palm-group-title'});
      Pgroup.appendChild(PgroupTitle);
      PgroupTitle.innerHTML = $L("Stats for #{name}").interpolate({name:Pdata.name});
      // PgroupTitle.innerHTML = 'Stats for '+Pdata.name;
      PList  = new Element('div',{'id':Pdata.name+'PL','class':'palm-list'});
      PRowSingle  = new Element('div',{'id':Pdata.name+'PRS','class':'palm-row single'});
      PRowWrap  = new Element('div',{'id':Pdata.name+'PRW','class':'palm-row-wrapper'});
      // PRowText  = new Element('div',{'id':Pdata.name+'PRT','class':'palm-body-text'});
      PRowText  = new Element('div',{'id':Pdata.name+'PRT','class':'palm-body-text','style':'font-size:14px;text-align:justify'});
      Pgroup.appendChild(PList);
      PList.appendChild(PRowSingle);
      PRowSingle.appendChild(PRowWrap);
      PRowWrap.appendChild(PRowText);
      
      PRowText.innerHTML = this.showTable(dataset);
   }
};


StatsAssistant.prototype.popupper = function(event) {
   // Mojo.Log.info("Data: ",event.target.id);
   this.pName = event.target.id.split("-")[0];
   
   this.controller.popupSubmenu({onChoose:this.popupChooser,
      placeNear:event.target,
      items:
      [{label:"Hand stats", command: this.pName+"-hand"},
       {label:"Crib stats", command: this.pName+"-crib"},
       {label:"Score as dealer", command: this.pName+"-dealer"},
       {label:"Score as pone", command: this.pName+"-pone"}]
   });
};


StatsAssistant.prototype.popupChooser = function(value) {
   if (value != undefined) {
      if (value.split("-").length == 2) {
	 pName = value.split("-")[0];
	 dataSet = value.split("-")[1];
      } else {
	 pName = this.game.gamePrefs.playerName;
	 dataSet = "hand";
      }
      
      Mojo.Controller.stageController.pushScene({name:"Graph",disableSceneScroller: false}, pName, dataSet);
   }
};


StatsAssistant.prototype.handleCommand = function(event) {
   if (event.type === Mojo.Event.command) {
      switch (event.command) {
       case 'newGame':
	 this.game = new Game(new pribDataStorage());
	 this.game.checkPrefCookie();
	 this.game.setGamePrefs();
	 /* this.game.gameLevel = this.game.gamePrefs.playDifficulty;
	 this.game.shortGame = this.game.gamePrefs.shortGame;
	 this.game.fiveCardGame = this.game.gamePrefs.fiveCardGame;
	 this.game.manScore = this.game.gamePrefs.manScore;
	 this.game.muggins = this.game.gamePrefs.muggins; */
	 Mojo.Controller.stageController.swapScene({name:"Game",disableSceneScroller: true}, this.game);
	 break;
       case 'lessStats':
	 Mojo.Controller.stageController.swapScene({name:"finale",disableSceneScroller: false});
	 break;
      }
   }
}


StatsAssistant.prototype.showTable = function(dataset) {
   tableBlob = '';
   
   if (dataset.handpointsArr) {
      pHandStat = AvgStdDev(dataset.handpointsArr);
   } else {
      pHandStat = [0,0,0,0];
   }
   
   if (dataset.cribpointsArr) {
      pCribStat = AvgStdDev(dataset.cribpointsArr);
   } else {
      pCribStat = [0,0,0,0];
   }
   
   if (dataset.playpointsArr) {
      pPlayStat = AvgStdDev(dataset.playpointsArr);
   } else {
      pPlayStat = [0,0,0,0];
   }
   
   if (dataset.comphandpointsArr) {
      cHandStat = AvgStdDev(dataset.comphandpointsArr);
   } else {
      cHandStat = [0,0,0,0];
   }
   if (dataset.compcribpointsArr) {
      cCribStat = AvgStdDev(dataset.compcribpointsArr);
   } else {
      cCribStat = [0,0,0,0];
   }
   if (dataset.compplaypointsArr) {
      cPlayStat = AvgStdDev(dataset.compplaypointsArr);
   } else {
      cPlayStat = [0,0,0,0];
   }
      
   totalPointsNew = pHandStat[0] + pCribStat[0] + pPlayStat[0];
   totalPointsCompNew = cHandStat[0] + cCribStat[0] + cPlayStat[0];
   totalPointsOld = parseInt(dataset.handpoints)+parseInt(dataset.cribpoints)+parseInt(dataset.playpoints);
   totalPointsCompOld = parseInt(dataset.comphandpoints)+parseInt(dataset.compcribpoints)+parseInt(dataset.compplaypoints);
   totalPoints = totalPointsNew + totalPointsOld;
   totalPointsComp = totalPointsCompNew + totalPointsCompOld;
   
   tableBlob += '<table class="stats" width=100% border=3>';
   tableBlob += '<tr><td class="stats" width=40%></td><td class="stats" width=30%><IMG SRC=images/playerIcon32.png></td><td class="stats" width=30%><IMG SRC=images/compIcon32.png></td></tr>';
   tableBlob += '<tr><td class="stats">'+$L("Games played")+'</td><td class="stats" colspan=2>'+(dataset.games+dataset.shortgames)+'</td></tr>';
   wonPerc = 100.0*dataset.won/(dataset.games+dataset.shortgames);
   lostPerc = 100.0*dataset.lost/(dataset.games+dataset.shortgames);
   tableBlob += '<tr><td class="stats">'+$L("Games won")+'</td><td class="stats">'+dataset.won+' ('+Mojo.Format.formatNumber(wonPerc,1)+'%)</td><td class="stats">'+dataset.lost+' ('+Mojo.Format.formatNumber(lostPerc,1)+'%)</td></tr>';
   
   if (dataset.skunks || dataset.skunked) {
      tableBlob += '<tr><td class="stats">'+$L("Skunks")+'</td><td class="stats">'+dataset.skunks+'</td><td class="stats">'+dataset.skunked+'</td></tr>';
   }
   
   if (dataset.Pcutwins+dataset.Ccutwins > 0) {
      playerCutWins = 100.*dataset.Pcutwins/(dataset.Pcutwins+dataset.Ccutwins);
      compCutWins = 100.*dataset.Ccutwins/(dataset.Pcutwins+dataset.Ccutwins);
   } else {
      playerCutWins = 0.0;
      compCutWins = 0.0;
   }
   tableBlob += '<tr><td class="stats">'+$L("First crib")+'</td><td class="stats">'+Mojo.Format.formatNumber(playerCutWins,1)+'%</td><td class="stats">'+Mojo.Format.formatNumber(compCutWins,1)+'%</td></tr>';
   
   if (dataset.games > 0) {
      handsPerGame = (1.0*dataset.hands/dataset.games);
      tableBlob += '<tr><td class="stats">'+$L("# hands / #{pnt}-pt game").interpolate({pnt:'121'})+'</td><td class="stats" colspan=2>'+Mojo.Format.formatNumber(handsPerGame,2)+'</td></tr>';
   }
   if (dataset.shortgames > 0) {
      handsPerShortGame = (1.0*dataset.shorthands/dataset.shortgames);
      tableBlob += '<tr><td class="stats">'+$L("# hands / #{pnt}-pt game").interpolate({pnt:'61'})+'</td><td class="stats" colspan=2>'+Mojo.Format.formatNumber(handsPerShortGame,2)+'</td></tr>';
   }
   
   tableBlob += '<tr><td class="stats">'+$L("Total points")+'</td><td class="stats">'+totalPoints+'</td><td class="stats">'+totalPointsComp+'</td></tr>';
   
   if (dataset.PwinStreak || dataset.CwinStreak) {
      if (dataset.PwinStreak > 11) {
	 tableBlob += '<tr><td class="stats">'+$L("Current winning streak")+'</td><td class="stats">'+dataset.PwinStreak+'</td><td class="stats">&Oslash;</td></tr>';
      } else if (dataset.PwinStreak > 1) {
	 tableBlob += '<tr><td class="stats">'+$L("Current winning streak")+'</td><td class="stats">'+dataset.PwinStreak+'</td><td class="stats">&Oslash;</td></tr>';
      } else if (dataset.CwinStreak > 11) {
	 tableBlob += '<tr><td class="stats">'+$L("Current winning streak")+'</td><td class="stats">Not so good at this, eh?</td><td class="stats">'+dataset.CwinStreak+'</td></tr>';
      } else if (dataset.CwinStreak > 1) {
	 tableBlob += '<tr><td class="stats">'+$L("Current winning streak")+'</td><td class="stats">&Oslash;</td><td class="stats">'+dataset.CwinStreak+'</td></tr>';
      }
   }
   if (dataset.PwinStreakRecord && dataset.CwinStreakRecord) {
      if (dataset.PwinStreakRecord > 2 || dataset.CwinStreakRecord > 2) {
	 tableBlob += '<tr><td class="stats">'+$L("Best winning streak")+'</td><td class="stats">'+dataset.PwinStreakRecord+'</td><td class="stats">'+dataset.CwinStreakRecord+'</td></tr>';
      }
   }
   
   var handPoints = compHandPoints = 0;
   if ((dataset.Phands+pHandStat[1]) > 0) {
      handPoints = (1.0*(dataset.handpoints+pHandStat[0])/(dataset.Phands+pHandStat[1]));
   }
   if ((dataset.Chands+cHandStat[1]) > 0) {
      compHandPoints = (1.0*(dataset.comphandpoints+cHandStat[0])/(dataset.Chands+cHandStat[1]));
   }
   tableBlob += '<tr><td class="stats">'+$L("Points per hand")+'</td><td class="stats">'+Mojo.Format.formatNumber(handPoints,2)+'</td><td class="stats">'+Mojo.Format.formatNumber(compHandPoints,2)+'</td></tr>';

   var cribPoints = compCribPoints = 0;
   if ((dataset.Pcribs+pCribStat[1]) > 0) {
      cribPoints = (1.0*(dataset.cribpoints+pCribStat[0])/(dataset.Pcribs+pCribStat[1]));
   }
   if ((dataset.Ccribs+cCribStat[1]) > 0) {
      compCribPoints = (1.0*(dataset.compcribpoints+cCribStat[0])/(dataset.Ccribs+cCribStat[1]));
   }
   tableBlob += '<tr><td class="stats">'+$L("Points per crib")+'</td><td class="stats">'+Mojo.Format.formatNumber(cribPoints,2)+'</td><td class="stats">'+Mojo.Format.formatNumber(compCribPoints,2)+'</td></tr>';

   var playPoints = compPlayPoints = 0;
   if ((pPlayStat[1]) > 0) {
      playPoints = (1.0*(pPlayStat[0])/(pPlayStat[1]));
   }
   if ((cPlayStat[1]) > 0) {
      compPlayPoints = (1.0*(cPlayStat[0])/(cPlayStat[1]));
   }
   if (playPoints > 0 || compPlayPoints > 0) {
      tableBlob += '<tr><td class="stats">'+$L("Points per play")+'</td><td class="stats">'+Mojo.Format.formatNumber(playPoints,2)+'</td><td class="stats">'+Mojo.Format.formatNumber(compPlayPoints,2)+'</td></tr>';
   }
   
   if (totalPoints > 0 && totalPointsComp > 0) {
      handPointsPer = (100.0*(dataset.handpoints+pHandStat[0])/totalPoints);
      compHandPointsPer = (100.0*(dataset.comphandpoints+cHandStat[0])/totalPointsComp);
      tableBlob += '<tr><td class="stats">% '+$L("hand")+'</td><td class="stats">'+Mojo.Format.formatNumber(handPointsPer,1)+'%</td><td class="stats">'+Mojo.Format.formatNumber(compHandPointsPer,1)+'%</td></tr>';
   }
   if (totalPoints > 0 && totalPointsComp > 0) {
      cribPointsPer = (100.0*(dataset.cribpoints+pCribStat[0])/totalPoints);
      compcribPointsPer = (100.0*(dataset.compcribpoints+cCribStat[0])/totalPointsComp);
      tableBlob += '<tr><td class="stats">% '+$L("crib")+'</td><td class="stats">'+Mojo.Format.formatNumber(cribPointsPer,1)+'%</td><td class="stats">'+Mojo.Format.formatNumber(compcribPointsPer,1)+'%</td></tr>';
   }
   if (totalPoints > 0 && totalPointsComp > 0) {
      playPointsPer = (100.0*(dataset.playpoints+pPlayStat[0])/totalPoints);
      compplayPointsPer = (100.0*(dataset.compplaypoints+cPlayStat[0])/totalPointsComp);
      tableBlob += '<tr><td class="stats">% '+$L("play")+'</td><td class="stats">'+Mojo.Format.formatNumber(playPointsPer,1)+'%</td><td class="stats">'+Mojo.Format.formatNumber(compplayPointsPer,1)+'%</td></tr>';
   }
   if (dataset.won > 0) {
      wonBy = Mojo.Format.formatNumber(1.0*dataset.winDelta/dataset.won,2);
   } else {
      wonBy = $L("N/A");
   }
   if (dataset.lost > 0) {	 
      lostBy = Mojo.Format.formatNumber(1.0*dataset.loseDelta/dataset.lost,2);
   } else {
      lostBy = $L("N/A");
   }
   tableBlob += '<tr><td class="stats">'+$L("Point spread at win")+'</td><td class="stats">'+(wonBy)+'</td><td class="stats">'+(lostBy)+'</td></tr>';
   
   // aPL = Mojo.Format.formatNumber(1.0*dataset.avgPlayLevel/(dataset.games+dataset.shortgames),1);
   // tableBlob += '<tr><td class="stats">Average play level</td><td class="stats" colspan=2>'+aPL+'/2.0</td></tr>';
   tableBlob += '</table>';

   return tableBlob;
}


StatsAssistant.prototype.moveScreenUp = function() {
   this.controller.getSceneScroller().mojo.scrollTo(0,-50,1);
}

