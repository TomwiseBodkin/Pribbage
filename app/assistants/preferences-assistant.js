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

function PreferencesAssistant(myGame) {
   this.game = myGame;
}

PreferencesAssistant.prototype.setup = function() {
   this.shortGameModel = {value:this.game.gamePrefs.shortGame,disabled:false};
   this.controller.setupWidget("shortGame", {}, this.shortGameModel);
   
   this.loserDealModel = {value:this.game.gamePrefs.loserDeal,disabled:false};
   this.controller.setupWidget("loserDeal", {}, this.loserDealModel);
   
   this.fiveCardGameModel = {value:this.game.gamePrefs.fiveCardGame,disabled:false};
   this.controller.setupWidget("fiveCardGame", {}, this.fiveCardGameModel);
   
   this.manScoreModel = {value:this.game.gamePrefs.manScore,disabled:false};
   this.controller.setupWidget("manScore", {}, this.manScoreModel);
   
   this.mugginsModel = {value:this.game.gamePrefs.muggins,disabled:true};
   this.controller.setupWidget("muggins", {}, this.mugginsModel);
   
   /* this.cheatCount = 0;
   this.cheatModeModel = {value: false};
   this.controller.setupWidget("cheatMode", {}, this.cheatModeModel);
   */
   this.autoDealModel = {value:this.game.gamePrefs.autoDeal};
   this.controller.setupWidget("autoDeal", {}, this.autoDealModel);
   
   this.autoScoreModel = {value:this.game.gamePrefs.autoScore};
   this.controller.setupWidget("autoScore", {}, this.autoScoreModel);
   
   this.useAnimationModel = {value:this.game.gamePrefs.useAnimation};
   this.controller.setupWidget("useAnimation", {}, this.useAnimationModel);
   
   this.playerNameAttributes = {hintText:$L("Player name"),
	multiline: false, maxLength: 15
   };
   this.playerNameModel = {value:this.game.gamePrefs.playerName}; 
   this.controller.setupWidget("playerName", 
			       this.playerNameAttributes, 
			       this.playerNameModel);
   
   this.playLevelAttributes = {label: $L("Play Level"),
      choices:[{label:$L("Gentle"),value:0},
	       {label:$L("Standard"),value:1},
	       {label:$L("Lumberjack"),value:2}]};
   this.playLevelModel = {value:this.game.gamePrefs.playDifficulty,disabled:false};
   this.controller.setupWidget("playLevel", this.playLevelAttributes, this.playLevelModel);

   this.cardBackColorAttributes = {label: $L("Card"),
      choices:[
	       {label:$L("Blue"),value:"#2A52BE"},
	       {label:$L("Grey"),value:"#808080"},
	       {label:$L("Green"),value:"#99FF99"},
	       {label:$L("Green")+"2",value:"#7DC77F"},
	       {label:$L("Orange"),value:"#EE8800"},
	       {label:$L("Red"),value:"#E34234"},
	       {label:$L("Yellow"),value:"#FFDD33"},
	       {label:$L("Random"),value:this.randomColor()},
	       {label:$L("User defined"),value:"userDefined"}
	      ]};

   this.cardBackColorModel = {value:this.game.gamePrefs.cardBackColor,disabled:false};
   this.controller.setupWidget("cardBackColor", this.cardBackColorAttributes, this.cardBackColorModel);
   
   this.backGroundColorAttributes = {label: $L("Background"),
      choices:[
	       {label:$L("Blue"),value:"#6699DD"},
	       {label:$L("Blue")+"2",value:"#7CBFB8"},
	       {label:$L("Brown"),value:"#DDBB88"},
	       {label:$L("Grey"),value:"#91A3B0"},
	       {label:$L("Grey")+"2",value:"#8E899A"},
	       {label:$L("Green"),value:"#66cc66"},
	       {label:$L("Lilac"),value:"#C8A2C8"},
	       {label:$L("Orange"),value:"#FFAA11"},
	       {label:$L("Red"),value:"#FF6347"},
	       {label:$L("Yellow"),value:"#FBEC5D"},
	       {label:$L("Random"),value:this.randomColor()},
	       {label:$L("User defined"),value:"userDefined"}
	      ]};
   this.backGroundColorModel = {value:this.game.gamePrefs.backGroundColor,disabled:false};
   this.controller.setupWidget("backGroundColor", this.backGroundColorAttributes, this.backGroundColorModel);
   
   this.playerPegColorAttributes = {label: $L("Player"),
      choices:[
	       {label:$L("Blue"),value:'#1e90ff,blue'},
	       {label:$L("Green"),value:'#32CD32,green'},
	       {label:$L("Red"),value:'#dc143c,#b22222'},
	       {label:$L("Gold"),value:'#FFD700,#DAA520'},
	       {label:$L("Silver"),value:'#C0C0C0,#708090'}
	      ]};

   this.playerPegColorModel = {value:this.game.playerPegColors,disabled:false};
   this.controller.setupWidget("playerPegColor", this.playerPegColorAttributes, this.playerPegColorModel);
   
   this.computerPegColorAttributes = {label: $L("Computer"),
      choices:[
	       {label:$L("Blue"),value:'#1e90ff,blue'},
	       {label:$L("Green"),value:'#32CD32,green'},
	       {label:$L("Red"),value:'#dc143c,#b22222'},
	       {label:$L("Gold"),value:'#FFD700,#DAA520'},
	       {label:$L("Silver"),value:'#C0C0C0,#708090'}
	      ]};

   this.computerPegColorModel = {value:this.game.computerPegColors,disabled:false};
   this.controller.setupWidget("computerPegColor", this.computerPegColorAttributes, this.computerPegColorModel);
   
   
   this.resetWinsModel = {label: $L("Purge game stats"),buttonClass:"palm-button negative",disabled:false};
   this.controller.setupWidget("resetWins", {}, this.resetWinsModel);
   this.resetHandsModel = {label: $L("Purge high scores"),buttonClass:"palm-button negative",disabled:false};
   this.controller.setupWidget("resetHands", {}, this.resetHandsModel);
   this.resetStatsModel = {label: $L("Purge player stats"),buttonClass:"palm-button negative",disabled:false};
   this.controller.setupWidget("resetStats", {}, this.resetStatsModel);
   this.backupDBModel = {label: $L("DB backup"),buttonClass:"palm-button",disabled:true};
   this.controller.setupWidget("backupDB", {}, this.backupDBModel);
   this.restoreDBModel = {label: $L("DB restore"),buttonClass:"palm-button",disabled:true};
   this.controller.setupWidget("restoreDB", {}, this.restoreDBModel);

   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);
}

