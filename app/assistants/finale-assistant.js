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


function FinaleAssistant() {
   this.db = new pribDataStorage();
   this.game = new Game(this.db);
   this.game.checkPrefCookie();
   this.game.backgroundCanvas();
}

FinaleAssistant.prototype.setup = function() {
   
   if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
      // Mojo.Log.info("I am on a pixi");
      this.game.palmType = 'pixi';
   }	
   if (this.game.gamePrefs.backGroundColor) {
      // $("finale").setStyle({'background-color':this.game.gamePrefs.backGroundColor});
      $("finalTableTop").setStyle({'background-color':this.game.gamePrefs.backGroundColor});
      $("finalTableBottom").setStyle({'background-color':this.game.gamePrefs.backGroundColor});
   }
   
   
   this.index = 0;
   this.skunk = new Image();
   this.skunk.src = 'images/skunk50.png';
   this.skunk.height = '32';
   this.skunk2 = new Image();
   this.skunk2.src = 'images/skunk50.png';
   this.skunk2.height = '32';
   
   // set up top table
   this.tableTop = this.controller.get('finalTableTop');
   this.tableTopRow = [];
   this.tableTopCell = [];
   for (i=0; i< 5; i++) {
      this.tableTopRow[i] = new Element('div',{'id':'tableTopRow'+i,'class':'finaltableRow'});
      this.tableTop.appendChild(this.tableTopRow[i]);
      this.tableTopCell[i] = [];
      for (j=0; j< 2; j++) {
	 this.tableTopCell[i][j] = new Element('div',{'id':'tableTopCell'+i+j,'class':'finaltableCell'});
	 this.tableTopRow[i].appendChild(this.tableTopCell[i][j]);
	 // this.tableTopCell[i][j].innerHTML = ''+i+j;
      }
   }
   this.tableBottom = this.controller.get('finalTableBottom');
   this.tableBottomRow = [];
   this.tableBottomCell = [];
   // this.tableBottomRow[0] = new Element('div',{'id':'tableBottomRow0','class':'finaltableRow'});
   // this.tableBottom.appendChild(this.tableBottomRow[0]);
   // this.tableBottomRow[0].innerHTML = 'Scores';
   for (i=0; i< 6; i++) {
      this.tableBottomRow[i] = new Element('div',{'id':'tableBottomRow'+i,'class':'finaltableRow'});
      this.tableBottom.appendChild(this.tableBottomRow[i]);
      this.tableBottomCell[i] = [];
      for (j=0; j< 3; j++) {
	 this.tableBottomCell[i][j] = new Element('div',{'id':'tableBottomCell'+i+j,'class':'finaltableCell'});
	 this.tableBottomRow[i].appendChild(this.tableBottomCell[i][j]);
	 // this.tableBottomCell[i][j].innerHTML = ''+i+j;
      }
   }
   
   this.game.cmdMenuModel = {
      visible: true,
	items: [{label: $L("Play Game"),command:'newGame'},
		{label: $L("Stats"),command:'moreStats'},
		{items:[{icon: 'back',command:'back'},{icon: 'forward',command:'forward'}]}
		]
   };
   this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.game.cmdMenuModel);

   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);   
}

FinaleAssistant.prototype.activate = function(event) {
   /* put in event handlers here that should only be in effect when this scene is active. For
    example, key handlers that are observing the document */
   
   
   $("loadingData").setStyle({'left':'50px','top':'105px'});
   $("loadingData").innerHTML = $L("Loading data. Please wait...");
   $('finalScrim').show();
   
   $("finaleTitle").innerHTML = $L("Final Score");
   
   this.loadGameData();
   
   // this.game.loadWins(this.showGameStats.bind(this,this.index));
   
   this.tableTopCell[0][0].innerHTML = $L("Date played:");
   this.tableTopCell[1][0].innerHTML = $L("First dealer:");
   this.tableTopCell[2][0].innerHTML = $L("Winner:");
   this.tableTopCell[3][0].innerHTML = $L("Number of hands:");
   this.tableTopCell[4][0].innerHTML = $L("Level of play:");
   this.tableBottomCell[0][0].innerHTML = $L("Scores:");
   this.tableBottomCell[0][0].setStyle({'font-size':'18px','font-style':'bold'});
   this.tableBottomCell[0][2].innerHTML = '<IMG SRC=images/compIcon32.png>';
   this.tableBottomCell[0][1].innerHTML = '<IMG SRC=images/playerIcon32.png>';
   this.tableBottomCell[1][0].innerHTML = $L("Hand: ");
   this.tableBottomCell[2][0].innerHTML = $L("Crib: ");
   this.tableBottomCell[3][0].innerHTML = $L("Play: ");
   this.tableBottomCell[4][0].setStyle({'fontStyle': 'bold'});
   this.tableBottomCell[4][0].innerHTML = $L("Total: ");
   
   
}


FinaleAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

FinaleAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}

FinaleAssistant.prototype.moveScreenUp = function() {
   this.controller.getSceneScroller().mojo.scrollTo(0,-50,1);
}

FinaleAssistant.prototype.handleCommand = function(event) {
   numWins = this.game.winData.length;
   
   if (event.type === Mojo.Event.command) {
      switch (event.command) {
       case 'forward':
	 // $('finalScrim').show();
	 if (this.gameDate) {
	    tmpData = this.gameDate.pop();
	    this.gameDate.unshift(tmpData);
	    var gD = this.gameDate.length;
	    lastPlayDate = this.gameDate[gD-1].playdate;
	    // Mojo.Log.info('Date: ', lastPlayDate);
	    this.game.loadSingleWin(this.showSingleGameStat.bind(this),lastPlayDate);
	 }
	 break;
       case 'back':
	 // $('finalScrim').show();
	 if (this.gameDate) {
	    tmpData = this.gameDate.shift();
	    this.gameDate.push(tmpData);
	    var gD = this.gameDate.length;
	    lastPlayDate = this.gameDate[gD-1].playdate;
	    // Mojo.Log.info('Date: ', lastPlayDate);
	    this.game.loadSingleWin(this.showSingleGameStat.bind(this),lastPlayDate);
	 }
	 break;
       case 'newGame':
	 this.game = new Game(new pribDataStorage());
	 this.game.checkPrefCookie();
	 this.game.setGamePrefs();
	 Mojo.Controller.stageController.swapScene({name:"Game",disableSceneScroller: true}, this.game);
	 break;
       case 'moreStats':
	 Mojo.Controller.stageController.swapScene({name:"Stats",disableSceneScroller: false});
	 break;
      }
   }
}


FinaleAssistant.prototype.loadGameData = function() {
   // this.game.loadWins(this.showGameStats.bind(this,this.index));
   this.game.loadGameDates(this.oneGameAtATime.bind(this));
}

FinaleAssistant.prototype.oneGameAtATime = function(gameDate) {
   var lastPlayDate = '';
   if (gameDate.length > 0) {
      this.gameDate = gameDate;
      var gD = this.gameDate.length;
      lastPlayDate = this.gameDate[gD-1].playdate;
      this.game.loadSingleWin(this.showSingleGameStat.bind(this),lastPlayDate);
   } else {
      $('finalScrim').hide();
      $("finaleTitle").innerHTML = $L("Go play a game!");
      this.gameDate = 0;
   }
}

