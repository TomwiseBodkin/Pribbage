// statistical data constructor
function statDataConstructor() {
   this.shortgames = 0;
   this.games = 0;
   this.won = 0;
   this.lost = 0;
   this.shorthands = 0;
   this.Pcutwins = 0;
   this.Ccutwins = 0;
   this.Phands = 0;
   this.Chands = 0;
   this.Pcribs = 0;
   this.Ccribs = 0;
   this.hands = 0;
   // old point storage, not used after 0.3.17
   this.handpoints = 0;
   this.comphandpoints = 0;
   this.cribpoints = 0;
   this.compcribpoints = 0;
   this.playpoints = 0;
   this.compplaypoints = 0;
   // more explicit data/points storage
   this.handpointsArr = {};
   this.comphandpointsArr = {};
   this.cribpointsArr = {};
   this.compcribpointsArr = {};
   this.playpointsArr = {};
   this.compplaypointsArr = {};
   this.pDealerPts = {};
   this.cDealerPts = {};
   this.pPonePts = {};
   this.cPonePts = {};

   this.winDelta = 0;
   this.loseDelta = 0;
   this.skunks = 0;
   this.skunked = 0;
   this.avgPlayLevel = 0;
   this.PwinStreak = 0;
   this.PwinStreakRecord = 0;
   this.CwinStreak = 0;
   this.CwinStreakRecord = 0;
}

// Number count constructor

function Counter() {
   this.player = 0;
   this.computer = 0;
}

function CounterArray() {
   this.player = [];
   this.computer = [];
}

// Game constructor