PreferencesAssistant.prototype.aboutToActivate = function(event) {
   $("prefTitle").innerHTML = $L("Preferences");
   $("prefGroup1").innerHTML = $L("Play Settings");
   $("prefDisclaim").innerHTML = $L("Options seem to behave on some days and are dysfunctional on the rest. That is to say: they work for me, but your mileage may vary. Except muggins: it is banned for now.");
   $("playerNameLabel").innerHTML = $L("Enter player's name");
   $("loserDealTitle").innerHTML = $L("Loser deals first");
   $("shortGameTitle").innerHTML = $L("61-point game");
   $("fiveCardGameTitle").innerHTML = $L("5-card cribbage");
   $("manScoreTitle").innerHTML = $L("Manual scoring");
   $("mugginsTitle").innerHTML = $L("Muggins");
   $("autoDealTitle").innerHTML = $L("Auto-deal");
   $("autoScoreTitle").innerHTML = $L("Auto-score");
   $("useAnimationTitle").innerHTML = $L("Animation");
   $("colorGroup").innerHTML = $L("Colors");
   $("prefGroup2").innerHTML = $L("Database manipulations");
   $("prefButtonDisclaim").innerHTML = $L("WARNING: The big, shiny, red buttons below will erase all your data from previous games and/or erase all your saved high score hands and/or cause a chrono-synclastic infundibulum to appear. Please use with care.");
}


