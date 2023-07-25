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


function StartAssistant() {
   this.game = null;
   this.db = new pribDataStorage();
}

StartAssistant.prototype.setup = function() {
   this.game = new Game(this.db);
   this.game.checkPrefCookie();
   this.game.setGamePrefs();
   if (this.game.gamePrefs.backGroundColor){
      this.backGroundColor = this.game.gamePrefs.backGroundColor;
   } else {
      this.backGroundColor = "#66cc66";
   }
   
   // backfill newcomers
   var newPrefs = 0;
   if (this.game.gamePrefs.useAnimation === undefined) {
      this.game.gamePrefs.useAnimation = 1;
      newPrefs++;
   }
   if (this.game.gamePrefs.playerName === undefined) {
      this.game.gamePrefs.playerName = $L("player");
      newPrefs++;
   }
   if (this.game.gamePrefs.cardBackColor === undefined) {
      this.game.gamePrefs.cardBackColor = "#2A52BE";
      newPrefs++;
   }
   if (this.game.gamePrefs.backGroundColor === undefined) {
      this.game.gamePrefs.backGroundColor = "#66cc66";
      newPrefs++;
   }
   if (newPrefs) {
      this.game.writePrefCookie();
   }   
   
   this.game.backgroundCanvas("start");
   
   this.tapButtonHandler = this.tapButton.bindAsEventListener(this);
   
   this.NewGameButtAttributes = {};
   this.NewGameButtModel = {label: $L("New Game"),buttonClass:"palm-button prib-button",disabled:false};
   this.controller.setupWidget( "NewGameButt", this.NewGameButtAttributes, this.NewGameButtModel );
   Mojo.Event.listen(this.controller.get('NewGameButt'), Mojo.Event.tap, this.tapButtonHandler);
   
   this.ContinueGameButtAttributes = {};
   this.ContinueGameButtModel = {label: $L("Continue"),buttonClass:"palm-button prib-button",disabled:true};
   this.controller.setupWidget( "ContinueGameButt", this.ContinueGameButtAttributes, this.ContinueGameButtModel );
   Mojo.Event.listen(this.controller.get('ContinueGameButt'), Mojo.Event.tap, this.tapButtonHandler);
   
   this.RulesButtAttributes = {};
   this.RulesButtModel = {label: $L("Rules"),buttonClass:"palm-button secondary prib-button",disabled:false};
   this.controller.setupWidget( "RulesButt", this.RulesButtAttributes, this.RulesButtModel );
   Mojo.Event.listen(this.controller.get('RulesButt'), Mojo.Event.tap, this.tapButtonHandler);
   
   this.StatsButtAttributes = {};
   this.StatsButtModel = {label: $L("Player Stats"),buttonClass:"palm-button secondary prib-button",disabled:false};
   this.controller.setupWidget( "StatsButt", this.StatsButtAttributes, this.StatsButtModel );
   Mojo.Event.listen(this.controller.get('StatsButt'), Mojo.Event.tap, this.tapButtonHandler);
   
   this.HighScoreButtAttributes = {};
   this.HighScoreButtModel = {label: $L("High Scores"),buttonClass:"palm-button secondary prib-button",disabled:false};
   this.controller.setupWidget( "HighScoreButt", this.HighScoreButtAttributes, this.HighScoreButtModel );
   Mojo.Event.listen(this.controller.get('HighScoreButt'), Mojo.Event.tap, this.tapButtonHandler);
   
   this.PrefButtAttributes = {};
   this.PrefButtModel = {label: $L("Options"),buttonClass:"palm-button secondary prib-button",disabled:false};
   this.controller.setupWidget( "PrefButt", this.PrefButtAttributes, this.PrefButtModel );
   Mojo.Event.listen(this.controller.get('PrefButt'), Mojo.Event.tap, this.tapButtonHandler);
   
   if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
      Mojo.Log.info("I am on a pixi");
      this.game.palmType = 'pixi';
   }
   
   // move to 'activate' portion...
   // Mojo.Log.info('Checking DB...');
   // this.db.checkDB(this.loadingGameDB.bind(this));
   
   // set up appMenu
   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);
}

