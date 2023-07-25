StageAssistant.appMenuModel = {
   visible: true,
     items: [// {label:'New Game', command: 'do-newGame'},
	     // {label:'High Score', command: 'do-highScores'},
	     // {label:'Player Stats', command: 'do-playerStats'},
	     // {label:'Game Stats', command: 'do-gameStats'},
	     // {label:'Preferences', command: 'do-appPrefs'},
	     {label:$L("About"), command: 'do-myAbout'}]
	     // {label:'Help', command: 'do-appRules'}]
}


function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
   this.controller.pushScene({name:"start",disableSceneScroller: true});
}

StageAssistant.prototype.handleCommand = function(event) {
   this.controller=Mojo.Controller.stageController.activeScene();
   if(event.type == Mojo.Event.command){
      switch(event.command) {
       case 'do-myAbout':
	 this.controller.showAlertDialog({
	    onChoose: function(value) {},
	    allowHTMLMessage: true,
	    title: $L("Pribbage is a card game."),
	    message: $L("A cribbage game, to be exact. You are playing version #{version}. Written by and copyright 2010 Mark A. Crowder. No guarantees, express or implied. Please don't throw your phone if you lose.").interpolate({version:Mojo.Controller.appInfo.version}),
	    choices:[
		     {label:$L("OK"), value:""}
		     ]
	 });
	 break;
       case 'do-newGame':
	 break;
       case 'do-appPrefs':
	 break;
       case 'do-highScores':
       case 'do-playerStats':
       case 'do-gameStats':
       case 'do-appRules':
	 break;
      }
   }
}