PreferencesAssistant.prototype.activate = function(event) {
   this.game.checkPrefCookie();
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   
   this.nameChangeHandler = this.nameChange.bind(this);
   this.loserDealChangeHandler = this.loserDealChange.bind(this);
   this.shortGameChangeHandler = this.shortGameChange.bind(this);
   this.manScoreChangeHandler = this.manScoreChange.bind(this);
   this.fiveCardGameChangeHandler = this.fiveCardGameChange.bind(this);
   this.mugginsChangeHandler = this.mugginsChange.bind(this);
   this.autoDealChangeHandler = this.autoDealChange.bind(this);
   this.autoScoreChangeHandler = this.autoScoreChange.bind(this);
   this.useAnimationChangeHandler = this.useAnimationChange.bind(this);
   this.playLevelChangeHandler = this.playLevelChange.bind(this);
   this.cardBackColorChangeHandler = this.cardBackColorChange.bind(this);
   this.backGroundColorChangeHandler = this.backGroundColorChange.bind(this);
   this.playerPegColorChangeHandler = this.playerPegColorChange.bind(this);
   this.computerPegColorChangeHandler = this.computerPegColorChange.bind(this);
   // this.cheatModeHandler = this.cheatMode.bind(this);
   this.clearWinsHandler = this.clearWinsAsk.bind(this);
   this.clearHandsHandler = this.clearHandsAsk.bind(this);
   this.clearStatsHandler = this.clearStatsAsk.bind(this);
   this.backupDBHandler = this.backupDBAsk.bind(this);
   this.restoreDBHandler = this.restoreDBAsk.bind(this);
   
   Mojo.Event.listen(this.controller.get("playerName"),Mojo.Event.propertyChange,this.nameChangeHandler);
   Mojo.Event.listen(this.controller.get("loserDeal"),Mojo.Event.propertyChange,this.loserDealChangeHandler);
   Mojo.Event.listen(this.controller.get("shortGame"),Mojo.Event.propertyChange,this.shortGameChangeHandler);
   Mojo.Event.listen(this.controller.get("manScore"),Mojo.Event.propertyChange,this.manScoreChangeHandler);
   Mojo.Event.listen(this.controller.get("fiveCardGame"),Mojo.Event.propertyChange,this.fiveCardGameChangeHandler);
   Mojo.Event.listen(this.controller.get("muggins"),Mojo.Event.propertyChange,this.mugginsChangeHandler);
   Mojo.Event.listen(this.controller.get("autoDeal"),Mojo.Event.propertyChange,this.autoDealChangeHandler);
   Mojo.Event.listen(this.controller.get("autoScore"),Mojo.Event.propertyChange,this.autoScoreChangeHandler);
   Mojo.Event.listen(this.controller.get("useAnimation"),Mojo.Event.propertyChange,this.useAnimationChangeHandler);
   Mojo.Event.listen(this.controller.get("playLevel"),Mojo.Event.propertyChange,this.playLevelChangeHandler);
   Mojo.Event.listen(this.controller.get("cardBackColor"),Mojo.Event.propertyChange,this.cardBackColorChangeHandler);
   Mojo.Event.listen(this.controller.get("backGroundColor"),Mojo.Event.propertyChange,this.backGroundColorChangeHandler);
   Mojo.Event.listen(this.controller.get("playerPegColor"),Mojo.Event.propertyChange,this.playerPegColorChangeHandler);
   Mojo.Event.listen(this.controller.get("computerPegColor"),Mojo.Event.propertyChange,this.computerPegColorChangeHandler);
   // Mojo.Event.listen(this.controller.get("cheatMode"),Mojo.Event.propertyChange,this.cheatModeHandler);
   Mojo.Event.listen(this.controller.get("resetWins"),Mojo.Event.tap,this.clearWinsHandler);
   Mojo.Event.listen(this.controller.get("resetHands"),Mojo.Event.tap,this.clearHandsHandler);
   Mojo.Event.listen(this.controller.get("resetStats"),Mojo.Event.tap,this.clearStatsHandler);
   Mojo.Event.listen(this.controller.get("backupDB"),Mojo.Event.tap,this.backupDBHandler);
   Mojo.Event.listen(this.controller.get("restoreDB"),Mojo.Event.tap,this.restoreDBHandler);
   
   // $("").innerHTML = $L("");
}