StartAssistant.prototype.aboutToActivate = function() {
   appDat = this.controller.get("appVersion");
   appDat.setStyle({'position':'absolute','bottom':'15px'});
   appDat.innerHTML = $L("Ver: #{verNum}").interpolate({verNum:Mojo.Controller.appInfo.version});
   // Mojo.Log.info('Major: '+Mojo.Environment.DeviceInfo.platformVersionMajor);
}


StartAssistant.prototype.activate = function(event) {
   if (this.game.gamePrefs.backGroundColor){
      if (this.backGroundColor != this.game.gamePrefs.backGroundColor){
	 this.game.backgroundCanvas("start");
	 this.backGroundColor = this.game.gamePrefs.backGroundColor;
      }
   }
   
   // moved to 'activate' portion to correct glitch in game continuation...
   Mojo.Log.info('Checking DB...');
   this.db.checkDB(this.loadingGameDB.bind(this));
   
   $('palm-disclaimer').hide();
   
   if (this.game.palmType == 'pixi') {
      $('start').setStyle({'height':'400px'});
      $('startTable').setStyle({'top':'69px'});
   }
   
   // Mojo.Log.info('active: ', this.game.active());
   if (this.game == null) {
      this.ContinueGameButtModel.disabled = true;
   } else {
      if (this.game.active()) {
	 this.ContinueGameButtModel.disabled = false;
	 this.game.saveSoon();
      } else {
	 this.ContinueGameButtModel.disabled = true;
      }
   }
   this.controller.modelChanged(this.ContinueGameButtModel);
}

StartAssistant.prototype.loadingGameDB = function() {
   Mojo.Log.info('Loading Game...');
   this.game.load(this.finishLoadingGameDB.bind(this));
}

StartAssistant.prototype.finishLoadingGameDB = function() {
   $('NewGameButt').disabled = false;
   if(this.game != null) {
      if(this.game.active()) {
	 this.ContinueGameButtModel.disabled = false;
	 this.controller.modelChanged(this.ContinueGameButtModel);
      }
   }
}


StartAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}


StartAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
      Mojo.Event.stopListening(this.controller.get('NewGameButt'), Mojo.Event.tap, this.tapButtonHandler);
      Mojo.Event.stopListening(this.controller.get('ContinueGameButt'), Mojo.Event.tap, this.tapButtonHandler);
      Mojo.Event.stopListening(this.controller.get('RulesButt'), Mojo.Event.tap, this.tapButtonHandler);
      Mojo.Event.stopListening(this.controller.get('StatsButt'), Mojo.Event.tap, this.tapButtonHandler);
      Mojo.Event.stopListening(this.controller.get('HighScoreButt'), Mojo.Event.tap, this.tapButtonHandler);
      Mojo.Event.stopListening(this.controller.get('PrefButt'), Mojo.Event.tap, this.tapButtonHandler);
}


StartAssistant.prototype.tapButton = function(event) {
      // Mojo.Log.info('button id: ', event.srcElement.up(2).id);
      switch(event.srcElement.up(2).id){
       case "NewGameButt":
	 if (!this.game.gameIsOver) {
	    Mojo.Log.info('Overwriting game data...');
	 }
	 this.game = new Game(this.db);
	 this.game.checkPrefCookie();
	 this.game.setGamePrefs();
	 Mojo.Controller.stageController.pushScene({name:"Game",disableSceneScroller: true}, this.game);
	 break;
       case "ContinueGameButt":
	 Mojo.Controller.stageController.pushScene({name:"Game",disableSceneScroller: true}, this.game);
	 break;
       case "RulesButt":
	 Mojo.Controller.stageController.pushScene("Rules");
	 break;
       case "StatsButt":
	 Mojo.Controller.stageController.pushScene({name:"Stats",disableSceneScroller: false});
	 break;
       case "HighScoreButt":
	 Mojo.Controller.stageController.pushScene({name:"highScores",disableSceneScroller: true}, this.game);
	 break;
       case "PrefButt":
	 Mojo.Controller.stageController.pushScene({name:"preferences",disableSceneScroller: false}, this.game);
	 break;
      }
}