FinaleAssistant.prototype.showSingleGameStat = function() {
   $('finalScrim').hide();
   
   var num = 0;
   if (this.game.winData.length > 0) {
      lastGameData = this.game.winData[num];
      
      while (this.tableBottomCell[5][1].lastChild) {
	 this.tableBottomCell[5][1].lastChild.remove();
      }
      while (this.tableBottomCell[5][2].lastChild) {
	 this.tableBottomCell[5][2].lastChild.remove();
      }
      
      var winner = '';
      if (lastGameData.playerScore == 121 
	  || (lastGameData.playerScore == 61
	      && lastGameData.shortGame)) {
	 winner = lastGameData.playerName;
	 if (lastGameData.playerScore - lastGameData.computerScore > 60) {
	    this.tableBottomCell[5][2].appendChild(this.skunk);
	    this.tableBottomCell[5][2].appendChild(this.skunk2);
	 } else if (lastGameData.playerScore - lastGameData.computerScore > 30) {
	    this.tableBottomCell[5][2].appendChild(this.skunk);
	 }
      } else if (lastGameData.computerScore == 121
		 || (lastGameData.computerScore == 61
		     && lastGameData.shortGame)) {
	 winner = $L("computer");
	 if (lastGameData.computerScore - lastGameData.playerScore > 60) {
	    this.tableBottomCell[5][1].appendChild(this.skunk);
	    this.tableBottomCell[5][1].appendChild(this.skunk2);
	 } else if (lastGameData.computerScore - lastGameData.playerScore > 30) {
	    this.tableBottomCell[5][1].appendChild(this.skunk);
	 }
      } else {
	 winner = "unknown!";
      }
      
      if (lastGameData.cutWinner == 'computer') {
	 cutWinnerL18n = $L("computer");
      } else {
	 cutWinnerL18n = lastGameData.cutWinner;
      }
      
      datePlayed = new Date(lastGameData.playdate);
      formattedDate = Mojo.Format.formatDate(datePlayed, {date:"medium"});
      
      this.tableTopCell[0][1].innerHTML = formattedDate;
      this.tableTopCell[1][1].innerHTML = cutWinnerL18n;
      this.tableTopCell[2][1].innerHTML = winner;
      this.tableTopCell[3][1].innerHTML = lastGameData.numHands;
      switch (parseInt(lastGameData.gameLevel)) {
       case 0:
	 gameLevel = $L("Easy");
	 break;
       case 1:
	 gameLevel = $L("Standard");
	 break;
       default:
       case 2:
	 gameLevel = $L("Difficult");
	 break;
      }
      this.tableTopCell[4][1].innerHTML = gameLevel;
      
      if (lastGameData.playerHandScore) {
	 var score = AvgStdDev(lastGameData.playerHandScore);
	 pHandPercent = 100.*(score[0]/lastGameData.playerScore);
      } else {
	 pHandPercent = 0.0;
      }
      if (lastGameData.computerHandScore) {
	 var score = AvgStdDev(lastGameData.computerHandScore);
	 cHandPercent = 100.*(score[0]/lastGameData.computerScore);
      } else {
	 cHandPercent = 0.0;
      }
      if (lastGameData.playerCribScore) {
	 var score = AvgStdDev(lastGameData.playerCribScore);
	 pCribPercent = 100.*(score[0]/lastGameData.playerScore);
      } else {
	 pCribPercent = 0.0;
      }
      if (lastGameData.computerCribScore) {
	 var score = AvgStdDev(lastGameData.computerCribScore);
	 cCribPercent = 100.*(score[0]/lastGameData.computerScore);
      } else {
	 cCribPercent = 0.0;
      }
      if (lastGameData.playerPlayScore) {
	 var score = AvgStdDev(lastGameData.playerPlayScore);
	 pPlayPercent = 100.*(score[0]/lastGameData.playerScore);
      } else {
	 pPlayPercent = 0.0;
      }
      if (lastGameData.computerPlayScore) {
	 var score = AvgStdDev(lastGameData.computerPlayScore);
	 cPlayPercent = 100.*(score[0]/lastGameData.computerScore);
      } else {
	 cPlayPercent = 0.0;
      }
      
      this.tableBottomCell[1][1].innerHTML = AvgStdDev(lastGameData.playerHandScore)[0] + ' ('+pHandPercent.toFixed(1)+'%)';
      this.tableBottomCell[1][2].innerHTML = AvgStdDev(lastGameData.computerHandScore)[0] + ' ('+cHandPercent.toFixed(1)+'%)';
      this.tableBottomCell[2][1].innerHTML = AvgStdDev(lastGameData.playerCribScore)[0] + ' ('+pCribPercent.toFixed(1)+'%)';
      this.tableBottomCell[2][2].innerHTML = AvgStdDev(lastGameData.computerCribScore)[0] + ' ('+cCribPercent.toFixed(1)+'%)';
      this.tableBottomCell[3][1].innerHTML = AvgStdDev(lastGameData.playerPlayScore)[0] + ' ('+pPlayPercent.toFixed(1)+'%)';
      this.tableBottomCell[3][2].innerHTML = AvgStdDev(lastGameData.computerPlayScore)[0] + ' ('+cPlayPercent.toFixed(1)+'%)';
      this.tableBottomCell[4][1].innerHTML = lastGameData.playerScore;
      this.tableBottomCell[4][2].innerHTML = lastGameData.computerScore;
   }
   if (this.game.palmType == 'pixi') {
      setTimeout(this.moveScreenUp.bind(this),600);
   }
   
} 