PreferencesAssistant.prototype.deactivate = function(event) {
   this.game.writePrefCookie();
   
   Mojo.Event.stopListening(this.controller.get("playerName"),Mojo.Event.propertyChange,this.nameChangeHandler);
   Mojo.Event.stopListening(this.controller.get("loserDeal"),Mojo.Event.propertyChange,this.loserDealChangeHandler);
   Mojo.Event.stopListening(this.controller.get("shortGame"),Mojo.Event.propertyChange,this.shortGameChangeHandler);
   Mojo.Event.stopListening(this.controller.get("fiveCardGame"),Mojo.Event.propertyChange,this.fiveCardGameChangeHandler);
   Mojo.Event.stopListening(this.controller.get("manScore"),Mojo.Event.propertyChange,this.manScoreChangeHandler);
   Mojo.Event.stopListening(this.controller.get("muggins"),Mojo.Event.propertyChange,this.mugginsChangeHandler);
   Mojo.Event.stopListening(this.controller.get("autoDeal"),Mojo.Event.propertyChange,this.autoDealChangeHandler);
   Mojo.Event.stopListening(this.controller.get("autoScore"),Mojo.Event.propertyChange,this.autoScoreChangeHandler);
   Mojo.Event.stopListening(this.controller.get("useAnimation"),Mojo.Event.propertyChange,this.useAnimationChangeHandler);
   Mojo.Event.stopListening(this.controller.get("playLevel"),Mojo.Event.propertyChange,this.playLevelChangeHandler);
   Mojo.Event.stopListening(this.controller.get("cardBackColor"),Mojo.Event.propertyChange,this.cardBackColorChangeHandler);
   Mojo.Event.stopListening(this.controller.get("backGroundColor"),Mojo.Event.propertyChange,this.backGroundColorChangeHandler);
   Mojo.Event.stopListening(this.controller.get("playerPegColor"),Mojo.Event.propertyChange,this.playerPegColorChangeHandler);
   Mojo.Event.stopListening(this.controller.get("computerPegColor"),Mojo.Event.propertyChange,this.computerPegColorChangeHandler);
   // Mojo.Event.stopListening(this.controller.get("cheatMode"),Mojo.Event.propertyChange,this.cheatModeHandler);
   Mojo.Event.stopListening(this.controller.get("resetWins"),Mojo.Event.tap,this.clearWinsHandler);
   Mojo.Event.stopListening(this.controller.get("resetHands"),Mojo.Event.tap,this.clearHandsHandler);
   Mojo.Event.stopListening(this.controller.get("resetStats"),Mojo.Event.tap,this.clearStatsHandler);
   Mojo.Event.stopListening(this.controller.get("backupDB"),Mojo.Event.tap,this.backupDBHandler);
   Mojo.Event.stopListening(this.controller.get("restoreDB"),Mojo.Event.tap,this.restoreDBHandler);

}

PreferencesAssistant.prototype.cleanup = function(event) {
   this.game.writePrefCookie();
}