var Game = Class.create({
   initialize: function(db, loadFromDB) {
      // save game DB setup
      this.datastore = db;
      
      this.palmType = 'pre';
      // options:
      this.gamePrefs = {};
      this.gamePrefs.playDifficulty = 2; // game difficulty (0 = easier, 1 = medium, 2 = harder)
      this.gamePrefs.fiveCardGame = false;
      this.gamePrefs.loserDeal = false;
      this.gamePrefs.shortGame = false;
      this.gamePrefs.manScore = false;
      this.gamePrefs.muggins = false;
      this.gamePrefs.autoDeal = false;
      this.gamePrefs.autoScore = false;
      this.gamePrefs.useAnimation = 1;
      this.gamePrefs.playerName = $L("player");
      this.gamePrefs.cardBackColor = "#2A52BE";
      this.gamePrefs.backGroundColor = "#66cc66";
      this.gamePrefs.playerPegColorIn = '#1e90ff';
      this.gamePrefs.playerPegColorOut = 'blue';
      this.gamePrefs.computerPegColorIn = '#dc143c';
      this.gamePrefs.computerPegColorOut = '#b22222';
      
      this.playerPegColors = ['#1e90ff','blue'];
      this.computerPegColors = ['#dc143c','#b22222'];
      this.gameLevel = 2;
      this.fiveCardGame = false;
      this.shortGame = false;
      this.manScore = false;
      this.muggins = false;
      this.letTheWookieeWin = false;
      
      this.delaySave = null;
      this.delayWinSave = null;
      this.delayHandSave = null;
      this.winData = []; // put winning stats into an array of {}s. used in loading DB data
      this.handData = [];
      this.statData = [];
      
      this.gameIsOver = 0;
      
      
      // during play values
      this.stage = 'cut'; // stage of round: deal, play, hand
      this.cutHand = 0;
      this.cutWinner = '';
      this.currentDealer = 'computer';
      this.currentScore = '';
      this.scoreArr = [];
      
      this.commentary = '';
      this.gameTurn = '';
      this.lastPlay = '';
      this.cribCards = [];
      this.runCards = [];
      this.runScore = 0;
      this.calledGo = new Counter();
      this.calledGoFirst = ''; // who called 'go' first
      
      this.numHands = 0; // number of hands played in a game
      this.scorePerRound = new Counter();
      this.Score = new Counter();
      this.OldScore = new Counter();
      // total points per players:
      this.PlayScoreRun = new Counter(); // keep track of score from play
      this.HandScoreTNG = new CounterArray(); // keep track of score from hand
      this.PlayScoreTNG = new CounterArray(); // keep track of score from play
      this.CribScoreTNG = new CounterArray(); // keep track of score from crib
      // total points per game:
      this.gamePlayScoreRun = new Counter(); // keep track of score from play
      this.gameHandScoreTNG = new CounterArray(); // keep track of score from hand
      this.gamePlayScoreTNG = new CounterArray(); // keep track of score from play
      this.gameCribScoreTNG = new CounterArray(); // keep track of score from crib
      this.dealerTotalScore = new CounterArray(); // total score per round as dealer
      this.poneTotalScore = new CounterArray(); // total score per round as pone
      
      this.cardsInPlay = new Counter(); // overall cards left in hand during play (playable or not).
      this.playableCards = new CounterArray(); // array of card indices that can be played for a given run up to 31.
      
      // command menu model items
      this.cmdMenuModel = {};
      
      // deck and hand initialization
      this.deck = new Deck();
      this.handP = new Deck();
      this.handC = new Deck();
      this.crib = new Deck();
      this.cut = new Deck();
      
      if(loadFromDB) {
	 this.load();
      }
   },
   
   active: function() {
      if (!this.gameIsOver && this.numHands > 0) {
	 // Mojo.Log.info('Player: ', this.Score.player, ', Computer: ', this.Score.computer);
	 return true;
      }
      return false;
   },
   
   endedGame: function() {
      if (!this.shortGame && (this.Score.player >= 121 || this.Score.computer >= 121)) {
	 this.gameIsOver = 1;
	 return true;
      } else if (this.shortGame && (this.Score.player >= 61 || this.Score.computer >= 61)) {
	 this.gameIsOver = 1;
	 return true;
      }

      return false;
   },
   
   writePrefCookie: function() {
      var cookie = new Mojo.Model.Cookie("pribPrefs");
      this.gamePrefs.playerPegColorIn = this.playerPegColors[0];
      this.gamePrefs.playerPegColorOut = this.playerPegColors[1];
      this.gamePrefs.computerPegColorIn = this.computerPegColors[0];
      this.gamePrefs.computerPegColorOut = this.computerPegColors[1];
      
      cookie.put(this.gamePrefs);
   },
   
   
   backgroundCanvas: function(stage) {
      if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
	 // using a Pixi!
	 height = 400;
      } else {
	 height = 480;
      }
      
      if (stage) {
	 BGNode = stage;
      } else {
	 BGNode = "canvasBG";
      }
      
      ctx = document.getCSSCanvasContext("2d", BGNode, 320, height);
      
      if (!this.gamePrefs.backGroundColor) {
	 ctx.fillStyle = '#66cc66';
      } else {
	 ctx.fillStyle = this.gamePrefs.backGroundColor;
      }
      
      ctx.fillRect(0,0,320,height);
      
      if (stage) {
	 switch (stage) {
	  case "start":
	    logoImg = new Image();
	    if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
	       // using a Pixi!
	       logoImg.src = 'images/pribbage_logo320op.png';
	    } else {
	       logoImg.src = 'images/pribbage_logo320.png';
	    }
	    titleImg = new Image();
	    titleImg.src = 'images/pribbage_title.png';
	    logoImg.onload = function() {
	       titleImg.onload = function() {
		  ctx.drawImage(logoImg,0,(height-320)/2); // 81
		  ctx.drawImage(titleImg,10,18);
	       }.bind(this);
	    }.bind(this);
	 }
      }
   },
   
   
   checkPrefCookie: function() {
      var cookie = new Mojo.Model.Cookie("pribPrefs").get();
      if (cookie != undefined){
	 this.gamePrefs = cookie;
	 // Mojo.Log.info('got: %j', this.gamePrefs);
      }
   },
   
   
   setGamePrefs: function() {
      if (this.gamePrefs.playerPegColorIn && this.gamePrefs.playerPegColorOut) {
	 this.playerPegColors = [this.gamePrefs.playerPegColorIn,this.gamePrefs.playerPegColorOut];
      } else {
	 this.playerPegColors = ['#1e90ff','blue'];
      }
      if (this.gamePrefs.computerPegColorIn && this.gamePrefs.computerPegColorOut) { 
	 this.computerPegColors = [this.gamePrefs.computerPegColorIn,this.gamePrefs.computerPegColorOut];
      } else {
	 this.computerPegColors = ['#dc143c','#b22222'];
      }
      this.gameLevel = this.gamePrefs.playDifficulty;
      this.shortGame = this.gamePrefs.shortGame;
      this.fiveCardGame = this.gamePrefs.fiveCardGame;
      this.manScore = this.gamePrefs.manScore;
      this.muggins = this.gamePrefs.muggins;
   },
   
   removePrefCookie: function() {
      var cookie = new Mojo.Model.Cookie("pribPrefs").remove();
   },
   
   
   save: function(callback) {
	 if(!this.active()) {
	    return;
	 }
	 if(this.delaySave != null) {
	    clearTimeout(this.delaySave);
	    this.delaySave = null;
	 }
	 var gameData = [];
	 // populate the gameData array with game data.
	 // 
	 // gameData.push({name:'gamePrefs',data:Object.toJSON(this.gamePrefs)});
	 gameData.push({name:'deck',data:Object.toJSON(this.deck)});
	 gameData.push({name:'playerHand',data:Object.toJSON(this.handP)});
	 gameData.push({name:'compHand',data:Object.toJSON(this.handC)});
	 gameData.push({name:'crib',data:Object.toJSON(this.crib)});
	 gameData.push({name:'cut',data:Object.toJSON(this.cut)});
	 gameData.push({name:'scoreArr',data:Object.toJSON(this.scoreArr)});
	 gameData.push({name:'runCards',data:Object.toJSON(this.runCards)});
	 gameData.push({name:'calledGo',data:Object.toJSON(this.calledGo)});
	 gameData.push({name:'Score',data:Object.toJSON(this.Score)});
	 gameData.push({name:'OldScore',data:Object.toJSON(this.OldScore)});
	 gameData.push({name:'PlayScoreRun',data:Object.toJSON(this.PlayScoreRun)});
	 gameData.push({name:'HandScoreTNG',data:Object.toJSON(this.HandScoreTNG)});
	 gameData.push({name:'PlayScoreTNG',data:Object.toJSON(this.PlayScoreTNG)});
	 gameData.push({name:'CribScoreTNG',data:Object.toJSON(this.CribScoreTNG)});
	 gameData.push({name:'gamePlayScoreRun',data:Object.toJSON(this.gamePlayScoreRun)});
	 gameData.push({name:'gameHandScoreTNG',data:Object.toJSON(this.gameHandScoreTNG)});
	 gameData.push({name:'gamePlayScoreTNG',data:Object.toJSON(this.gamePlayScoreTNG)});
	 gameData.push({name:'gameCribScoreTNG',data:Object.toJSON(this.gameCribScoreTNG)});
	 gameData.push({name:'dealerTotalScore',data:Object.toJSON(this.dealerTotalScore)});
	 gameData.push({name:'poneTotalScore',data:Object.toJSON(this.poneTotalScore)});
	 gameData.push({name:'cardsInPlay',data:Object.toJSON(this.cardsInPlay)});
	 gameData.push({name:'playableCards',data:Object.toJSON(this.playableCards)});
	 // Mojo.Log.info('game data...');
	 gameData.push({name:'game',data:this.saveGameData()});
	 
	 this.datastore.writeGameData(gameData, callback);
   },
   
   saveGameData: function() {
      var gameData = {};
      gameData.gameLevel = this.gameLevel;
      gameData.fiveCardGame = this.fiveCardGame;
      gameData.shortGame = this.shortGame;
      // gameData.useAnimation = this.useAnimation;
      gameData.stage = this.stage;
      gameData.cutHand = this.cutHand;
      gameData.currentDealer = this.currentDealer;
      gameData.numHands = this.numHands;
      gameData.commentary = this.commentary;
      gameData.lastPlay = this.lastPlay;
      gameData.currentScore = this.currentScore;
      gameData.gameTurn = this.gameTurn;
      gameData.runScore = this.runScore;
      gameData.gameIsOver = this.gameIsOver;
      gameData.cutWinner = this.cutWinner;
      return Object.toJSON(gameData);
   },
   
   saveSoon: function() {
	 if(!this.active()) {
	    return;
	 }
	 if(this.delaySave != null) {
	    clearTimeout(this.delaySave);
	 }
	 // Mojo.Log.info('Saving the game...');
	 this.delaySave = setTimeout(function(thisObj) {thisObj.save();}, 250, this);
   },
   
   clearData: function(callback) {
      // Mojo.Log.info("game.clearData");
      this.datastore.clearGameData(callback);
   },
   
   backupDB: function(callback) {
      this.callback = callback;
      this.datastore.getBackup(this.saveBackupDBData.bind(this));
   },
   
   saveBackupDBData: function(rows) {
      // save data to a file in /internal/media
      for (var i = 0; i < rows.length; i++) {
	 Mojo.Log.info("DB: %j",rows[i]);
      }
   },
   
   load: function(callback) {
      this.callback = callback;
      this.datastore.getSavedGame(this.loadGameData.bind(this));
   },
   
   loadGameData: function(rows) {
         for (var i = 0; i < rows.length; i++) {
	    var name = rows.item(i).name;
	    var data = rows.item(i).data;
	    // Mojo.Log.info('loading game data: ' + name + " " + data.substr(0,20));
	    switch (name) {
	     case 'deck':
	       stack = data.evalJSON();
	       this.deck = new Deck();
	       for (lm = 0; lm < stack.cards.length; lm++) {
		  var y = stack.cards[lm];
		  this.deck.cards[lm] = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
		  this.deck.cards[lm].isCut = y.isCut;
		  this.deck.cards[lm].isPlayed = y.isPlayed;
		  this.deck.cards[lm].isSelected = y.isSelected;
	       }
	       break;
	     case 'playerHand':
	       stack = data.evalJSON();
	       this.handP = new Deck();
	       for (lm = 0; lm < stack.cards.length; lm++) {
		  var y = stack.cards[lm];
		  this.handP.cards[lm] = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
		  this.handP.cards[lm].isCut = y.isCut;
		  this.handP.cards[lm].isPlayed = y.isPlayed;
		  this.handP.cards[lm].isSelected = y.isSelected;
	       }
	       break;
	     case 'compHand':
	       stack = data.evalJSON();
	       this.handC = new Deck();
	       for (lm = 0; lm < stack.cards.length; lm++) {
		  var y = stack.cards[lm];
		  this.handC.cards[lm] = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
		  this.handC.cards[lm].isCut = y.isCut;
		  this.handC.cards[lm].isPlayed = y.isPlayed;
		  this.handC.cards[lm].isSelected = y.isSelected;
	       }
	       break;
	     case 'crib':
	       stack = data.evalJSON();
	       this.crib = new Deck();
	       for (lm = 0; lm < stack.cards.length; lm++) {
		  var y = stack.cards[lm];
		  this.crib.cards[lm] = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
		  this.crib.cards[lm].isCut = y.isCut;
		  this.crib.cards[lm].isPlayed = y.isPlayed;
		  this.crib.cards[lm].isSelected = y.isSelected;
	       }
	       break;
	     case 'cut':
	       stack = data.evalJSON();
	       this.cut = new Deck();
	       for (lm = 0; lm < stack.cards.length; lm++) {
		  var y = stack.cards[lm];
		  this.cut.cards[lm] = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
		  this.cut.cards[lm].isCut = y.isCut;
		  this.cut.cards[lm].isPlayed = y.isPlayed;
		  this.cut.cards[lm].isSelected = y.isSelected;
	       }
	       break;
	     case 'scoreArr':
	       this.scoreArr = data.evalJSON();
	       break;
	     case 'runCards':
	       this.runCards = data.evalJSON();
	       break;
	     case 'calledGo':
	       this.calledGo = data.evalJSON();
	       break;  
	     /* case 'playedHands':
	       this.playedHands = data.evalJSON();
	       break;
	     case 'playedCribs':
	       this.playedCribs = data.evalJSON();
	       break; */
	     case 'Score':
	       this.Score = data.evalJSON();
	       break;
	     /* case 'HandScore':
	       this.HandScore = data.evalJSON();
	       break;
	     case 'PlayScore':
	       this.PlayScore = data.evalJSON();
	       break;
	     case 'CribScore':
	       this.CribScore = data.evalJSON();
	       break; */
	     case 'PlayScoreRun':
	       this.PlayScoreRun = data.evalJSON();
	       break;
	     case 'HandScoreTNG':
	       this.HandScoreTNG = data.evalJSON();
	       break;
	     case 'PlayScoreTNG':
	       this.PlayScoreTNG = data.evalJSON();
	       break;
	     case 'CribScoreTNG':
	       this.CribScoreTNG = data.evalJSON();
	       break;
	     case 'gamePlayScoreRun':
	       this.gamePlayScoreRun = data.evalJSON();
	       break;
	     case 'gameHandScoreTNG':
	       this.gameHandScoreTNG = data.evalJSON();
	       break;
	     case 'gamePlayScoreTNG':
	       this.gamePlayScoreTNG = data.evalJSON();
	       break;
	     case 'gameCribScoreTNG':
	       this.gameCribScoreTNG = data.evalJSON();
	       break;
	     case 'dealerTotalScore':
	       this.dealerTotalScore = data.evalJSON();
	       break;
	     case 'poneTotalScore':
	       this.poneTotalScore = data.evalJSON();
	       break;
	     case 'OldScore':
	       this.OldScore = data.evalJSON();
	       break;
	     case 'cardsInPlay':
	       this.cardsInPlay = data.evalJSON();
	       break;
	     case 'playableCards':
	       this.playableCards = data.evalJSON();
	       break; 
	     case 'game':
	       var gameData = data.evalJSON();
	       this.gameLevel = gameData.gameLevel;
	       this.fiveCardGame = gameData.fiveCardGame;
	       this.shortGame = gameData.shortGame;
	       // this.useAnimation = gameData.useAnimation;
	       this.gameIsOver = gameData.gameIsOver;
	       this.stage = gameData.stage;
	       this.cutHand = gameData.cutHand;
	       this.currentDealer = gameData.currentDealer;
	       this.numHands = gameData.numHands;
	       this.commentary = gameData.commentary;
	       this.lastPlay = gameData.lastPlay;
	       this.currentScore = gameData.currentScore;
	       this.gameTurn = gameData.gameTurn;
	       this.runScore = gameData.runScore;
	       this.cutWinner = gameData.cutWinner;
	       break;
	    }
	 }
	 if(this.callback) {
	    this.callback();
	 }
	                      
   },

   clearWinsData: function(callback) {
      Mojo.Log.info("game.clearWinsData");
      this.datastore.clearWinsData(callback);
   },
   
   saveWin: function(callback) {
      if(!this.endedGame()) {
	 return;
      }
      if(this.delayWinSave != null) {
	 clearTimeout(this.delayWinSave);
	 this.delayWinSave = null;
      }
      var playTime = new Date().getTime();
      var winData = [];
      
      // trash compactor for the data. 
      handpointsArr = {};
      for (sDi=0; sDi < this.gameHandScoreTNG.player.length; sDi++) {
	 scrVal = this.gameHandScoreTNG.player[sDi];
	 if (handpointsArr[scrVal]) {
	    handpointsArr[scrVal] += 1;
	 } else {
	    handpointsArr[scrVal] = 1;
	 }
      }
      
      comphandpointsArr = {};
      for (sDi=0; sDi < this.gameHandScoreTNG.computer.length; sDi++) {
	 scrVal = this.gameHandScoreTNG.computer[sDi];
	 if (comphandpointsArr[scrVal]) {
	    comphandpointsArr[scrVal] += 1;
	 } else {
	    comphandpointsArr[scrVal] = 1;
	 }
      }
      
      cribpointsArr = {};
      for (sDi=0; sDi < this.gameCribScoreTNG.player.length; sDi++) {
	 scrVal = this.gameCribScoreTNG.player[sDi];
	 if (cribpointsArr[scrVal]) {
	    cribpointsArr[scrVal] += 1;
	 } else {
	    cribpointsArr[scrVal] = 1;
	 }
      }
      
      compcribpointsArr = {};
      for (sDi=0; sDi < this.gameCribScoreTNG.computer.length; sDi++) {
	 scrVal = this.gameCribScoreTNG.computer[sDi];
	 if (compcribpointsArr[scrVal]) {
	    compcribpointsArr[scrVal] += 1;
	 } else {
	    compcribpointsArr[scrVal] = 1;
	 }
      }
      
      playpointsArr = {};
      for (sDi=0; sDi < this.gamePlayScoreTNG.player.length; sDi++) {
	 scrVal = this.gamePlayScoreTNG.player[sDi];
	 if (playpointsArr[scrVal]) {
	    playpointsArr[scrVal] += 1;
	 } else {
	    playpointsArr[scrVal] = 1;
	 }
      }
      
      compplaypointsArr = {};
      for (sDi=0; sDi < this.gamePlayScoreTNG.computer.length; sDi++) {
	 scrVal = this.gamePlayScoreTNG.computer[sDi];
	 if (compplaypointsArr[scrVal]) {
	    compplaypointsArr[scrVal] += 1;
	 } else {
	    compplaypointsArr[scrVal] = 1;
	 }
      }
      
      this.HandScoreWin = {player: handpointsArr, computer: comphandpointsArr};
      this.PlayScoreWin = {player: playpointsArr, computer: compplaypointsArr};
      this.CribScoreWin = {player: cribpointsArr, computer: compcribpointsArr};
      
      winData.push({time:playTime,name:'score',data:Object.toJSON(this.Score)});
      winData.push({time:playTime,name:'handscore',data:Object.toJSON(this.HandScoreWin)});
      winData.push({time:playTime,name:'playscore',data:Object.toJSON(this.PlayScoreWin)});
      winData.push({time:playTime,name:'cribscore',data:Object.toJSON(this.CribScoreWin)});
      winData.push({time:playTime,name:'data',data:this.saveWinData()});
      
      this.gameIsOver = 1;
      this.datastore.writeWinData(winData, callback);
   },
   
   saveWinData: function() {
      var winData = {};
      winData.playerName = this.gamePrefs.playerName;
      winData.gameLevel = this.gameLevel;
      winData.shortGame = this.shortGame;
      if (this.cutWinner == 'computer') {
	 winData.cutWinner = this.cutWinner;
      } else {
	 winData.cutWinner = this.gamePrefs.playerName;
      }
      winData.numHands = this.numHands;
      return Object.toJSON(winData);
   },
   
   saveWinSoon: function() {
	 if(!this.endedGame()) {
	    return;
	 }
	 if(this.delayWinSave != null) {
	    clearTimeout(this.delayWinSave);
	 }
	 Mojo.Log.info('Saving the win...');
	 this.delayWinSave = setTimeout(function(thisObj) {thisObj.saveWin();}, 250, this);
   },
   
   loadGameDates: function(callback) {
      this.callback = callback;
      this.datastore.getSavedWinsDates(this.loadGameDateData.bind(this));
   },
   
   loadGameDateData: function(rows) {
      var winDates = [];
      for (var i = 0; i < rows.length; i++) {
	 winDates.push(rows.item(i));
      }
      if (winDates.length > 0) {
	 m = winDates.length-1;
	 while (m--) {
	    if (winDates[m].playdate == winDates[m+1].playdate) {
	       winDates.splice(m,1);
	    }
	 }
      }
      if(this.callback) {
	 this.callback(winDates);
      }
   },
   
   lastWinner: function(playdate,callback) {
      this.callback = callback;
      this.datastore.getSavedWinsData(playdate,this.lastWinnerData.bind(this));
   },
   
   lastWinnerData: function(rows) {
      var thePlayer = '';
      var theWinner = '';
      for (var i = 0; i < rows.length; i++) {
	 if (rows.item(i).name == 'data') {
	    var data = rows.item(i).data;
	    var winnerDataRow = data.evalJSON();
	    thePlayer = winnerDataRow.playerName;	    
	 } else if (rows.item(i).name == 'score') {
	    var data = rows.item(i).data;
	    var winnerDataRow = data.evalJSON();
	    if (winnerDataRow.player > winnerDataRow.computer) {
	       theWinner = 'player';
	    } else {
	       theWinner = 'computer';
	    }
	 }
      }
      if(this.callback) {
	 this.callback(thePlayer,theWinner);
      }
   },
   
   loadWins: function(callback) {
	 this.callback = callback;
	 this.datastore.getSavedWins(this.loadWinData.bind(this));
   },
   
   loadSingleWin: function(callback,winDate) {
	 this.callback = callback;
	 this.datastore.getOneSavedWin(this.loadWinData.bind(this),winDate);
   },
   
   loadWinData: function(rows) {
	 this.winData = []; // put winning stats into an array of {}s
	 
	 var winDates = [];
	 for (var i = 0; i < rows.length; i++) {
	    winDates.push(parseInt(rows.item(i).playdate));
	 }
	 
	 winDates = winDates.uniq(); // remove duplicates with Prototype's method (or at least try to!)
	 
	 for (j=0; j < winDates.length; j++) {
	    winDataSet = {};
	    for (var i = 0; i < rows.length; i++) {
	       var playdate = parseInt(rows.item(i).playdate);
	       var name = rows.item(i).name;
	       var data = rows.item(i).data;
	       var winDataRow = data.evalJSON();
	       
	       if (playdate == winDates[j]) {
		  switch(name) {
		   case 'score':
		     winDataSet.playerScore = winDataRow.player;
		     winDataSet.computerScore = winDataRow.computer;
		     break;
		   case 'handscore':
		     winDataSet.playerHandScore = winDataRow.player;
		     winDataSet.computerHandScore = winDataRow.computer;
		     break;
		   case 'cribscore':
		     winDataSet.playerCribScore = winDataRow.player;
		     winDataSet.computerCribScore = winDataRow.computer;
		     break;
		   case 'playscore':
		     winDataSet.playerPlayScore = winDataRow.player;
		     winDataSet.computerPlayScore = winDataRow.computer;
		     break;
		   case 'data':
		     if (winDataRow.playerName) {
			winDataSet.playerName = winDataRow.playerName;
		     } else {
			winDataSet.playerName = 'player';
		     }
		     if (winDataRow.gameLevel) {
			winDataSet.gameLevel = winDataRow.gameLevel;
		     } else {
			winDataSet.gameLevel = 2;
		     }
		     if (winDataRow.shortGame) {
			winDataSet.shortGame = winDataRow.shortGame;
		     } else {
			winDataSet.shortGame = false;
		     }
		     winDataSet.playdate = playdate;
		     winDataSet.cutWinner = winDataRow.cutWinner;
		     winDataSet.numHands = winDataRow.numHands;
		     break;
		  }
	       }
	    }
	    this.winData.push(winDataSet);
	 }
	 this.winData.sort(byPlayDate);
	 
	 // Mojo.Log.info('winData: ', Object.toJSON(this.winData).substr(0,500));
	 if(this.callback) {
	    this.callback();
	 }
   },
   
   clearHandsData: function(callback) {
      Mojo.Log.info("game.clearHandsData");
      this.datastore.clearHandsData(callback);
   },
   

   // save 'big' hands with scores of 20 or more. for posterity, of course...
   saveHand: function(callback) {
	 if(this.delayHandSave != null) {
	    clearTimeout(this.delayHandSave);
	    this.delayHandSave = null;
	 }
	 var playTime = new Date().getTime();
	 
	 var handData = [];
	 if (this.currentDealer == 'computer'){
	    handData.push({time:playTime,name:this.cardplayer,dealer:this.currentDealer,cards:Object.toJSON(this.highcards),score:this.highscore});
	 } else {
	    handData.push({time:playTime,name:this.cardplayer,dealer:this.cardplayer,cards:Object.toJSON(this.highcards),score:this.highscore});
	 }

	 this.datastore.writeHandData(handData, callback);
   },
   
   saveHandSoon: function(cardplayer,highcards,highscore) {
	 if(this.delayHandSave != null) {
	    clearTimeout(this.delayHandSave);
	 }
	 this.cardplayer = cardplayer;
	 this.highcards = highcards; // array of the cards in the high-scoring hand in Deck() form.
	 this.highscore = highscore;
	 
	 this.delayHandSave = setTimeout(function(thisObj) {thisObj.saveHand();}, 150, this);
   },
   
   
   loadHands: function(callback) {
      this.callback = callback;
      this.datastore.getSavedHands(this.loadHandData.bind(this));
   },
   
   
   loadHandData: function(rows) {
      this.handData = []; // put high-scoring hands into an array of {}s
      
      for (i=0; i < rows.length; i++) {
	 handDataSet = {};
	 handDataSet.playdate = parseInt(rows.item(i).playdate);
	 handDataSet.name = rows.item(i).name;
	 handDataSet.dealer = rows.item(i).dealer;
	 handDataSet.score = rows.item(i).score;
	 var cards = rows.item(i).cards;
	 var cardSet = cards.evalJSON();
	 handDataSet.hand = new Deck();
	 for (j=0; j < cardSet.length; j++) {
	    handDataSet.hand.cards.push(cardSet[j]);
	 }
	 this.handData.push(handDataSet);
      }
      
	 numHighHands = this.handData.length;
      if (numHighHands >= 2) {
	 this.handData.sort(byScore);
      }
      
      if(this.callback) {
	 this.callback();
      }
      
   },
   
   clearStatsData: function(callback) {
      Mojo.Log.info("game.clearStatsData");
      this.datastore.clearStatsData(callback);
   },
   
   loadStats: function(statCallback) {
      this.statCallback = statCallback;
      this.datastore.getStats(this.loadStatData.bind(this));
   },
   
   loadStatData: function(rows) {
      this.statData = []; // put high-scoring hands into an array of {}s
      gameStats = [];
      for (i=0; i < rows.length; i++) {
	 var statDataSet = {};
	 // Mojo.Log.info('stat data: %j', rows.item(i));
	 statDataSet.name = rows.item(i).name;
	 statDataSet.data = rows.item(i).data.evalJSON();
	 // this.statData.push(statDataSet);
	 gameStats.push(statDataSet);
      }
      
      if(this.statCallback) {
	 this.statCallback(gameStats);
      }
   },
   
   saveStats: function() {
      if(this.delaySaveStats != null) {
	 clearTimeout(this.delaySaveStats);
	 this.delaySaveStats = null;
      }
      this.datastore.writeStats(this.statData);
   },
   
   saveStatsSoon: function() {
      if(this.delaySaveStats != null) {
	 clearTimeout(this.delaySaveStats);
	 this.delaySaveStats = null;
      }
      this.delayStatsSave = setTimeout(function(thisObj) {thisObj.saveStats();}, 125, this);
   }
   
});

function byPlayDate(a,b){
   return b.playdate - a.playdate;
}

function byScore(a,b){
   return b.score - a.score;
}

function AvgStdDev(scoreObj) { // returns [total, num, average, std dev.]
   if (Object.isNumber(scoreObj)) {
      return [scoreObj,1,scoreObj,0];
   }
   
   var total = 0, avg = 0, stdev = 0, num = 0;
   for (var key in scoreObj) {
      if (scoreObj.hasOwnProperty(key)) {
	 num += parseInt(scoreObj[key]);
	 total += parseInt(scoreObj[key])*parseInt(key);
      }
   }
   if (num > 0) {
      avg = total/num;
   } 
   
   var sum = 0;
   if (num > 1) {
      for (var key in scoreObj) {
	 if (scoreObj.hasOwnProperty(key)) {
	    var deviant = parseInt(scoreObj[key])*Math.pow(parseInt(key)-avg,2);
	    sum += deviant;
	 }
      }
      stdev = Math.sqrt(sum/(num-1));
   }
   
   returnArr = [total,num,avg,stdev];
   // Mojo.Log.info("returns: %j", returnArr);
   return returnArr;
}