PreferencesAssistant.prototype.nameChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   if (event.value.length == 0) {
      properName = 'Beelzebubba';
      this.playerNameModel.value = properName; 
      this.controller.modelChanged(this.playerNameModel);
   } else {
      properName = event.value;
   }
   
   this.game.gamePrefs.playerName = properName;
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.shortGameChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.shortGame = event.value;
   if (!this.game.gamePrefs.shortGame) {
      this.game.gamePrefs.fiveCardGame = false;
      this.fiveCardGameModel.value = false;
      this.controller.modelChanged(this.fiveCardGameModel);
   }
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.manScoreChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.manScore = event.value;
   /* if (this.game.gamePrefs.manScore) {
      this.game.gamePrefs.autoScore = false;
      this.autoScoreModel.value = false;
      this.controller.modelChanged(this.autoScoreModel);
   } */
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.loserDealChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.loserDeal = event.value;
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.fiveCardGameChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.fiveCardGame = event.value;
   if (this.game.gamePrefs.fiveCardGame) {
      this.game.gamePrefs.shortGame = true;
      this.shortGameModel.value = true;
      this.controller.modelChanged(this.shortGameModel);
   }
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.mugginsChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.muggins = event.value;   
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.autoDealChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.autoDeal = event.value;
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.autoScoreChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.autoScore = event.value;
   /* if (this.game.gamePrefs.autoScore) {
      this.game.gamePrefs.manScore = false;
      this.manScoreModel.value = false;
      this.controller.modelChanged(this.manScoreModel);
   } */
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.useAnimationChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.useAnimation = event.value;
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.playLevelChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   this.game.gamePrefs.playDifficulty = event.value;
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.cardBackColorChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   if (event.value != "userDefined") {
      this.game.gamePrefs.cardBackColor = event.value;
      this.game.writePrefCookie();
   } else {
      // set alert
      // Mojo.Controller.errorDialog("Not yet. Sorry"); 
      this.colorDialog = this.controller.showDialog({template: "preferences/colorSelect",
	 assistant: new colorSelectAssistant(this, this.game, this.cardBackColorReturn.bind(this)),
	 preventCancel:false
      });
   }
}

PreferencesAssistant.prototype.backGroundColorChange = function(event) {
   // Mojo.Log.info(' %j', this.game.gamePrefs);
   if (event.value != "userDefined") {
      this.game.gamePrefs.backGroundColor = event.value;
      this.game.writePrefCookie();
   } else {
      // set alert
      // Mojo.Controller.errorDialog("Not yet. Sorry"); 
      this.colorDialog = this.controller.showDialog({template: "preferences/colorSelect",
	 assistant: new colorSelectAssistant(this, this.game, this.backGroundColorReturn.bind(this)),
	 preventCancel:false
      });
   }
}

PreferencesAssistant.prototype.playerPegColorChange = function(event) {
   this.game.playerPegColors = event.value.split(',');
   // Mojo.Log.info('event: %j',event.value); 
   // Mojo.Log.info('this.playerPegColors: %j',this.game.playerPegColors); 
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.computerPegColorChange = function(event) {
   this.game.computerPegColors = event.value.split(',');
   // Mojo.Log.info('this.computerPegColors: %j',this.game.computerPegColors); 
   this.game.writePrefCookie();
}

/*
PreferencesAssistant.prototype.cheatMode = function(event) {
   if (this.cheatCount < 5) {
      this.cheatCount++;
      setTimeout(this.cheatModeReset.bind(this), 600);
   } else {
      this.cheatCount = 0;
      setTimeout(this.cheatModeReset.bind(this), 600);
      Mojo.Controller.errorDialog('Relax! It\'s a harmless joke. No cheating takes place, sneaky or otherwise.');
   }
}

PreferencesAssistant.prototype.cheatModeReset = function() {
   this.cheatModeModel.value = true;
   this.controller.modelChanged(this.cheatModeModel);
}
*/

PreferencesAssistant.prototype.backupDBAsk = function(event) {
   this.controller.showAlertDialog({
      onChoose: function (value){
	 if (value == "backup") {
	    this.backupDB();
	 }
      },
      title: $L("Backup DB tables"),
      message: $L("This does not currently work. Sorry..."),
      choices: [{label:$L("Backup"), value:"backup", type:'affirmative'},
		{label:$L("Nevermind"), value:"cancel", type:'dismiss'}
	       ]
   });
}

PreferencesAssistant.prototype.backupDB = function(event) {
   this.game.backupDB(this.backupDBCallback.bind(this));   
}

PreferencesAssistant.prototype.restoreDBAsk = function(event) {
   this.controller.showAlertDialog({
      onChoose: function (value){
	 if (value == "restore") {
	    this.restoreDB();
	 }
      },
      title: $L("Restore DB tables"),
      message: $L("This does not currently work. Sorry..."),
      choices: [{label:$L("Restore"), value:"restore", type:'affirmative'},
		{label:$L("Nevermind"), value:"cancel", type:'dismiss'}
	       ]
   });
}

PreferencesAssistant.prototype.restoreDB = function(event) {
   // this.game.restoreDB(this.restoreDBCallback.bind(this));   
}

PreferencesAssistant.prototype.clearWinsAsk = function(event) {
   this.controller.showAlertDialog({
      onChoose: function (value){
	 if (value == "clear") {
	    this.clearWins();
	 }
      },
      title: $L("Clear DB: game stats"),
      message: $L("Do you really want to do this?"),
      choices: [{label:$L("Clear"), value:"clear", type:'affirmative'},
		{label:$L("Nevermind"), value:"cancel", type:'dismiss'}
	       ]
   });
}
   
PreferencesAssistant.prototype.clearWins = function() {
   this.game.clearWinsData(this.clearWinsCallback.bind(this));
}

PreferencesAssistant.prototype.clearHandsAsk = function(event) {
   this.controller.showAlertDialog({
      onChoose: function (value){
	 if (value == "clear") {
	    this.clearHands();
	 }
      },
      title: $L("Clear DB: high scores"),
      message: $L("Do you really want to do this?"),
      choices: [{label:$L("Clear"), value:"clear", type:'affirmative'},
		{label:$L("Nevermind"), value:"cancel", type:'dismiss'}
	       ]
   });
}
   
PreferencesAssistant.prototype.clearHands = function() {
   this.game.clearHandsData(this.clearHandsCallback.bind(this));
}

PreferencesAssistant.prototype.clearStatsAsk = function(event) {
   this.controller.showAlertDialog({
      onChoose: function (value){
	 if (value == "clear") {
	    this.clearStats();
	 }
      },
      title: $L("Clear DB: player stats"),
      message: $L("Do you really want to do this?"),
      choices: [{label:$L("Clear"), value:"clear", type:'affirmative'},
		{label:$L("Nevermind"), value:"cancel", type:'dismiss'}
	       ]
   });
}
   
PreferencesAssistant.prototype.clearStats = function() {
   this.game.clearStatsData(this.clearStatsCallback.bind(this));
}

PreferencesAssistant.prototype.backupDBCallback = function() {
   // do nothing. 
}

PreferencesAssistant.prototype.clearWinsCallback = function() {
   // do nothing. 
}

PreferencesAssistant.prototype.clearHandsCallback = function() {
   // do nothing. 
}

PreferencesAssistant.prototype.clearStatsCallback = function() {
   // do nothing. 
}


PreferencesAssistant.prototype.randomColor = function() {	
   var fullColorElements = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
   var colorElements = [7,8,9,'A','B','C','D','E','F'];
   var colorStr = '#';
   
   for (ri=0; ri < 6; ri++) {
      colorStr += colorElements[Math.floor(Math.random() * colorElements.length)];
   }
   
   return colorStr;
}

PreferencesAssistant.prototype.backGroundColorReturn = function(uColor){
   this.colorDialog.mojo.close();
   this.colorDialog = null;
   this.backGroundColorModel.value = uColor;
   this.controller.modelChanged(this.backGroundColorModel);
   this.game.gamePrefs.backGroundColor = uColor;
   this.game.writePrefCookie();
}

PreferencesAssistant.prototype.cardBackColorReturn = function(uColor){
   this.colorDialog.mojo.close();
   this.colorDialog = null;
   this.cardBackColorModel.value = uColor;
   this.controller.modelChanged(this.cardBackColorModel);
   this.game.gamePrefs.cardBackColor = uColor;
   this.game.writePrefCookie();
}

