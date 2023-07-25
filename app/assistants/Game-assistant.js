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

function GameAssistant(PGame) {
   this.game = PGame;
   this.game.backgroundCanvas();
}

GameAssistant.prototype.setup = function() {
   //if (this.game.gamePrefs.backGroundColor) {
   //   $("main").setStyle({'background-color':this.game.gamePrefs.backGroundColor});
   //}
   
   if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
      // Using a Pixi. Gird your loins...
      this.game.palmType = 'pixi';
   }
   
   // Initialize the DIV elements
   // 
   this.mainDiv = this.controller.get("main");
   
   if (this.game.palmType == 'pixi') {
      this.mainDiv.setStyle({'height':'400px'});
      this.stacksTop = 180;
   } else {
      this.stacksTop = 210;
   }      
   
   // put the deck of cards out, face down
   this.deckStack = new Element('div',{'id':'deckStack','class':'cardBox'});
   this.mainDiv.appendChild(this.deckStack);
   this.deckStack.setStyle({'left':'5px','top':this.stacksTop+'px'});
   
   this.cribStack = new Element('div',{'id':'cribStack','class':'cardBox'});
   this.mainDiv.appendChild(this.cribStack);
   this.cribStack.setStyle({'right':'5px','top':this.stacksTop+'px'});
   
   // Set up game board
   this.Ccards = this.controller.get("Ccards");
   this.Pcards = this.controller.get("Pcards");
   this.pCardModel = [];
   
   this.CcardBox = [];
   this.PcardBox = [];
   for (i = 0; i < 6; i++) {
      this.CcardBox[i] = new Element('div',{'id':'CcardBox'+i,'class':'cardBox'});
      this.CcardBox[i].setStyle({'top':'0px','left':((i*42)+10)+'px'});
      this.Ccards.appendChild(this.CcardBox[i]);
      this.PcardBox[i] = new Element('div',{'id':'PcardBox'+i,'class':'cardBox'});
      if (this.game.palmType == 'pixi') {
	 this.PcardBox[i].setStyle({'top':(this.stacksTop+81)+'px','left':(i*53)+'px'});
      } else {
	 this.PcardBox[i].setStyle({'top':(this.stacksTop+111)+'px','left':(i*53)+'px'});
	 // this.PcardBox[i].setStyle({'bottom':'90px','left':(i*53)+'px'});
      } 
      this.Pcards.appendChild(this.PcardBox[i]);
   } 
   
   // draw the cribbage peg board. might want to make the Board 'float' 
   // to allow for different resolutions.
   // (i.e., Pixi vs. Pre).
   if (this.game.palmType == 'pixi') {
      var boardTop = 120;
   } else {
      var boardTop = 150;
   }
   
   this.BoardPos = this.controller.get("Board");
   this.BoardPos.style.top = boardTop + "px";
   
   this.board = new Board();
   this.board.drawBoard();
   this.BoardPos.appendChild(this.board.pegBoard);
   this.boardPegs = new Board(); // pegs
   this.BoardPos.appendChild(this.boardPegs.pegBoard);
   
   /* this.holeColors = ['#333333','black']; */
   if (!this.game.playerPegColors) {
     this.game.playerPegColors = ['#1e90ff','blue'];
      //} else {
      //  Mojo.Log.info("gamePrefs.playerPegColors: %j", this.game.playerPegColors);
   }
   if (!this.game.computerPegColors) {
      this.game.computerPegColors = ['#dc143c','#b22222'];
      //} else {
      //  Mojo.Log.info("gamePrefs.computerPegColors: %j", this.game.computerPegColors);
   }
   
   this.Counter = new Element('div',{'id':'Counter','class':'scoreFont'});
   this.BoardPos.appendChild(this.Counter);
   this.Counter.setStyle({'position':'absolute','left':'3px','top':'-20px'});
   this.setPegLookups();
   
   // set up scoring Nodes
   this.scoreCommentScroller = new Element('div',{'id':'scoreCommentScroller','class':'prib-commentary','x-mojo-element':'Scroller'}); 
   if (this.game.gamePrefs.useAnimation) {
      this.scoreCommentScroller.addClassName('prib-webkit-opacity');
   }
   this.scoreComment = new Element('div',{'id':'scoreComment','class':'infoTxt'});
   this.scoreComment.setStyle({'text-align':'left','padding':'5px'});
   this.scoreCommentScroller.appendChild(this.scoreComment);
   this.scoreCommentScroller.setStyle({'left':'200px','top':'5px','zIndex':700});
   this.scoreCommentScroller.setOpacity(0);
   this.mainDiv.appendChild(this.scoreCommentScroller);
   
   this.game.cmdMenuModel = {
      visible: true,
	items: [
		{items:[{iconPath: 'images/playerIcon32.png',command:'doNothing'},{label: '000'}]},
		{items:[{iconPath: 'images/compIcon32.png',command:'doNothing'},{label: '000'}]}
		]
   };
   this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.game.cmdMenuModel);
   
   this.minHighHand = 19; // points required to save a high score
   this.scorePauseDuration = 900;
   this.numShuffles = 1;
   
   // this.controller.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKeyUpEvent.bindAsEventListener(this));
   // this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.handleKeyDownEvent.bindAsEventListener(this));
   this.cheatermode = '';
   this.controller.listen(this.controller.sceneElement, Mojo.Event.keypress, this.handleKeyPressEvent.bindAsEventListener(this));
   
   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);
}


GameAssistant.prototype.deactivate = function(event) {
   /* remove any event handlers you added in activate and do any other cleanup that should happen before
    this scene is popped or another scene is pushed on top */
   this.game.saveSoon();
}

GameAssistant.prototype.stageDeactivate = function() {
   this.scoreInfo($L("++ Stage deactivation in progress."));
   this.scoreInfo($L("++ Will resume in the #{stage} stage when you return.").interpolate({stage:this.game.stage}));
   this.game.saveSoon();
}

GameAssistant.prototype.stageActivate = function() {
   this.refreshScreen();
}


GameAssistant.prototype.cleanup = function(event) {
   this.game.saveSoon();
   for (i=0; i < this.game.handP.cardCount(); i++){
      Mojo.Event.stopListening(this.controller.get('Pcard'+i), Mojo.Event.tap, this.playCardHandler);
   } 
}

GameAssistant.prototype.handleKeyPressEvent = function(event) {
   // this will only attempt to influence the cut card to be something that is preferable to the player's hand. 
   this.cheatermode += String.fromCharCode(event.originalEvent.keyCode);
   clearcode = /xxx/;
   if (this.cheatermode == "wookiee") {
      if (this.game.letTheWookieeWin) {
	 this.game.letTheWookieeWin = false;
	 this.cheatermode = '';
	 this.scoreData($L("Wookiee mode off."));
      } else {
	 this.game.letTheWookieeWin = true;
	 this.cheatermode = '';
	 this.scoreData($L("I suggest a new strategy, R2: let the Wookiee win."));
      }
   } else if (clearcode.test(this.cheatermode)) {
      this.cheatermode = '';
      // this.scoreData("Cleared.");
   }
   // Mojo.Log.info("code: "+this.cheatermode);
}

GameAssistant.prototype.activate = function(event) {
   this.game.letTheWookieeWin = false;

   // handlers
   this.stageDeactivateBind = this.stageDeactivate.bind(this);
   this.stageActivateBind = this.stageActivate.bind(this);
   this.makeCribHandler = this.makeCrib.bindAsEventListener(this);
   this.cardsToCribHandler = this.cardsToCrib.bindAsEventListener(this);
   this.playCardHandler = this.playCard.bindAsEventListener(this);
   this.cutHandler = this.doCut.bindAsEventListener(this);
   this.dealHandler = this.doDeal.bindAsEventListener(this);
   this.scoreHandler = this.scoreButtPress.bindAsEventListener(this);
   this.finalBoardHandler = this.finalBoardPress.bindAsEventListener(this);
   
   this.controller.listen(this.controller.document, Mojo.Event.stageDeactivate,
			  this.stageDeactivateBind, true);
   this.controller.listen(this.controller.document, Mojo.Event.stageActivate,
			  this.stageActivateBind, true);
   
   if (this.game.cutHand){
      this.refreshScreen();
   } else {
      this.boardPegs.updateBoardSoon(this.compPegPos[0],this.game.computerPegColors,100);
      this.boardPegs.updateBoardSoon(this.compPegPos[this.compPegPos.length-1],this.game.computerPegColors,100);
      this.boardPegs.updateBoardSoon(this.playerPegPos[this.playerPegPos.length-1],this.game.playerPegColors,100);
      this.boardPegs.updateBoardSoon(this.playerPegPos[0],this.game.playerPegColors,100);
      
      this.game.deck.makeDeck(1);
      this.game.deck.shuffle(this.numShuffles);
      this.cleanUpCards();
      
      // this.setPlayerScore(59);
      // this.setComputerScore(59);
      
      if (this.game.gamePrefs.loserDeal) {
	 this.game.loadGameDates(this.checkLastGameStat.bind(this));
      } else {
	 if (this.game.gamePrefs.autoDeal) {
	    this.scoreData($L("Cutting to see who deals first."));
	    this.doCut();
	 } else {
	    this.scoreInfo($L("Tap the deck to cut. Low card deals first."));
	    Mojo.Event.listen(this.deckStackButton, Mojo.Event.tap, this.cutHandler);
	 }
      }
   }
}


GameAssistant.prototype.checkLastGameStat = function(gameDate) {
   // Mojo.Log.info('Num games:', gameDate.length);
   var lastPlayDate = '';
   var gD = gameDate.length;
   /* while (gD--) {
      lastPlayDate = gameDate[gD].playdate;
      Mojo.Log.info('Date: ', lastPlayDate);
   } */
   if (gD > 0) {
      lastPlayDate = gameDate[gD-1].playdate;
      // Mojo.Log.info('Last date: ', lastPlayDate);
      this.game.lastWinner(lastPlayDate,this.checkLastWinner.bind(this));
   } else {
      if (this.game.gamePrefs.autoDeal) {
	 this.scoreData($L("Cutting to see who deals first."));
	 this.doCut();
      } else {
	 this.scoreInfo($L("Tap the deck to cut. Low card deals first."));
	 Mojo.Event.listen(this.deckStackButton, Mojo.Event.tap, this.cutHandler);
      }
   }
}


GameAssistant.prototype.checkLastWinner = function(thePlayer,theWinner) {
   if (thePlayer == this.game.gamePrefs.playerName) {
      if (theWinner == 'player') {
	 this.game.currentDealer = "computer";
	 this.game.cutWinner = "computer";
	 this.game.stage = 'deal';
      } else {
	 this.game.currentDealer = "player";
	 this.game.cutWinner = "player";
	 this.game.stage = 'deal';
      }
      switch (this.game.cutWinner) {
       case 'player':
	 thisGameDealer = this.game.gamePrefs.playerName;
	 break;
       case 'computer':
	 thisGameDealer = $L("computer").toLowerCase();
	 break;
      }
      
      this.scoreData($L("First dealer is #{dealer}.").interpolate({dealer:thisGameDealer}));
      this.doCut();
      
   } else {
      if (this.game.gamePrefs.autoDeal) {
	 this.scoreData($L("New player, cutting to see who deals first."));
	 this.doCut();
      } else {
	 this.scoreInfo($L("New player, new cut. Tap the deck and the low card deals first."));
	 Mojo.Event.listen(this.deckStackButton, Mojo.Event.tap, this.cutHandler);
      }
   }
}


GameAssistant.prototype.refreshScreen = function() {
   this.scoreInfo($L("Welcome back!"));
   this.playedCardPosition = 65;
   
   this.boardPegs.updateBoardSoon(this.compPegPos[this.game.Score.computer],this.game.computerPegColors,10);
   this.boardPegs.updateBoardSoon(this.playerPegPos[this.game.Score.player],this.game.playerPegColors,10);
   if (this.game.OldScore.computer == 0){
      // if (this.game.shortGame) {
      this.boardPegs.updateBoardSoon(this.compPegPos[this.compPegPos.length-1],this.game.computerPegColors,30);
      // } else {
      // this.boardPegs.updateBoardSoon(this.compPegPos[121],this.game.computerPegColors,30);
      // }
   } else {
      this.boardPegs.updateBoardSoon(this.compPegPos[this.game.OldScore.computer],this.game.computerPegColors,30);
   }
   if (this.game.OldScore.player == 0){
      //if (this.game.shortGame) {
      this.boardPegs.updateBoardSoon(this.playerPegPos[this.playerPegPos.length-1],this.game.playerPegColors,30);
      //} else {
      // this.boardPegs.updateBoardSoon(this.playerPegPos[121],this.game.playerPegColors,30);
      //}
   } else {
      this.boardPegs.updateBoardSoon(this.playerPegPos[this.game.OldScore.player],this.game.playerPegColors,30);
   }
   
   this.addDeckStackButton();
   
   this.showDecks();
   this.showCutCard();
   this.showComputerCards();
   this.showCribCards();
   
   switch(this.game.stage) {
    case 'deal':
      switch (this.game.currentDealer){
       case "player":
	 CMlabel = $L("It's your turn to deal.");
	 break;
       case "computer":
	 CMlabel = $L("Pre's deal.");
	 break;
      }
      this.scoreData(CMlabel);
      this.cleanUpCards();
      if (this.game.gamePrefs.autoDeal) {
	 this.scoreData($L("Auto-dealing."));
	 setTimeout(this.DealButtPress.bind(this),1500);
      } else {
	 Mojo.Event.listen(this.deckStackButton, Mojo.Event.tap, this.dealHandler);
      }
      break;
    case 'play':
      if (this.game.handP.cardCount() > 4) {
	 if (this.game.handC.cardCount() > 4) {
	    this.makeCribComp();
	 }
	 this.iToldYouSo = 0;
	 this.showPlayerCards(this.makeCribHandler);
	 this.addCribStackButton();
      } else {
	 this.cardsLeftToPlay();
	 numCompCards = this.game.playableCards.computer.length;
	 numPlayerCards = this.game.playableCards.player.length;
	 
	 if (this.game.runScore == 0
	     && numCompCards < 4
	     && numPlayerCards < 4) {
	    this.playedCardPosition += 33;
	 } else if (this.game.runScore == 0
		    && numCompCards == 4
		    && numPlayerCards == 4) {
	    this.playedCardPosition += 0;
	 } else {
	    this.playedCardPosition += 24;
	 }
	 
	 // invert game turn to be correct
	 switch (this.game.gameTurn) {
	  case 'player':
	    this.game.gameTurn = 'computer';
	    break;
	  case 'computer':
	    this.game.gameTurn = 'player';
	    break;
	 }
	 
	 this.moveCribCards();
	 this.showPlayerCards(this.playCardHandler);
	 this.playGame();
      }
      break;
    case 'hand':
      var notAHandler = 1;
      
      this.moveCribCards();
      if (this.game.scoreArr.length > 0) {
	 this.game.scoreArr.unshift(this.game.currentScore);
	 if (this.game.scoreArr.indexOf('player') >= 0) {
	    this.showPlayerCards(notAHandler); 
	 } else {
	    this.showPlayerCards(); // already scored player's hand.
	 }
	 this.showHandScores();
      }
      break;
    case 'crib':
      break;
   }
}


GameAssistant.prototype.doCut = function(event) {
   if (this.game.stage == 'cut') {
      this.CutCardsPress();
   }   
   
   if (this.game.stage == 'deal') {
      if (this.game.gamePrefs.fiveCardGame) {
	 pScored = 3;
	 this.scoreData($L("Non-dealer gets #{score} for 'last'.").interpolate({score:pScored}));
	 switch(this.game.currentDealer) {
	  case 'player':
	    this.setComputerScore(pScored);
	    // this.updateCanvasBoard('computer');
	    break;
	  case 'computer':
	    this.setPlayerScore(pScored);
	    // this.updateCanvasBoard('player');
	    break;
	 }
      }
      
      this.game.cutHand += 1;
      this.game.saveSoon();
   
      if (!this.game.gamePrefs.autoDeal) {
	 Mojo.Event.stopListening(this.deckStackButton, Mojo.Event.tap, this.cutHandler);
      }
      switch (this.game.currentDealer) {
       case "player":
	 CMlabel = $L("#{name}'s crib.").interpolate({name:this.game.gamePrefs.playerName});
	 break;
       case "computer":
	 CMlabel = $L("Pre's crib.");
	 break;
      }
      this.scoreData(CMlabel);
      if (this.game.gamePrefs.autoDeal) {
	 this.scoreData($L("Auto-dealing."));
	 this.DealButtPress();
      } else {
	 this.scoreData($L("Tap the deck to deal."));
	 Mojo.Event.listen(this.deckStackButton, Mojo.Event.tap, this.dealHandler);
      }
   }
}


GameAssistant.prototype.doDeal = function(event) {
   Mojo.Event.stopListening(this.deckStackButton, Mojo.Event.tap, this.dealHandler);
   this.DealButtPress(); 
}



GameAssistant.prototype.handleCommand = function(event) {
   if(event.type == Mojo.Event.command) {
      this.cmd = event.command;
      
      switch(this.cmd) {
       case "do-newGame":
	 this.controller.showAlertDialog({
            onChoose: function(value) {if (value) {
	       this.InitGame(false);
	    }},
	    title: "End Game",
	    message: "Are you sure you want to end current game? ",
	    choices:[
		     {label: "Yes", value:true},
		     {label: "No", value:false}
		    ]
	 }); 
	 break;
      } 
   }
}


GameAssistant.prototype.scoreInfo = function(info) {
   this.scoreCommentScroller.setOpacity(1);
   if (info.substring(0,3) == "++ ") {
      this.scoreComment.innerHTML += info+'<br>';
   } else {
      this.game.commentary += '&#183; '+info+'<br>';
      this.scoreComment.innerHTML = this.game.commentary;
   }
   $('scoreCommentScroller').mojo.revealBottom();
}


// padScore: pad number with leading zeros to be a three-digit string. 
// This is a work-around for the palm truncating-text 'feature' of the 
// command menu label, which won't show single digit numbers or 11.
padScore = function(number){
   numStr = number+''; // make the number into a string.
   numArr = [];
   
   for (i=0; i<numStr.length; i++) {
      numArr.push(numStr[i]);
   }
   while(numArr.length < 3) {
      numArr.unshift('0'); // pad first part with zeros
   }
   return numArr.join('');
}


GameAssistant.prototype.scoreData = function(info) {
      // Mojo.Log.info('Scoreboard: ', info);
      if (info.length > 0) {
	 this.scoreInfo(info);
      }
      var Playerscore = padScore(this.game.Score.player);
      var Computerscore = padScore(this.game.Score.computer+"");
      this.game.cmdMenuModel.items = [{items:[{iconPath: 'images/playerIcon32.png', command:'doNothing'},
					      {label: Playerscore}]},
				      {items:[{iconPath: 'images/compIcon32.png', command:'doNothing'},
					      {label: Computerscore}]}];
      this.controller.modelChanged(this.game.cmdMenuModel);
}


GameAssistant.prototype.CutCardsPress = function() {
   do {
      if (this.game.cut.cardCount() > 0) {
	 // Mojo.Log.info('Cut a pair!');
	 this.game.deck.combine(this.game.cut);
	 this.game.deck.shuffle(this.numShuffles);
      }
      this.game.cut.addCard(this.game.deck.draw(-1));
      this.game.cut.addCard(this.game.deck.draw(-1));
   } while (this.game.cut.cards[0].ordinal == this.game.cut.cards[1].ordinal);
   
   // not only should we randomize the cards being cut, but also the order that they are cut! 
   // but will this shut the idiots up? never! they just like to complain. 
   if (Math.floor(Math.random()*2)) {
      indxP = 0; indxC= 1;
   } else {
      indxP = 1; indxC= 0;
   }
   

   cutCard1 = this.game.cut.cards[indxP].canvasNode('cutCard1');
   cutCard1.setStyle({'left':'5px','top':this.stacksTop+'px','zIndex':'332'});
   this.mainDiv.appendChild(cutCard1);
   cutCard2 = this.game.cut.cards[indxC].canvasNode('cutCard2');
   cutCard2.setStyle({'left':'5px','top':this.stacksTop+'px','zIndex':'333'});
   this.mainDiv.appendChild(cutCard2);
   cutCard1.setStyle({'left':'89px','top':this.stacksTop+'px'});
   cutCard2.setStyle({'left':'239px','top':this.stacksTop+'px'});
   
   var timeOut = 3000;
   
   lCards = {card0r: this.game.cut.cards[indxP].rank, card1r: this.game.cut.cards[indxC].rank};
   card0o = this.game.cut.cards[indxP].ordinal;
   card1o = this.game.cut.cards[indxC].ordinal;
   c0Str = Mojo.Format.formatChoice(card0o,$L("#Your card is a #{card0r}. "),lCards);
   c1Str = Mojo.Format.formatChoice(card1o,$L("#My card is a #{card1r}. "),lCards);
   if (this.game.cut.cards[indxP].ordinal > this.game.cut.cards[indxC].ordinal) {
      dealStr = $L("I deal first.");
      this.scoreInfo(c0Str.concat(c1Str,dealStr));
      this.game.currentDealer = "computer";
      this.game.cutWinner = "computer";
      this.game.stage = 'deal';
   } else if (this.game.cut.cards[indxP].ordinal < this.game.cut.cards[indxC].ordinal) {
      dealStr = $L("You deal first.");
      this.scoreInfo(c0Str.concat(c1Str,dealStr));
      this.game.currentDealer = "player";
      this.game.cutWinner = "player";
      this.game.stage = 'deal';
   } else if (this.game.cut.cards[indxP].ordinal == this.game.cut.cards[indxC].ordinal) {
      dealStr = $L("We tied. Cut again!");
      this.scoreInfo(c0Str.concat(c1Str,dealStr));
      this.game.stage = 'cut';
      timeOut = 500;
   }

   var t = this;
   setTimeout(function(){t.mainDiv.removeChild(cutCard1);},timeOut);
   setTimeout(function(){t.mainDiv.removeChild(cutCard2);},timeOut);
   
   // this.game.deck.combine(this.game.cut);
   this.cleanUpCards();
   this.game.deck.shuffle(this.numShuffles); // make sure the deck is good and random.
   
}

GameAssistant.prototype.DealButtPress = function(){
   // increment the total and update the display
   this.game.numHands++; // increase counter for number of hands dealt
   this.game.stage = 'play';
   this.cleanUpCards();
   this.scoreCommentScroller.setOpacity(0);
   
   timer = 0;
   this.game.deck.shuffle(this.numShuffles);
   if (this.game.fiveCardGame) {
      dealCount = 5;
      this.game.crib.addCard(this.game.deck.deal());
      this.game.crib.addCard(this.game.deck.deal());
   } else {
      dealCount = 6;
   }
   
   
   for (i=0; i < dealCount; i++){
      switch (this.game.currentDealer) {
       case "player":
	 this.game.handC.addCard(this.game.deck.deal());
	 this.game.handP.addCard(this.game.deck.deal());
	 if (this.game.gamePrefs.useAnimation) {
	    setTimeout(this.dealComputerCards.bind(this,i),timer);
	    setTimeout(this.dealPlayerCards.bind(this,i),timer+250);
	    timer += 500;
	 } else {
	    this.dealComputerCards(i);
	    this.dealPlayerCards(i);
	 }
	 break;
       case "computer":
	 this.game.handP.addCard(this.game.deck.deal());
	 this.game.handC.addCard(this.game.deck.deal());
	 if (this.game.gamePrefs.useAnimation) {
	    setTimeout(this.dealPlayerCards.bind(this,i),timer);
	    setTimeout(this.dealComputerCards.bind(this,i),timer+250);
	    timer += 500;
	 } else {
	    this.dealPlayerCards(i);
	    this.dealComputerCards(i);
	 }
	 break;
       default:
	 this.game.handP.addCard(this.game.deck.deal());
	 this.game.handC.addCard(this.game.deck.deal());
	 if (this.game.gamePrefs.useAnimation) {
	    setTimeout(this.dealPlayerCards.bind(this,i),timer);
	    setTimeout(this.dealComputerCards.bind(this,i),timer+250);
	    timer += 500;
	 } else {
	    this.dealPlayerCards(i);
	    this.dealComputerCards(i);
	 }
	 break;
      }
   }
   
   this.game.handP.cards.sort(sortCardsbyRank);
   if (Math.floor(Math.random()*2)) {
      this.game.handC.cards.sort(sortCardsbyRank);
   } else {
      this.game.handC.cards.sort(sortCardsbyRankRev);
   }
   
   // this.checkCardsInHands();
   
   this.playedCardPosition = 65;
   this.game.cribCards = []; //reset array
   this.iToldYouSo = 0;
   
   setTimeout(this.showComputerCards.bind(this),timer);
   
   setTimeout(this.showPlayerCards.bind(this,this.makeCribHandler),timer+900);
   
   setTimeout(this.makeCribComp.bind(this),timer+1000);
   
   setTimeout(this.addCribStackButton.bind(this),timer+1200);
}


GameAssistant.prototype.checkCardsInHands = function() {
   // diagnostics
   
   pCardArray = [];
   for (i=0; i< this.game.handP.cardCount(); i++) {
      pCardArray.push(''+this.game.handP.cards[i].suit+this.game.handP.cards[i].rank);
   }
   cCardArray = [];
   for (i=0; i< this.game.handC.cardCount(); i++) {
      cCardArray.push(''+this.game.handC.cards[i].suit+this.game.handC.cards[i].rank);
   }
   Mojo.Log.info('Player cards: %j', pCardArray);
   Mojo.Log.info('Computer cards: %j', cCardArray);
}


GameAssistant.prototype.checkCardsInDeck = function() {
   // diagnostics
   
   dCardArray = [];
   for (i=0; i< this.game.deck.cardCount(); i++) {
      dCardArray.push(''+this.game.deck.cards[i].suit+this.game.deck.cards[i].rank);
   }
   Mojo.Log.info('Deck: '+ Object.toJSON(dCardArray));
}


GameAssistant.prototype.dealPlayerCards = function(boxNum){
   if (boxNum >=0 && boxNum < 6) {
      cardNode = this.game.handP.cards[boxNum].canvasBack('Pcard'+boxNum,this.game.gamePrefs.cardBackColor);
      cardNode.setStyle({'top':'0px','left':'0px'});
      this.PcardBox[boxNum].appendChild(cardNode);
   }
}


GameAssistant.prototype.dealComputerCards = function(boxNum){
   if (boxNum >=0 && boxNum < 6) {
      cardNode = this.game.handC.cards[boxNum].canvasBack('Ccard'+boxNum,this.game.gamePrefs.cardBackColor);
      cardNode.setStyle({'top':'0px','left':'0px'});
      this.CcardBox[boxNum].appendChild(cardNode);
   }
}


GameAssistant.prototype.showPlayerCards = function(listenHandler){
      for (i=0; i < this.PcardBox.length; i++){
	 while (this.PcardBox[i].lastChild) {
	    this.PcardBox[i].lastChild.remove();
	 }	 
      }
      
      for (i=0; i < this.game.handP.cardCount(); i++){
	 var cardNum = i;
	 cardNode = this.game.handP.cards[cardNum].canvasNode('Pcard'+cardNum);
	 this.controller.setupWidget( 'Pcard'+cardNum, {}, {disabled: false} );
	 this.PcardBox[cardNum].appendChild(cardNode);
	 if (listenHandler && !this.game.endedGame()) {
	    if (!this.game.handP.cards[cardNum].isPlayed && !this.game.handP.cards[cardNum].isSelected) {
	       Mojo.Event.listen(this.controller.get('Pcard'+cardNum), Mojo.Event.tap, listenHandler);
	    } else if (this.game.handP.cards[cardNum].isPlayed) {
	       this.playedCardPosition = Math.max(this.playedCardPosition,this.game.handP.cards[cardNum].isPlayed);
	       posVar = $('PcardBox'+cardNum).positionedOffset();
	       newTop = -(posVar.top - this.stacksTop - 5);
	       newLeft = -(posVar.left - this.game.handP.cards[cardNum].isPlayed);
	       $('Pcard'+cardNum).setStyle({'left':newLeft+'px','top':newTop+'px','zIndex':this.game.handP.cards[cardNum].isPlayed});
	    } else if (this.game.handP.cards[cardNum].isSelected) {
	       Mojo.Event.listen(this.controller.get('Pcard'+cardNum), Mojo.Event.tap, listenHandler);
	       $('Pcard'+cardNum).style.top = "-18px";
	       this.game.cribCards.push(cardNum);
	    }
	 }
      }
}


GameAssistant.prototype.showComputerCards = function(){
      for (i=0; i < this.CcardBox.length; i++){
	 while (this.CcardBox[i].lastChild) {
	    this.CcardBox[i].lastChild.remove();
	 }
      }
      
      
      for (i=0; i < this.game.handC.cardCount(); i++){
	 var cardNum = i;
	 if (this.game.stage == 'hand' && this.game.currentScore != 'computer') {
	    cardNode = this.game.handC.cards[i].canvasNode('Ccard'+i);
	    this.CcardBox[i].appendChild(cardNode);
	 } else if (this.game.stage == 'hand' && this.game.currentScore == 'computer') {
	    cardNode = this.game.handC.cards[i].canvasNode('Ccard'+i);
	    this.CcardBox[i].appendChild(cardNode);
	    this.playedCardPosition = Math.max(this.playedCardPosition,this.game.handC.cards[i].isPlayed);
	    posVar = $('CcardBox'+i).positionedOffset();
	    newTop = -(posVar.top - this.stacksTop);
	    newLeft = -(posVar.left - this.game.handC.cards[i].isPlayed);
	    $('Ccard'+i).setStyle({'left':newLeft+'px','top':newTop+'px','zIndex':this.game.handC.cards[i].isPlayed});
	 } else if (!this.game.handC.cards[i].isPlayed) {
	    cardNode = this.game.handC.cards[i].canvasBack('Ccard'+i,this.game.gamePrefs.cardBackColor);
	    this.CcardBox[i].appendChild(cardNode);
	 } else if (this.game.handC.cards[i].isPlayed) {
	    cardNode = this.game.handC.cards[i].canvasNode('Ccard'+i);
	    this.CcardBox[i].appendChild(cardNode);
	    this.playedCardPosition = Math.max(this.playedCardPosition,this.game.handC.cards[i].isPlayed);
	    posVar = $('CcardBox'+i).positionedOffset();
	    newTop = -(posVar.top - this.stacksTop);
	    newLeft = -(posVar.left - this.game.handC.cards[i].isPlayed);
	    $('Ccard'+i).setStyle({'left':newLeft+'px','top':newTop+'px','zIndex':this.game.handC.cards[i].isPlayed});
	 }
      }
}


GameAssistant.prototype.showCribCards = function(){
   while (this.cribStack.lastChild) {      
      this.cribStack.lastChild.remove();
   }
   for (i=0; i < this.game.crib.cardCount(); i++){
      cardNode = this.game.crib.cards[i].canvasBack('CrCard'+i,this.game.gamePrefs.cardBackColor);
      cardNode.setStyle({'zIndex':i});
      this.cribStack.appendChild(cardNode);
   }
}


GameAssistant.prototype.showDecks = function(){
      var numCards = this.game.deck.cardCount();
      var cardNodes = this.deckStack.childNodes;
      var stackNode;
      
      if (cardNodes.length == 1 && numCards > 0) {
	 for (i=0; i < numCards; i +=10) {
	    stackNode = this.game.deck.cards[i].canvasBack('dstk'+i,this.game.gamePrefs.cardBackColor);
	    stackNode.setStyle({'position':'absolute','top':'0px','left':i/10+'px','zIndex':i});
	    this.deckStack.appendChild(stackNode);
	 };
      }
}


GameAssistant.prototype.cardsToCrib = function(event){
      if ((!this.game.fiveCardGame && this.game.cribCards.length < 2)
	  || (this.game.fiveCardGame && this.game.cribCards.length < 1)) {
	 for (i=0; i < this.game.cribCards.length; i++) {
	    cardNum = this.game.cribCards.pop();
	    $('Pcard'+cardNum).style.top = '0px';
	    this.game.handP.cards[cardNum].isSelected = 0;
	 }
	 if (this.game.currentDealer == 'computer') {
	    if (this.game.fiveCardGame) {
	       hintCards = this.game.handP.toCrib5('player',-1);
	    } else {
	       hintCards = this.game.handP.toCrib('player',-1);
	    }
	 } else {
	    if (this.game.fiveCardGame) {
	       hintCards = this.game.handP.toCrib5('computer',-1);
	    } else {
	       hintCards = this.game.handP.toCrib('computer',-1);
	    }
	 }
	 for (i=0; i < hintCards.cards.length; i++) {
	    for (j=0; j < this.game.handP.cards.length; j++) {
	       if ((hintCards.cards[i].rank == this.game.handP.cards[j].rank)
		   && (hintCards.cards[i].suit == this.game.handP.cards[j].suit)){
		  $('Pcard'+j).style.top = "-18px";
		  this.game.handP.cards[j].isSelected = 1;
		  this.game.cribCards.push(j);
	       }
	    }
	 }
      } else if ((!this.game.fiveCardGame && this.game.cribCards.length == 2) 
		 || (this.game.fiveCardGame && this.game.cribCards.length == 1)) {
	 Mojo.Event.stopListening(this.cribStackButton, Mojo.Event.tap, this.cardsToCribHandler);

	 for (i=this.game.handP.cards.length-1; i >= 0; i--) {
	    Mojo.Event.stopListening(this.controller.get('Pcard'+i), Mojo.Event.tap, this.makeCribHandler);
	    while (this.PcardBox[i].lastChild) {
	       this.PcardBox[i].lastChild.remove();
	    }
	    if (this.game.handP.cards[i].isSelected) {
	       this.game.crib.addCard(this.game.handP.draw(i));
	       var cribSize = this.game.crib.cards.length;
	       cardNode = this.game.crib.cards[cribSize-1].canvasBack('cribCard',this.game.gamePrefs.cardBackColor);
	       this.cribStack.appendChild(cardNode); 
	    }
	 }
	 
	 this.showPlayerCards();
	 // cut the starter card and then go into playGame loop.
	 if (this.game.letTheWookieeWin) {
	    prefOrd = this.game.handP.prefOrd();
	 } else {
	    prefOrd = [];
	 }
	 this.cutPlayCard(prefOrd);
	 setTimeout(this.playGame.bind(this),1000);
      } else {
	 ;
      }
}


GameAssistant.prototype.makeCrib = function(event){
   
      var cribCard = event.target.id;
      var cardNum = parseInt(cribCard.replace("Pcard",""));
      
      if (!this.game.handP.cards[cardNum].isSelected) {
	 this.game.cribCards.push(cardNum);
      } else if (this.game.handP.cards[cardNum].isSelected) {
	 // pull card out of cribCards and reset isSelected
	 mi = -1;
	 for (i=0; i < this.game.cribCards.length; i++) {
	    if (this.game.cribCards[i] == cardNum) {
	       mi = i;
	    }
	 }
	 if (mi >= 0) {
	    this.game.cribCards.splice(mi,1);
	    $('Pcard'+cardNum).style.top = '0px';
	    this.game.handP.cards[cardNum].isSelected = 0;
	 }
      }
      
      while (this.game.cribCards.length > 2) {
	 noCribNum = this.game.cribCards.shift();
	 noCribCard = 'Pcard'+noCribNum;
	 $(noCribCard).style.top = "0px";
	 this.game.handP.cards[noCribNum].isSelected = 0;
      }
      for (i=0; i < this.game.cribCards.length; i++) {
	 curCard = this.game.cribCards[i];
	 $('Pcard'+curCard).style.top = "-18px";
	 this.game.handP.cards[curCard].isSelected = 1;
      }
      
      if (this.game.cribCards.length >= 2 && !this.iToldYouSo) {
	 this.scoreData($L("Tap the crib deck to send the cards."));
	 this.iToldYouSo++;
      }
      // Mojo.Log.info(' %j', this.game.handP);
}


GameAssistant.prototype.makeCribComp = function(){
   var compCribCard;
   var oldHand;
   
   while (this.game.handC.cardCount() > 4) {
      
      // get the cards to add to crib (sloppy now and only based
      // on highest score available for the given hand).
      if (this.game.fiveCardGame) {
	 compCribCard = this.game.handC.toCrib5(this.game.currentDealer,parseInt(this.game.gameLevel));
      } else {
	 compCribCard = this.game.handC.toCrib(this.game.currentDealer,parseInt(this.game.gameLevel));
      }
      
      if (compCribCard) {
	 for (j=0; j < compCribCard.cards.length; j++) {
	    var compRank = compCribCard.cards[j].rank;
	    var compSuit = compCribCard.cards[j].suit;
	    for (i=0; i < this.game.handC.cardCount(); i++) {
	       if (this.game.handC.cards[i].rank == compRank && this.game.handC.cards[i].suit == compSuit) {
		  this.game.crib.addCard(this.game.handC.draw(i));
	       }
	    }
	 }	 
      }
      this.showComputerCards();
      this.showCribCards();
   }   
   this.scoreCommentScroller.setOpacity(1);
   switch (this.game.currentDealer){
    case "player":
      CMlabel = $L("Tap your cards to send to your crib.");
      this.Counter.innerHTML = $L("#{name}'s crib.").interpolate({name:this.game.gamePrefs.playerName});
      break;
    case "computer":
      CMlabel = $L("Tap your cards to send to the Pre's crib.");
      this.Counter.innerHTML = $L("Pre's crib.");
      break;
   }
   this.scoreData(CMlabel);
}


GameAssistant.prototype.cleanUpCards = function(){
   if (this.cheatermode != "wookiee")
     this.cheatermode = '';
   
   this.game.crib.combine(this.game.handP);
   this.game.crib.combine(this.game.handC);
   this.game.crib.combine(this.game.cut);
   this.game.deck.combine(this.game.crib);
   
   if (this.game.deck.cardCount() != 52) {
      Mojo.Log.warn('Deck count is '+this.game.deck.cardCount());
   }
   
   // remove all nodes from the hand, deck, and crib stacks.
   this.cleanDeck();
   this.cleanCrib();
   
   for (i=0; i < this.PcardBox.length; i++){
      var PchildNodes = this.PcardBox[i].childNodes;
      while (PchildNodes.length > 0) {
	 PchildNodes[0].remove();
      }
   }
   for (i=0; i < this.CcardBox.length; i++){
      var CchildNodes = this.CcardBox[i].childNodes;
      while (CchildNodes.length > 0) {
	 CchildNodes[0].remove();
      }     
   }
   
   this.addDeckStackButton();
   this.showDecks();
}


GameAssistant.prototype.cleanDeck = function(){
   while (this.deckStack.lastChild) {      
      this.deckStack.lastChild.remove();
   }
}

GameAssistant.prototype.cleanCrib = function(){
   while (this.cribStack.lastChild) {      
      this.cribStack.lastChild.remove();
   }
}


GameAssistant.prototype.addDeckStackButton = function(){
      this.deckStackButton = new Element('div',{'id':'deckStackButton', 
	   'class':'cardBox', 'x-mojo-element':'Button'});
      this.deckStackButton.setStyle({'zIndex':333,'opacity':'0'});
      this.deckStack.appendChild(this.deckStackButton);
      this.controller.setupWidget('deckStackButton',{},{});
}


GameAssistant.prototype.addCribStackButton = function(){
      this.cribStackButton = new Element('div',{'id':'cribStackButton', 
	   'class':'cardBox', 'x-mojo-element':'Button'});
      this.cribStackButton.setStyle({'zIndex':666,'opacity':'0'});
      this.cribStack.appendChild(this.cribStackButton);
      this.controller.setupWidget('cribStackButton',{},{});
      
      Mojo.Event.listen(this.cribStackButton, Mojo.Event.tap, this.cardsToCribHandler);

}


GameAssistant.prototype.setPlayerScore = function(pScore) {
   if (this.game.endedGame()) {
      // don't score if the game is ended.
      pScored = 0;
   } else {
      // ensure that scores never go above 61 or 121
      if (this.game.shortGame) {
	 pScored = Math.min(pScore,61-this.game.Score.player);
      } else {
	 pScored = Math.min(pScore,121-this.game.Score.player);
      }
   }
   
   switch(this.game.stage) {
    case 'hand':
      this.game.HandScoreTNG.player.push(pScore);
      this.game.gameHandScoreTNG.player.push(pScored);
      this.game.scorePerRound.player += pScore;
      break;
    case 'crib':
      this.game.CribScoreTNG.player.push(pScore);
      this.game.gameCribScoreTNG.player.push(pScored);
      this.game.scorePerRound.player += pScore;
      break;
    case 'play':
      this.game.PlayScoreRun.player += pScore;
      this.game.gamePlayScoreRun.player += pScored;
      this.game.scorePerRound.player += pScore;
      break;
   }
   if (pScored > 0) {
      this.settleOldScores = this.game.OldScore.player;
      this.game.OldScore.player = this.game.Score.player;
      this.game.Score.player += pScored;
      this.updateCanvasBoard('player');
   } else {
      this.scorePauseDuration = 900;
   }
}


GameAssistant.prototype.setComputerScore = function(pScore) {
   if (this.game.endedGame()) {
      // don't score if the game is ended.
      pScored = 0;
   } else {
      // ensure that scores never go above 61 or 121
      if (this.game.shortGame) {
	 pScored = Math.min(pScore,61-this.game.Score.computer);
      } else {
	 pScored = Math.min(pScore,121-this.game.Score.computer);
      }
   }
   switch(this.game.stage) {
    case 'hand':
      this.game.HandScoreTNG.computer.push(pScore);
      this.game.gameHandScoreTNG.computer.push(pScored);
      this.game.scorePerRound.computer += pScore;
      break;
    case 'crib':
      this.game.CribScoreTNG.computer.push(pScore);
      this.game.gameCribScoreTNG.computer.push(pScored);
      this.game.scorePerRound.computer += pScore;
      break;
    case 'play':
      this.game.PlayScoreRun.computer += pScore;
      this.game.gamePlayScoreRun.computer += pScored;
      this.game.scorePerRound.computer += pScore;
      break;
   }
   if (pScored > 0) {
      this.settleOldScores = this.game.OldScore.computer;
      this.game.OldScore.computer = this.game.Score.computer;
      this.game.Score.computer += pScored;
      this.updateCanvasBoard('computer');
   } else {
      this.scorePauseDuration = 900;
   }
}


GameAssistant.prototype.totalScorePerRound = function(){
   switch (this.game.currentDealer) {
    case 'player':
      this.game.dealerTotalScore.player.push(this.game.scorePerRound.player);
      this.game.poneTotalScore.computer.push(this.game.scorePerRound.computer);
      break;
    case 'computer':
      this.game.dealerTotalScore.computer.push(this.game.scorePerRound.computer);
      this.game.poneTotalScore.player.push(this.game.scorePerRound.player);
      break;
   }
   
   Mojo.Log.info("round: %j",this.game.scorePerRound);
   this.game.scorePerRound.player = 0;
   this.game.scorePerRound.computer = 0;
}


GameAssistant.prototype.totalPlayScores = function(){
   if (this.game.PlayScoreRun.player > 0
       || this.game.PlayScoreRun.computer > 0) {
      this.game.PlayScoreTNG.player.push(this.game.PlayScoreRun.player);
      this.game.PlayScoreTNG.computer.push(this.game.PlayScoreRun.computer);
      this.game.gamePlayScoreTNG.player.push(this.game.gamePlayScoreRun.player);
      this.game.gamePlayScoreTNG.computer.push(this.game.gamePlayScoreRun.computer);
      this.game.PlayScoreRun.player = 0;
      this.game.PlayScoreRun.computer = 0;
      this.game.gamePlayScoreRun.player = 0;
      this.game.gamePlayScoreRun.computer = 0;
   }
}


GameAssistant.prototype.showHandScores = function(){
   // record the total score for the play
   this.totalPlayScores();
   
   this.game.stage = 'hand';
   this.Counter.innerHTML = '';
   
   if (this.game.scoreArr.length == 0) {
      this.scorePauseDuration = 900;
      switch (this.game.currentDealer) {
       case 'player':
	 this.game.scoreArr = ['computer','player','crib','newDeal'];
	 break;
       case 'computer':
	 this.game.scoreArr = ['player','computer','crib','newDeal'];
	 break;
      }
   }
   
   this.game.currentScore = this.game.scoreArr.shift();
   
   // Mojo.Log.info('Scoring for ', this.game.currentScore);
   if (!this.game.endedGame()) {
      switch (this.game.currentScore) {
       case 'player':
	 if (this.game.gamePrefs.autoScore) {
	    var target = 'doPScore';
	    setTimeout(this.scoreButtPress.bind(this,target),this.scorePauseDuration);
	 } else {
	    this.scoreBoxTap = new Element('div',{'id':'doPScore','class':'prib-doScore','x-mojo-element':'button'});
	    this.scoreBoxTap.innerHTML = $L("Tap to score your hand.");
	    if (this.game.palmType == 'pixi') {
	       this.scoreBoxTap.setStyle({'top':'-15px','zIndex':100});
	    } else {
	       this.scoreBoxTap.setStyle({'top':'0px','zIndex':100});
	    }
	    this.PcardBox[1].appendChild(this.scoreBoxTap);
	    // this.scoreBoxTap.innerHTML = 'Tap to score.';
	    this.controller.setupWidget('doPScore',{},{});
	    Mojo.Event.listen(this.scoreBoxTap, Mojo.Event.tap, this.scoreHandler);
	 }
	 break;
       case 'computer':
	 if (this.game.gamePrefs.autoScore) {
	    var target = 'doCScore';
	    setTimeout(this.scoreButtPress.bind(this,target),this.scorePauseDuration);
	 } else {
	    this.scoreBoxTap = new Element('div',{'id':'doCScore','class':'prib-doScore','x-mojo-element':'button'});
	    this.scoreBoxTap.innerHTML = $L("Tap to score Pre's hand.");
	    this.scoreBoxTap.setStyle({'top':'10px','zIndex':100});
	    this.CcardBox[1].appendChild(this.scoreBoxTap);
	    this.controller.setupWidget('doCScore',{},{});
	    Mojo.Event.listen(this.scoreBoxTap, Mojo.Event.tap, this.scoreHandler);
	 }
	 break;
       case 'crib':
	 if (this.game.gamePrefs.autoScore) {
	    var target = 'doCribScore';
	    setTimeout(this.scoreButtPress.bind(this,target),this.scorePauseDuration);
	 } else {
	    switch (this.game.currentDealer) {
	     case "player":
	       CMlabel = $L("#{name}'s crib.").interpolate({name:this.game.gamePrefs.playerName});
	       break;
	     case "computer":
	       CMlabel = $L("Pre's crib.");
	       break;
	    }
	    this.Counter.innerHTML = CMlabel;
	    switch (this.game.currentDealer) {
	     case 'player':
	       CMlabel = $L("Tap to score #{name}'s crib.").interpolate({name:this.game.gamePrefs.playerName});  // this.game.gamePrefs.playerName+"'s crib";
	       break;
	     case 'computer':
	       CMlabel = $L("Tap to score Pre's crib.");
	       break;
	    }
	    this.scoreBoxTap = new Element('div',{'id':'doCribScore','class':'prib-doScore','x-mojo-element':'button'});
	    this.scoreBoxTap.innerHTML = CMlabel;
	    this.scoreBoxTap.setStyle({'left':'70px','zIndex':100});
	    this.deckStack.appendChild(this.scoreBoxTap);
	    this.controller.setupWidget('doCribScore',{},{});
	    Mojo.Event.listen(this.scoreBoxTap, Mojo.Event.tap, this.scoreHandler);
	 }
	 break;
       case 'newDeal':
	 // Mojo.Log.info('newDeal');
	 if (!this.game.gamePrefs.autoScore) {
	    Mojo.Event.stopListening(this.scoreBoxTap, Mojo.Event.tap, this.scoreHandler);
	 }
	 
	 this.totalScorePerRound();
	 this.game.stage = 'deal';	    
	 this.game.currentScore = '';
	 switch (this.game.currentDealer) {
	  case 'player':
	    this.game.currentDealer = 'computer';
	    break;
	  case 'computer':
	    this.game.currentDealer = 'player';
	    break;
	 }
	 this.cleanDeck();
	 this.addDeckStackButton();
	 this.showDecks();
	 this.showCutCard();
	 
	 if (!this.game.endedGame()) {
	    if (this.game.gamePrefs.autoDeal) {
	       this.scoreData($L("Shuffling and redealing."));
	       setTimeout(this.DealButtPress.bind(this), this.scorePauseDuration);
	    } else {
	       setTimeout(this.reDealRequest.bind(this), this.scorePauseDuration);
	    }
	 }
	 break;
      }
      this.game.saveSoon();
   }
}


GameAssistant.prototype.reDealRequest = function(){
   this.scoreData($L("Tap the deck to shuffle and redeal."));
   Mojo.Event.listen(this.deckStackButton, Mojo.Event.tap, this.dealHandler);
}



GameAssistant.prototype.scoreButtPress = function(event){
   var cutCard = this.game.cut.cards[0];
   
   var pScored = 0, pScores = '';
   
   if (!this.game.gamePrefs.autoScore) {
      Mojo.Event.stopListening(this.scoreBoxTap, Mojo.Event.tap, this.scoreHandler);
      this.scoreBoxTap.remove();
      var target = event.target.id;
   } else {
      var target = event;
   }
   
   if (target) {
      switch(target) {
       case 'doPScore':
	 pScores = this.game.handP.cribScore(cutCard,0);
	 pScored = parseInt(pScores.totalScore());
	 if (pScored >= this.minHighHand){
	    highCards = [];
	    for (ci=0; ci < this.game.handP.cardCount(); ci++) {
	       highCards[ci] = this.game.handP.cards[ci];
	       }
	    highCards.push(cutCard);
	    Mojo.Log.info('saving high score!');
	    this.game.saveHandSoon(this.game.gamePrefs.playerName, highCards, pScored);
	 }
	 for (i=0; i < this.game.handP.cardCount(); i++){
	    this.PcardBox[i].firstChild.setStyle({'left':'0px','top':'0px','zIndex':i});
	 }
	 if (this.game.manScore) {
	    this.manScoreCheck();
	 } else {
	    this.setPlayerScore(pScored);
	    this.scoreData('<span>'+$L("Your Score: ")+"("+this.game.handP+"/ "+this.game.cut+") "+pScores+'</span>');
	    this.showHandScores();
	 }
	 break;
       case 'doCScore':
	 pScores = this.game.handC.cribScore(cutCard,0);
	 pScored = parseInt(pScores.totalScore());
	 if (pScored >= this.minHighHand){
	    highCards = [];
	    for (ci=0; ci < this.game.handC.cardCount(); ci++) {
	       highCards[ci] = this.game.handC.cards[ci];
	    }
	    highCards.push(cutCard);
	    Mojo.Log.info('saving high score!');
	    this.game.saveHandSoon('computer', highCards, pScored);
	 }
	 this.setComputerScore(pScored);
	 this.scoreData('<span>'+$L("My Score: ")+"("+this.game.handC+"/ "+this.game.cut+") "+pScores+'</span>');
	 for (i=0; i < this.game.handC.cardCount(); i++){
	    this.game.handC.cards[i].isPlayed = 0;
	    this.CcardBox[i].firstChild.setStyle({'left':'0px','top':'0px','zIndex':i});
	 }
	 this.showHandScores();
	 break;
       case 'doCribScore':
	 this.game.stage = 'crib';
	 while (this.cribStack.lastChild) {      
	    this.cribStack.lastChild.remove();
	 }
	 this.game.crib.cards.sort(sortCardsbyRank);
	 for (i=0; i < this.game.crib.cardCount(); i++) {
	    cardNode = this.game.crib.cards[i].canvasNode('CrCard'+i);
	    cardNode.setStyle({'top':'87px','left':'0px','zIndex':i});
	    this.cribStack.appendChild(cardNode);
	    cardNode.setStyle({'top':'0px','left':(i*33-100)+'px','zIndex':i});
	 } 
	 pScores = this.game.crib.cribScore(cutCard,1);
	 pScored = parseInt(pScores.totalScore());
	 switch(this.game.currentDealer) {
	  case 'player':
	    if (pScored >= this.minHighHand){ // save high-scoring hands
	       highCards = [];
	       for (ci=0; ci < this.game.crib.cardCount(); ci++) {
		  highCards[ci] = this.game.crib.cards[ci];
	       }
	       highCards.push(cutCard);
	       this.game.saveHandSoon(this.game.gamePrefs.playerName, highCards, pScored);
	    }
	    if (this.game.manScore) {
	       this.manScoreCheck();
	    } else {
	       this.setPlayerScore(pScored);
	       this.scoreData('<span>'+$L("Crib Score: ")+"("+this.game.crib+"/ "+this.game.cut+") "+pScores+'</span>');
	       this.showHandScores();
	    }
	    break;
	  case 'computer':
	    if (pScored >= this.minHighHand){
	       highCards = [];
	       for (ci=0; ci < this.game.crib.cardCount(); ci++) {
		  highCards[ci] = this.game.crib.cards[ci];
	       }
	       highCards.push(cutCard);
	       this.game.saveHandSoon('computer', highCards, pScored);
	    }
	    this.setComputerScore(pScored);
	    this.scoreData('<span>'+$L("Crib Score: ")+"("+this.game.crib+"/ "+this.game.cut+") "+pScores+'</span>');
	    // this.updateCanvasBoard(this.game.currentDealer);
	    this.showHandScores();
	    break;
	 }
	 break;
      }
   }
}


GameAssistant.prototype.manScoreCheck = function(){
   this.scoreDialog = this.controller.showDialog({
      template: "Game/manScoring",
      assistant: new manScoreAssistant(this, this.game, this.manScoreCheckReturn.bind(this)),
      preventCancel:true
   });
}

GameAssistant.prototype.manScoreCheckReturn = function(mScored){
   this.scoreDialog.mojo.close();
   this.scoreDialog = null;
   
   var cutCard = this.game.cut.cards[0];
   if (this.game.stage == 'crib'){
      pScores = this.game.crib.cribScore(cutCard,1);
   } else {
      pScores = this.game.handP.cribScore(cutCard,0);
   }
   pScored = parseInt(pScores.totalScore());
   pScored2 = parseInt(pScores.totalScore());
   
   this.setPlayerScore(pScored);
   if (mScored == pScored2) {
      this.scoreData($L("Correct! You get #{score} points.").interpolate({score:pScored2}));
   } else if (Math.abs(mScored - pScored2) < 3) {
      this.scoreData($L("Close. You actually got #{score} points: ").interpolate({score:pScored2})+pScores);
   } else if (Math.abs(mScored - pScored2) >= 3) {
      this.scoreData($L("You're not even trying! Here is the score: ")+pScores);
   } 
   
   this.showHandScores();
}


GameAssistant.prototype.setPegLookups = function(){
   this.compPeg0Moved = 0;
   this.compPeg1Moved = 0;
   this.playerPeg0Moved = 0;
   this.playerPeg1Moved = 0;
   
   if (!this.game.shortGame) {
      numRound = 2;
   } else {
      numRound = 1;
   }
   XposArr = [];
   XposArr.push(9);
   for (j=0; j<numRound; j++) {
      Xpos = 18;
      for (i=0; i < 30; i++) {
	 if (i%5 == 0) {
	    Xpos += 5;
	 }
	 XposArr.push(Xpos);
	 Xpos += 9;
      }
      Xpos = 314;
      for (i=0; i < 30; i++) {
	 if (i%5 == 0) {
	    Xpos -= 5;
	 }
	 XposArr.push(Xpos);
	 Xpos -= 9;
      }
   }
   XposArr.push(9);
   
   // Mojo.Log.error('XposArr length: ', XposArr.length);
   
   this.playerPegPos = [];
   this.compPegPos = [];
   for (posi = 0; posi < XposArr.length; posi++) {
      if ((posi >= 0 && posi < 31)
	  || (!this.game.shortGame && posi > 60 && posi < 91)) {
	 this.playerPegPos.push([XposArr[posi],43]);
	 this.compPegPos.push([XposArr[posi],7]);
      } else {
	 this.playerPegPos.push([XposArr[posi],33]);
	 this.compPegPos.push([XposArr[posi],17]);
      }
   }
   
}


GameAssistant.prototype.updateCanvasBoard = function(playerID){
   var numInt=0, numIntOld=0;
   
   switch (playerID) {
    case 'computer':
      numIntOld = parseInt(this.game.OldScore.computer);
      numInt = parseInt(this.game.Score.computer);
      break;
    case 'player':
      numInt = parseInt(this.game.Score.player);
      numIntOld = parseInt(this.game.OldScore.player);
      break;
   }
   var numIntToClear = this.settleOldScores;
   
   if (this.game.shortGame && numInt > 61) {
      numInt = 61;
   } else if (!this.game.shortGame && numInt > 121) {
      numInt = 121;
   }
   
   // insert code to move peg about on a canvas element board.
   if (this.game.Score.computer > 0 && !this.compPeg0Moved) {
      this.boardPegs.updateBoardSoon(this.compPegPos[0],'clear',10);
      this.compPeg0Moved++;
   }
   if (this.game.OldScore.computer > 0 && !this.compPeg1Moved) {
      this.boardPegs.updateBoardSoon(this.compPegPos[this.compPegPos.length-1],'clear',10);
      this.compPeg1Moved++;
   }
   if (this.game.OldScore.player > 0 && !this.playerPeg1Moved) {
      this.boardPegs.updateBoardSoon(this.playerPegPos[this.playerPegPos.length-1],'clear',10);
      this.playerPeg1Moved++;
   }
   if (this.game.Score.player > 0 && !this.playerPeg0Moved) {
      this.boardPegs.updateBoardSoon(this.playerPegPos[0],'clear',10);
      this.playerPeg0Moved++;
   }
   
   // this.board.updateBoardSoon(posArr(x,y),colorArr(in,out),time);
   var timerSplit = 300;
   var timer = 0;
   switch (playerID) {
    case 'computer':
      this.boardPegs.updateBoardToClear(this.compPegPos[numIntToClear]);
      // this.boardPegs.updateBoardSoon(this.compPegPos[numIntToClear],'clear',timer);
      if (this.game.gamePrefs.useAnimation) {
	 timer+=timerSplit;
	 for (pj = numIntOld+1; pj < numInt; pj++) {
	    this.boardPegs.updateBoardSoon(this.compPegPos[pj],'clear',timer+Math.floor(0.75*timerSplit));
	    this.boardPegs.updateBoardSoon(this.compPegPos[pj],this.game.computerPegColors,timer);
	    timer += timerSplit;
	 }
      }
      this.boardPegs.updateBoardSoon(this.compPegPos[numInt],this.game.computerPegColors,timer);
      break;
    case 'player':
      this.boardPegs.updateBoardToClear(this.playerPegPos[numIntToClear]);
      // this.boardPegs.updateBoardSoon(this.playerPegPos[numIntToClear],'clear',timer);
      if (this.game.gamePrefs.useAnimation) {
	 timer += timerSplit;
	 for (pj = numIntOld+1; pj < numInt; pj++) {
	    this.boardPegs.updateBoardSoon(this.playerPegPos[pj],'clear',timer+Math.floor(0.75*timerSplit));
	    this.boardPegs.updateBoardSoon(this.playerPegPos[pj],this.game.playerPegColors,timer);
	    timer += timerSplit;
	 }
      }
      this.boardPegs.updateBoardSoon(this.playerPegPos[numInt],this.game.playerPegColors,timer);
      break;
   }
   if (this.game.gamePrefs.useAnimation) {
      this.scorePauseDuration = 900;
      if (this.scorePauseDuration < (timerSplit*(numInt-numIntOld+3))) {
	 this.scorePauseDuration = timerSplit*(numInt-numIntOld+3);
      }
   } else {
      this.scorePauseDuration = 300;
   }
   
   
   if (this.game.endedGame()) {
      // Mojo.Log.info('END OF GAME!');
      // save end of game details (final score, number of dealt hands, first dealer, etc).
      if (this.game.stage == "play") {
	 this.totalPlayScores();
      }
      this.game.saveWinSoon();
      // this.game.loadStats(this.saveGameStats.bind(this));
      setTimeout(this.pushEndOfGameAlert.bind(this),timer+1200);
   }
}


GameAssistant.prototype.showCutCard = function() {
      if (this.game.cut.cardCount()) {
	 cardNode = this.game.cut.cards[0].canvasNode('cutCard');
	 cardNode.setStyle({'left':'5px','zIndex':90});
	 this.deckStack.appendChild(cardNode);
      }
}


GameAssistant.prototype.moveCribCards = function() {
      // move crib stack out of the way for play.
      cribs = this.cribStack.childNodes;
      for (i=0; i < cribs.length; i++) {
	 cribs[i].setStyle({'top':'81px'});
      }
}


GameAssistant.prototype.cutPlayCard = function(prefOrd) {
   // move crib stack out of the way for play.
   this.moveCribCards();
   
   // ordRegExp = /^([0-9]|1[0-2])$/;
   if (!prefOrd)
     prefOrd = [];
   
   var pScored = 0;
   /* 
    * Note: this cheatmode is designed to aid the player, although it could
    * end up benefiting the computer as well. Use with care!
    */
   /* if (prefOrd.length > 0) {
      Mojo.Log.info("cheating. carry on...");
      var cutCounter = 0;
      do {
	 cutCounter++;
	 this.game.deck.combine(this.game.cut);
	 this.game.cut.addCard(this.game.deck.draw(-1));
	 prefOrdIndex = prefOrd.indexOf(this.game.cut.cards[0].ordinal);
	 // Mojo.Log.info("index: "+ prefOrdIndex+", count: "+cutCounter);
      } while (prefOrdIndex == -1 && cutCounter < 52);
   } else {
      this.game.cut.addCard(this.game.deck.draw(-1));
   } */
   this.game.cut.addCard(this.game.deck.draw(-1));
   this.showCutCard();
   
   if (this.game.cut.cards[0].ordinal == 10) {
      pScored = 2;
      this.scoreData($L("Dealer gets #{score} for his heels.").interpolate({score:pScored}));
      switch(this.game.currentDealer) {
       case 'player':
	 this.setPlayerScore(pScored);
	 break;
       case 'computer':
	 this.setComputerScore(pScored);
	 break;
      }
      // this.updateCanvasBoard(this.game.currentDealer);
   }
}
   
GameAssistant.prototype.playGame = function() {
   this.cardsLeftToPlay();
   
   if (!this.game.endedGame()){
      if (this.game.cardsInPlay.player == 0 && this.game.cardsInPlay.computer == 0) {
	 // Mojo.Log.info('End of play.');
	 this.scoreData($L("End of play."));
	 this.showHandScores();
	 this.game.gameTurn = '';
	 this.game.lastPlay = '';
	 this.resetPlayStuff();
      } else {
	 if (this.game.gameTurn == '') {
	    switch (this.game.currentDealer) {
	     case 'player':
	       this.game.gameTurn = 'computer';
	       break;
	     case 'computer':
	       this.game.gameTurn = 'player';
	       break;
	    }
	 } else  {
	    switch (this.game.gameTurn) {
	     case 'player':
	       if (this.game.cardsInPlay.computer > 0
		   || this.game.calledGo.player > 0) {
		  this.game.gameTurn = 'computer';
	       } else {
		  this.game.gameTurn = 'player';
	       }
	       break;
	     case 'computer':
	       if (this.game.cardsInPlay.player > 0
		   || this.game.calledGo.computer > 0) {
		  this.game.gameTurn = 'player';
	       } else {
		  this.game.gameTurn = 'computer';
	       }
	       break;
	    }
	 }
	 
	 numCompCards = this.game.playableCards.computer.length;
	 numPlayerCards = this.game.playableCards.player.length;
	 
	 if (this.game.gameTurn == 'computer' && numCompCards > 0) {
	    this.playComputerCard();
	    this.game.lastPlay = 'computer';
	 } else if (this.game.gameTurn == 'player' && numPlayerCards > 0) {
	    this.setupPlayGame();
	    this.scoreData($L("Waiting for input"));
	    this.game.lastPlay = 'player';
	 } else if (this.game.calledGo.player > 5
		    || this.game.calledGo.computer > 5) {
	    // must be caught in a loop. reset. hopefully this is no longer required.
	    this.resetPlayStuff();
	    setTimeout(this.playGame.bind(this),300);
	 } else if (this.game.gameTurn == 'player'
		    && numPlayerCards == 0 
		    && this.game.cardsInPlay.player > 0
		    && this.game.calledGo.player >= 0
		    && this.game.calledGo.computer >= 0) { 
	    // player cannot go.
	    if (this.game.calledGo.player == 0) {
	       // add manual 'go' stuff here
	       this.game.calledGo.player++;
	       if (this.game.calledGoFirst == '') {
		  this.scoreData($L("#{player} calls 'go'.").interpolate({player:this.game.gamePrefs.playerName}));
		  this.game.calledGoFirst = 'player';
	       } else {
		  pScored = 1;
		  this.setPlayerScore(pScored);
		  this.scoreData($L("#{player} gets a point for 'go'.").interpolate({player:this.game.gamePrefs.playerName}));
		  this.resetPlayStuff();
	       }
	    } else {
	       this.game.calledGo.player++;
	    }
	    setTimeout(this.playGame.bind(this),450);
	 } else if (this.game.gameTurn == 'computer'
		    && numCompCards == 0 
		    && this.game.cardsInPlay.computer > 0
		    && this.game.calledGo.player >= 0
		    && this.game.calledGo.computer >= 0) { 
	    // computer cannot go.
	    if (this.game.calledGo.computer == 0) {
	       this.game.calledGo.computer++;
	       if (this.game.calledGoFirst == '') {
		  this.scoreData($L("Computer calls 'go'."));
		  this.game.calledGoFirst = 'computer';
	       } else {
		  pScored = 1;
		  this.setComputerScore(pScored);
		  this.scoreData($L("Computer gets a point for 'go'."));
		  this.resetPlayStuff();
	       }
	    } else {
	       this.game.calledGo.computer++;
	    }
	    setTimeout(this.playGame.bind(this),450);
	 } else if ((this.game.cardsInPlay.player + this.game.cardsInPlay.computer) > 0
		    && numPlayerCards == 0
		    && numCompCards == 0) {
	    if (this.game.runScore < 31) { // check for 'go' only if not a 31 score.
	       switch(this.game.lastPlay) {
		case 'computer':
		  pScored = 1;
		  this.setComputerScore(pScored);
		  this.scoreData($L("Computer gets a point for 'go'."));
		  break;
		case 'player':
		  pScored = 1;
		  this.setPlayerScore(pScored);
		  this.scoreData($L("#{player} gets a point for 'go'.").interpolate({player:this.game.gamePrefs.playerName}));
		  break;
	       }
	    }
	    // reset counters if no one can play, but there are still cards to play
	    this.resetPlayStuff();
	    setTimeout(this.playGame.bind(this),300);
	 }
      }
   }
}

GameAssistant.prototype.setupPlayGame = function() {
   if (this.game.gameTurn == 'player') {
      var playableCards;
      
      this.cardsLeftToPlay();
      
      playableCards = this.game.playableCards.player.length;
      if (playableCards > 0){
	 compPlayableCards = this.game.playableCards.computer.length;
	 for (i=0; i < playableCards; i++) {
	    Mojo.Event.listen(this.controller.get('Pcard'+this.game.playableCards.player[i]), Mojo.Event.tap, this.playCardHandler);
	 }
      } else {
	 setTimeout(this.playGame.bind(this),1000);
      }
   } else {
      setTimeout(this.playGame.bind(this),1000);
   }
}


GameAssistant.prototype.playCard = function(event) {
   var pScored = 0;
   
   for (i=0; i < this.game.handP.cardCount(); i++){
      Mojo.Event.stopListening(this.controller.get('Pcard'+i), Mojo.Event.tap, this.playCardHandler);
   } 
   
   var playedCard = event.target.id;
   var cardNum = parseInt(playedCard.replace("Pcard",""));
   
   this.game.handP.cards[cardNum].isPlayed = this.playedCardPosition;
   // move the card to the played position
   posVar = $('PcardBox'+cardNum).positionedOffset();
   newTop = -(posVar.top - this.stacksTop - 5);
   newLeft = -(posVar.left - this.playedCardPosition);
   $(playedCard).setStyle({'left':newLeft+'px','top':newTop+'px','zIndex':this.playedCardPosition});
   this.playedCardPosition += 24;
   
   var cardVal = this.game.handP.cards[cardNum];
   
   pScored = this.evalPlayedCard(cardVal);
   this.setPlayerScore(pScored);
   
   setTimeout(this.playGame.bind(this),1000);
}


GameAssistant.prototype.compInitialLead = function() {
   this.cardsLeftToPlay();
   
   var cardNum = -1;
   var possibleRank = -1;
   var doubleRun = 0;
   var playableCards = this.game.playableCards.computer.length;
   
   if (this.game.runCards.length == 0 && playableCards > 0){
      // check for special hands: double runs, pairs, etc
      ranks = [];
      ranks2 = [];
   
      for (i=0; i<playableCards; i++) { 
	 possibleScoreCard = this.game.playableCards.computer[i];
	 // possibleScoreCardValue = this.game.handC.cards[possibleScoreCard].faceValue;
	 possibleScoreCardOrd = this.game.handC.cards[possibleScoreCard].ordinal;
	 ranks.push(possibleScoreCardOrd);
      }
      ranks.sort(sortByValue);
      var rankStr = ranks.join();
      // this.scoreData(rankStr);
      minCrd = ranks[0];
      for (i=0; i < ranks.length; i++) {ranks2[i] = ranks[i] - minCrd}
      var rSA = ranks2.join("");
      if (rSA == '0122' || rSA == '0112' || rSA == '0012') {
	 doubleRun = 1;
      }
      // pick initial card to play!
      prefOrder = [2,3,10,9,11,12,5,8,0,1,6,7,4];
      var cardInd = prefOrder.length;
      for (i=0; i < ranks.length; i++) {
	 tCI = prefOrder.indexOf(ranks[i]);
	 if (tCI >= 0 && tCI < cardInd) {
	    cardInd = tCI;
	 }
      }
      if (cardInd < prefOrder.length) {
	 initCardOrd = prefOrder[cardInd];
      }
      // take into account special cases
      switch (initCardOrd) {
       case 0: // "A"
	 break;
       case 1: // "2"
	 break;
       case 2: // "3"
	 break;
       case 3: // "4"
	 if (playableCards == 4){
	    numSix = 0;
	    for (ia = 0; ia < ranks.length; ia++) {
	       if (ranks[ia] == 5) {numSix++}
	    }
	    if (numSix > 1) { // try to trap a '5'
	       // change lead card to '6'
	       initCardOrd = 5;
	    }
	 }
	 break;
       case 4: // "5"
	 break;
       case 5: // "6"
	 break;
       case 6: // "7"
	 break;
       case 7: // "8"
	 break;
       case 8: // "9"
	 break;
       case 9: // "10"
	 break;
       case 10: // "J"
	 if (playableCards == 4){
	    numJacks = 0;
	    for (ia = 0; ia < ranks.length; ia++) {
	       if (ranks[ia] == 10) {numJacks++}
	    }
	    if (doubleRun) {
	       // try for J trap
	       if (numJacks > 1) {
		  if (ranks.indexOf(12) >= 0) {
		     // lead a 'K' if possible
		     initCardOrd = 12;
		  } else if (ranks.indexOf(11) >= 0) {
		     // or lead a 'Q' if possible
		     initCardOrd = 11;
		  }
	       }
	    }
	 }
	 break;
       case 11: // "Q"
	 break;
       case 12: // "K"
	 break;
      }
      
      // check for 'turkey plays'
      if (playableCards == 4) {
	 var rankStr = ranks.join();
	 switch (rankStr) {
	  case "0,5,6,7":
	  case "1,5,6,7":
	    initCardOrd = ranks[0];
	    break;
	 }
      }
      
      for (i=0; i<playableCards; i++) { 
	 possibleScoreCard = this.game.playableCards.computer[i];
	 // possibleScoreCardValue = this.game.handC.cards[possibleScoreCard].faceValue;
	 possibleScoreCardOrd = this.game.handC.cards[possibleScoreCard].ordinal;
	 if (initCardOrd == possibleScoreCardOrd) {
	    cardNum = possibleScoreCard;
	    break;
	 }
      }
   }
   return cardNum;
}


GameAssistant.prototype.compInitialLeadResponse = function(cardNum) {
   this.cardsLeftToPlay();
   var playableCards = this.game.playableCards.computer.length;
   
   //Mojo.Log.info('cardNum: %j', cardNum);
   ranks = [];
   
   for (i=0; i<playableCards; i++) { 
      possibleScoreCard = this.game.playableCards.computer[i];
      possibleScoreCardOrd = this.game.handC.cards[possibleScoreCard].ordinal;
      ranks.push(possibleScoreCardOrd);
   }
   ranks.sort(sortByValue);
   // var rankStr = ranks.join();
   // this.scoreData(rankStr);
   
   if (this.game.runCards.length == 1 && playableCards > 0){
      var initRank = this.game.runCards[0].ordinal;
      var pairPlaying = 0;
      
      if (this.game.playableCards.computer.indexOf(cardNum) >= 0) {
	 possibleRank = this.game.handC.cards[cardNum].ordinal;
      } else {
	 possibleRank = -1;
      }
      
      // Select best card to play based on initial card played by non-dealer.
      // 'goodPlay' are order of best statistical plays.
      // 'badPlay' are order of worsening statistical plays.
      switch(initRank) { 
       case 0: // 'A'
	 goodPlay = [4,8,7,5,9,10,11,12];
	 badPlay = [0,6,1,2,3];
	 break;
       case 1: // '2'
	 goodPlay = [4,7,6,5,8,9,10,11,12];
	 badPlay = [0,1,2,3];
	 break;
       case 2: // '3'
	 goodPlay = [6,7,8,9,10,11,12];
	 badPlay = [0,1,2,3,4,5];
	 break;
       case 3: // '4'
	 goodPlay = [8,7,6,9,10,11,12,3];
	 badPlay = [0,1,2,4,5];
	 break;
       case 4: // '5'
	 if (playableCards == 4){
	    goodPlay = [0,1,7,8,9,10,11,12];
	 } else {
	    goodPlay = [9,10,11,12,0,1,7,8];
	 }
	 badPlay = [2,3,4,5,6];
	 break;
       case 5: // '6'
	 goodPlay = [8,11,12,9,10];
	 badPlay = [3,4,5,6,7,2,1,0];
	 break;
       case 6: // '7'
	 goodPlay = [11,12,9,10,2,1,0,7,8];
	 badPlay = [3,4,5,6];
	 break;
       case 7: // '8'
	 goodPlay = [12,11,10,2,1,3,4,0,6,5];
	 badPlay = [7,8,9];
	 break;
       case 8: // '9'
	 goodPlay = [5,11,12,0,1,3,4];
	 badPlay = [8,2,7,6,9,10];
	 break;
       case 9: // '10'
	 goodPlay = [4,3,6,12,0,1,2];
	 badPlay = [9,8,10,7,11,5];
	 break;
       case 10: // 'J'
	 goodPlay = [4,3,6,7,0,1,2];
	 badPlay = [10,9,11,8,12,5];
	 break;
       case 11: // 'Q'
	 goodPlay = [4,3,6,7,8,0,1,2];
	 badPlay = [11,10,12,9,5];
	 break;
       case 12: // 'K'
	 goodPlay = [4,3,6,7,8,9,0,1,2];
	 badPlay = [12,11,10,5];
	 break;
      }
   
      for (ri = 0; ri < badPlay.length; ri++) {
	 if (possibleRank == badPlay[ri]) {
	    cardNum = -1; // replace a potential bad card to play.
	    possibleRank = -1;
	 }
      }
      // look at specific cases for best pegging advantage:
      if (playableCards == 4) {
	 var rankStr = ranks.join();
	 switch (rankStr) {
	  case "0,5,6,7":
	  case "1,5,6,7":
	    if (initRank > 9) {
	       possibleRank = ranks[3];
	    }
	    break;
	  case "1,1,2,3":
	    if (initRank >= 9) {
	       possibleRank = ranks[3];
	    }
	    break;
	  case "1,2,3,3":
	    if (initRank >= 9) {
	       possibleRank = ranks[1];
	    }
	    break;
	  case "1,2,2,3":
	    if (initRank >= 9) {
	       possibleRank = ranks[3];
	    }
	    break;
	  case "3,4,5,5":
	    if (initRank == 7) {
	       possibleRank = ranks[3];
	    }
	    break;
	 }
	 if (possibleRank != -1) {
	    for (ci=0; ci < this.game.handC.cardCount(); ci++){
	       if (this.game.handC.cards[ci].ordinal == possibleRank
		   && !this.game.handC.cards[ci].isPlayed){
		  cardNum = ci; // take the best response possible and play it!
		  break;
	       }
	    }
	 }
      }
      
      
      for (ri = 0; ri < goodPlay.length; ri++) {
	 if (cardNum == -1 || pairPlaying > 0) { // only play a pair if it's the one good choice!
	    for (ci=0; ci < this.game.handC.cardCount(); ci++) {
	       if (this.game.handC.cards[ci].ordinal == goodPlay[ri]
		   && !this.game.handC.cards[ci].isPlayed){
		  cardNum = ci; // take the best response possible and play it!
		  if (this.game.handC.cards[ci].ordinal == initRank) {
		     pairPlaying += 1;
		  }
		  break;
	       }
	    }
	 }
      }
      for (ind = 0; ind < badPlay.length; ind++) {
	 if (cardNum == -1) { // no choice. pick the lesser of all evils...
	    for (ci=0; ci < this.game.handC.cardCount(); ci++) {
	       if (this.game.handC.cards[ci].ordinal == badPlay[ind]
		   && !this.game.handC.cards[ci].isPlayed){
		  cardNum = ci;
		  break;
	       }
	    }
	 }
      }
   }
   
   return cardNum;
}


GameAssistant.prototype.playComputerCardFTW = function() {
   // check cards to play when the player is out of cards. if the
   // computer has 3 cards, make sure to maximize score! For example,
   // with a remaining 6,6,9, play the 9 first. Likewise, with a
   // 6,7,8 run, play the 7 first to get the 15 for 2 points AND a
   // run.
   var cardNum = -1;
   var playableCards = this.game.playableCards.computer.length;
   
   if (playableCards > 2) {
      // this.scoreData("Let's see what I can do...");
      var possibleRank = -1;
      var dblRank = -1, rank15a = -1, rank15b = -1;
   
      ranks = [];
      var playRun = 0, playDbl = 0, play15 = 0;
	
      for (i=0; i < playableCards; i++) { 
	 possibleScoreCard = this.game.playableCards.computer[i];
	 possibleScoreCardOrd = this.game.handC.cards[possibleScoreCard].ordinal;
	 ranks.push(possibleScoreCardOrd);
      }
      ranks.sort(sortByValue);
      Mojo.Log.info("ranks: %j",ranks);
      
      for (i=0; i < ranks.length-1; i++) {
	 // check for 15s, straights, and doubles for max score
	 for (j=i+1; j < ranks.length; j++) {
	    if (ranks[j] == ranks[i]) {
	       playDbl += 1;
	       dblRank = ranks[j];
	    }
	    if (ranks[i] + ranks[j] == 15) {
	       play15 += 1;
	       rank15a = ranks[i];
	       rank15b = ranks[j];
	    }	    
	 }
	 if (ranks[0] == ranks[1]-1
	     && ranks[1] == ranks[2]-1) {
	    playRun = 1;
	 }
      }
      // find the right card to play:
      if (playRun) {
	 if (play15 == 1) {
	    possibleRank = rank15a;
	 } else {
	    possibleRank = ranks[0];
	 }
      } else if (playDbl == 2) {
	 possibleRank = ranks[0];
      } else if (play15 == 2
		&& playDbl == 1) {
	 if (rank15a == dblRank) {
	    possibleRank = rank15b;
	 } else {
	    possibleRank = rank15a;
	 }
      } else if (playDbl == 1) {
	 possibleRank = dblRank;
      } else if (play15 == 1) {
	 possibleRank = rank15a;
      } else {
	 possibleRank = -1;
      }
      
      
      for (ci=0; ci < this.game.handC.cardCount(); ci++){
	 if (this.game.handC.cards[ci].ordinal == possibleRank
	     && !this.game.handC.cards[ci].isPlayed){
	    cardNum = ci;
	    break;
	 }
      }
   }
   
   return cardNum;
}


GameAssistant.prototype.playComputerCard = function() {
   numCards = this.game.handC.cardCount();
   var pScored = 0;
   var compAddUp = 0;
   
   this.cardsLeftToPlay();
   
   var playLevel = parseInt(this.game.gameLevel);
   // Mojo.Log.info('level: ', playLevel);
   
   var playableCards = this.game.playableCards.computer.length;
   var playerCardsLeft = this.game.cardsInPlay.player;
   var numTenPointers = 0;
   
   for (i=0; i < playableCards; i++) {
      possibleScoreCard = this.game.playableCards.computer[i];
      compAddUp += this.game.handC.cards[possibleScoreCard].faceValue;
   }
   
   if (playableCards > 0) {
      
      var playersPlayedCards = {ranks:[]}; // look at what cards have been played by the player
      for (i=0; i < this.game.handP.cards.length; i++) {
	 if (this.game.handP.cards[i].isPlayed && playLevel > 0){
	    playersPlayedCards.ranks.push(this.game.handP.cards[i].rank);
	    if (this.game.handP.cards[i].ordinal > 9) {
	       playersPlayedCards.tens = 1;
	       numTenPointers++;
	    }
	 }
      }
      for (ppc=0; ppc < playersPlayedCards.ranks.length; ppc++) {
	 cardR = playersPlayedCards.ranks[ppc];
	 if (cardR == 'A' || cardR == '2'
	     || cardR == '3' || cardR == '4') {
	    playersPlayedCards.sneaky15 = 1;
	 }
      }
      
      // change this to make the computer actually 'think' a bit.
      cardNum = -1; cardRank = 0;
      
      // add code for lead card or response to a lead card (e.g., if dealer).
      if (this.game.runCards.length == 0
	  && playerCardsLeft){
	 cardNum = this.compInitialLead();
      }
      
      if (this.game.playableCards.player.length) {
	 if (this.game.runCards.length == 1){
	    cardNum = this.compInitialLeadResponse(cardNum);
	 }
      }
      
      var runWithIt = 0;
      if (this.game.runScore + compAddUp < 32) {
	 runWithIt += 1;
      }
      
      // if the player is out of cards and we have three left, optimize play for points (at 
      // least for the first of the three cards to play).
      if (!playerCardsLeft
	  && this.game.playableCards.computer.length == 3
	  && this.game.runCards.length == 0
	  && playLevel > 1) {
	 this.scoreInfo($L("Hmmm..."));
	 cardNum = this.playComputerCardFTW();
      }
      
      if (cardNum == -1) {
	 // check for easy points or preferred run score to play to for minimizing opponent score
	 prefRunScore = [777,666,555,444,15,31,333,222,11,12,13,14,16,17,18,22,24,28,19,30,20,23,27,29,25,26,21,99];
	 var runIndx = prefRunScore.length;
	 
	 for (i=0; i < playableCards; i++) {
	    possibleScoreCard = this.game.playableCards.computer[i];
	    possibleScoreCardValue = this.game.handC.cards[possibleScoreCard].faceValue;
	    possibleScoreCardOrd = this.game.handC.cards[possibleScoreCard].ordinal;
	    var playsAtThisRank = 0;
	    for (pATR = 0; pATR < this.game.runCards.length; pATR++) {
	       if (this.game.runCards[pATR].ordinal == possibleScoreCardOrd) {
		  playsAtThisRank++;
	       }
	    }
	    // Mojo.Log.info('Number of cards with '+possibleScoreCardValue+': '+playsAtThisRank);
	    possibleScore = possibleScoreCardValue + this.game.runScore;
	    if (2*possibleScoreCardValue + this.game.runScore == 31
	       && playsAtThisRank < 2
	       && playerCardsLeft > 0) {
	       var possibleScrew = 1;
	    } else {
	       var possibleScrew = 0;
	    }
	    // check on possible runs
	    var rCl = this.game.runCards.length;
	    possStrArr = [possibleScoreCardOrd];
	    possStrLen = 0;
	    while (rCl--) {
	       possStrArr.push(this.game.runCards[rCl].ordinal);
	       if (possStrArr.length > 2) {
		  tmpStrLen = isStraight(possStrArr);
		  if (tmpStrLen == possStrArr.length-1) {
		     possStrLen = tmpStrLen;
		     Mojo.Log.info('Possible straight length: ', possStrLen);
		  }
	       }
	    }
	    
	    if (possStrLen >= 4 && playLevel > 0) {
	       // Mojo.Log.info('I think I can play a straight.');
	       possibleScore = 111*possStrLen;
	       var possibleScrew = 0;
	    } else if (possStrLen >= 2 && playLevel > 0) {
	       possibleScore = 333;
	    }
	    
	    // check on possible pairs
	    var rCl = this.game.runCards.length;
	    var possDub = 0;
	    while (rCl--) {
	       // Mojo.Log.info("check pairs: ",possibleScoreCardOrd, this.game.runCards[rCl].ordinal);
	       if (possibleScoreCardOrd == this.game.runCards[rCl].ordinal) {
		  possDub++;
	       } else {
		  break;
	       }
	    }
	    
	    // Mojo.Log.info('Potential pairs: ', possDub);
	    
	    switch (possDub) {
	     case 3:
	       possibleScore = 444;
	       // Mojo.Log.info('I think I can play a double pair royal.');
	       break;
	     case 2:
	       possibleScore = 444;
	       // Mojo.Log.info('I think I can play a pair royal.');
	       break;
	     case 1:
	       if (playsAtThisRank > 2
		   || (this.game.calledGo.player > 0)
		   || (possibleScoreCardValue + possibleScore > 31)
		   || playerCardsLeft == 0
		   || playableCards == 1) {
		  possibleScore = 222;
	       /* } else {
		  Mojo.Log.info("playsAtThisRank",playsAtThisRank);
		  Mojo.Log.info("this.game.calledGo.player",this.game.calledGo.player);
		  Mojo.Log.info("possibleScoreCardValue + possibleScore",(possibleScoreCardValue + possibleScore));
		  Mojo.Log.info("playerCardsLeft",playerCardsLeft); */
	       }
	       break;
	    }
	    
	    // score 99 for a card that could set up a run (unless we actually have a run or double) to make it
	    // less favorable in the prefRunScore array
	    if (possibleScore % 111
		&& possibleScore != 15 
		&& possibleScore != 31
		&& playableCards > 1
		&& playerCardsLeft
		&& playLevel > 1) {
	       var rCl = this.game.runCards.length;
	       var StrTrouble = 0;
	       var possStrSetupArr = [possibleScoreCardOrd];
	       while (rCl--) {
		  possStrSetupArr.push(this.game.runCards[rCl].ordinal);
		  var pSSALen = possStrSetupArr.length;
		  if (pSSALen > 1) {
		     possStrSetupArr.sort(sortByValue);
		     diffArr = [];
		     for (di = 1; di < pSSALen; di++) {
			diffVal = possStrSetupArr[di]-possStrSetupArr[di-1];
			diffArr.push(diffVal);
		     }
		     diffArr.sort(sortByValue);
		     diffStrng = Object.toJSON(diffArr.uniq());
		     switch(diffStrng) {
		      case "[1]":
		      case "[2]":
			StrTrouble++;
			break;
		      case "[1,2]":
			// Mojo.Log.info("[1,2] diffArr: "+diffStrng);
			StrTrouble += 2;
			break;
		     }
		  } 
	       }
	       if (StrTrouble > 0) {
		  //Mojo.Log.info("Trouble for run: %d",StrTrouble);
		  possibleScore = 99;
	       }
	    }
	    
	    
	    var tCI = prefRunScore.indexOf(possibleScore);
	    if (tCI >= 0 && tCI < runIndx) {
	       if (!possibleScrew) {
		  runIndx = tCI;
	       }
	       if (tCI < prefRunScore.length) {
		  cardNum = possibleScoreCard;
	       }
	    }
	 }
      }
      
      
      // if no good card to play, pick at random.
      while (cardNum == -1) {
	 cardNum = this.game.playableCards.computer[Math.floor(Math.random()*playableCards)];
	 cardFace = this.game.handC.cards[cardNum].faceValue;
      }
      
      // mark card as having been played.
      this.game.handC.cards[cardNum].isPlayed = this.playedCardPosition;
      // move card to 'played' position &
      // remove back node and replace with card face
      while (this.CcardBox[cardNum].lastChild) {
	 this.CcardBox[cardNum].lastChild.remove();
      }
      cardNode = this.game.handC.cards[cardNum].canvasNode('Ccard'+cardNum);
      this.CcardBox[cardNum].appendChild(cardNode);
      posVar = $('CcardBox'+cardNum).positionedOffset();
      newTop = -(posVar.top - this.stacksTop);
      newLeft = -(posVar.left - this.playedCardPosition);
      $('Ccard'+cardNum).setStyle({'left':newLeft+'px','top':newTop+'px','zIndex':this.playedCardPosition});
      this.playedCardPosition += 24;
      
      // evaluate card and take points
      var cardVal = this.game.handC.cards[cardNum];
      
      pScored = this.evalPlayedCard(cardVal);
      this.setComputerScore(pScored);
   }
   setTimeout(this.playGame.bind(this),1000);
}


// reset the play hand and called go variables
GameAssistant.prototype.resetPlayStuff = function() {
      this.cardsLeftToPlay();
      this.game.runCards = [];
      if (this.game.runScore > 0 && (this.game.cardsInPlay.player + this.game.cardsInPlay.computer) > 0) {
	 this.Counter.innerHTML += $L("Resetting to 0.");
      }
      this.game.runScore = 0;
      this.game.calledGo.player = 0;
      this.game.calledGo.computer = 0;
      this.game.calledGoFirst = '';
      this.playedCardPosition += 9;
}


GameAssistant.prototype.cardsLeftToPlay = function() {
   this.game.cardsInPlay.player = 0;
   this.game.cardsInPlay.computer = 0;
   this.game.playableCards.player = [];
   this.game.playableCards.computer = [];
   for (i=0; i <  this.game.handP.cardCount(); i++) {
      if (!this.game.handP.cards[i].isPlayed) {
	 this.game.cardsInPlay.player++;
	 if ((this.game.runScore + parseInt(this.game.handP.cards[i].faceValue)) <= 31) {
	    this.game.playableCards.player.push(i);
	 }
      }
   }
   for (i=0; i <  this.game.handC.cardCount(); i++) {
      if (!this.game.handC.cards[i].isPlayed) {
	 this.game.cardsInPlay.computer++;
	 if ((this.game.runScore + parseInt(this.game.handC.cards[i].faceValue)) <= 31) {
	    this.game.playableCards.computer.push(i);
	 }
      }
   }
   stillCardsInPlay = (this.game.cardsInPlay.player + this.game.cardsInPlay.computer);
   
}


GameAssistant.prototype.evalPlayedCard = function(cardVal) {
   var points = 0;
   timer = 0;
   
   // check how many cards are left.
   this.cardsLeftToPlay();
   
   this.game.runCards.push(cardVal);
   this.game.runScore += parseInt(cardVal.faceValue);
   // var info = cardVal.faceValue+' for '+this.game.runScore+'. ';
   var info = $L("#{cardval} for #{score}. ").interpolate({cardval:cardVal.faceValue, score:this.game.runScore});
   this.Counter.innerHTML = info;
      
   setTimeout(this.scoreData.bind(this,info),timer);
   timer += 200;
   
   if (this.game.runScore == 15) {
      var info = $L("15 for two!");
      points += 2;
      setTimeout(this.scoreData.bind(this,info),timer);
      timer += 200;
   }
   
   // check for pairs, pair royals, and double pair royals
   if (this.game.runCards.length >= 2) {
      numPairs = 0;
      for (si = this.game.runCards.length-1; si > 0; si--) {
	 if (this.game.runCards[si].ordinal == this.game.runCards[si-1].ordinal) {
	    numPairs++;
	 } else {
	    break;
	 }
      }
      if (numPairs > 0) {
	 switch(numPairs) {
	  case 1:
	    points += 2;
	    info = $L("Pair for two!");
	    break;
	  case 2:
	    points += 6;
	    info = $L("Pair royal for six!");
	    break;
	  case 3:
	    points += 12;
	    info = $L("Double pair royal for twelve!!!");
	    break;
	 }
	 setTimeout(this.scoreData.bind(this,info),timer);
	 timer += 200;
      }
   }
   
   // check for straights. rework this! need to look at last three cards, 
   // then four if there is a straight, then five...
   if (this.game.runCards.length > 2) {
      playStraight = [];
      sN = 0;
      sNpnts = 0;
      for (si = this.game.runCards.length-1; si >= 0; si--) {
	 playStraight.push(parseInt(this.game.runCards[si].ordinal));
	 sN = isStraight(playStraight);
	 if (sN == playStraight.length-1) {
	    sNpnts = sN+1;
	 }
      }
      if (sNpnts >= 3) {
	 // info = 'Straight for '+sNpnts+' points. ';
	 info = $L("Straight for #{pnts} points. ").interpolate({pnts:sNpnts});
	 points += sNpnts;
	 setTimeout(this.scoreData.bind(this,info),timer);
	 timer += 200;
      }
   }
   
   // need to include last card and 'go' with 31 scoring (only one of the
   // three can be obtained with a single card, according to cribbage.org).
   if (this.game.runScore == 31) {
      var info = $L("31 for two!");
      this.resetPlayStuff();
      points += 2;
      setTimeout(this.scoreData.bind(this,info),timer);
      timer += 200;
   } else if ((this.game.cardsInPlay.player + this.game.cardsInPlay.computer) == 0) {
      var info = $L("Last card for one!");
      points += 1;
      setTimeout(this.scoreData.bind(this,info),timer);
      timer += 200;
      // Mojo.Log.info('Player go: ', this.game.calledGo.player, ', Computer go: ', this.game.calledGo.computer);
   } 
   
   // return points to scorer.
   return points;
}

function sortByValue(a,b) {
      return a - b;
}


function isStraight(ordArr){
   var points = 0;
   if (ordArr.length > 1) {
      ordArr.sort(sortByValue);
      // Mojo.Log.info('Cards: %j', ordArr);
      points = 0;
      for (sj=0; sj < ordArr.length-1; sj++) {
	 cardDiff = ordArr[sj+1]-ordArr[sj];
	 if (cardDiff == 1) {
	    points++;
	 } else {
	    break;
	 }
      }
   }
   return points;
}


GameAssistant.prototype.pushEndOfGameAlert = function() {
   // set up an alert to end game.
   var gameOverMessage = '';
   var deltaScore = Math.abs(this.game.Score.player - this.game.Score.computer);
   if ((!this.game.shortGame && this.game.Score.player >= 121)
       || (this.game.shortGame && this.game.Score.player >= 61)) {
      if (deltaScore > 60) {
	 gameOverMessage = $L("Double skunk! Ouch...");
      } else if (deltaScore > 30) {
	 gameOverMessage = $L("Darn it! You skunked me...");
      } else {
	 gameOverMessage = $L("Congratulations! You win!");
      }
   } else if ((!this.game.shortGame && this.game.Score.computer >= 121)
	      || (this.game.shortGame && this.game.Score.computer >= 61)) {
      if (deltaScore > 60) {
	 gameOverMessage = $L("Haha! I DOUBLE skunked you!!!");
      } else if (deltaScore > 30) {
	 gameOverMessage = $L("Haha! I skunked you!!!");
      } else {
	 gameOverMessage = $L("I win!");
      }
   }
   // save global stats for each player
   // this.game.statData = [{name:"",data:""}, etc]
   // Mojo.Log.info("loading stats");
   this.game.loadStats(this.saveGameStats.bind(this));
   
   // Mojo.Log.info("clearing data");
   this.game.clearData(this.endOfGameClear.bind(this));
   
   this.endOfGameAlert(gameOverMessage);
}

GameAssistant.prototype.endOfGameClear = function() {
   // do nothing but act as a callback...
}


GameAssistant.prototype.endOfGameAlert = function(gameOverMessage) {
   // Mojo.Log.info("alert user");
   this.controller.showAlertDialog({
      onChoose: function(value) { 
	 if (value == 'gameOver') {
	    Mojo.Controller.stageController.swapScene({name:"finale",disableSceneScroller: false});
	 } else if (value == 'gameOver2') {
	    Mojo.Controller.stageController.swapScene({name:"Stats",disableSceneScroller: false});
	 } else if (value == 'lastBoard') {
	    this.showFinalBoard();
	 } else {
	    this.game = new Game(new pribDataStorage());
	    this.game.checkPrefCookie();
	    this.game.setGamePrefs();
	    Mojo.Controller.stageController.swapScene({name:"Game",disableSceneScroller: true}, this.game);
	 }
      },
      preventCancel: true,
	title: $L("Game Over!"),
	message: gameOverMessage,
	choices: [{label:$L("See the stats"), value:'gameOver'},
		  {label:$L("Player stats"), value:'gameOver2'},
		  {label:$L("See the final board"), value:'lastBoard'},
		  {label:$L("Play again"), value:'newGame'}]
   });
}


GameAssistant.prototype.showFinalBoard = function() {
   Mojo.Log.info("Derp");
   for (i=0; i < this.game.handP.cardCount(); i++){
      Mojo.Event.stopListening(this.controller.get('Pcard'+i), Mojo.Event.tap, this.playCardHandler);
   }
   fBHeight = Mojo.Environment.DeviceInfo.screenHeight;
   fBWidth = Mojo.Environment.DeviceInfo.screenWidth;
   
   this.fbNode = new Element('canvas',{'id':'finalBoardNode','width':fBWidth,'height':fBHeight,'class':'canvasCard','x-mojo-element':'button'});
   var fBctx = this.fbNode.getContext('2d');
   fBctx.strokeStyle = 'black';
   fBctx.lineWidth = 1;
   
   fBctx.strokeRect(0,0,fBWidth,fBHeight);
   
   this.fbNode.setStyle({'zIndex':666,'left':'0px','top':'0px','opacity':'0.5'});
   
   this.Counter.innerHTML = $L("Tap anywhere to continue.");
   this.mainDiv.appendChild(this.fbNode);
   this.controller.setupWidget('finalBoardButton',{},{});
   Mojo.Event.listen(this.fbNode, Mojo.Event.tap, this.finalBoardHandler);
   
}

GameAssistant.prototype.finalBoardPress = function(event) {
   Mojo.Event.stopListening(this.fbNode, Mojo.Event.tap, this.finalBoardHandler);
   this.mainDiv.removeChild(this.fbNode);
   this.Counter.innerHTML = "";
   var newTxt = $L("Seen enough?");
   this.endOfGameAlert(newTxt);
}

GameAssistant.prototype.saveGameStats = function(gameStatData) {
   // Mojo.Log.info('func gameStatData: %j', gameStatData);
   playerStats = {};
   for (sDi = 0; sDi < gameStatData.length; sDi++) {
      if (this.game.gamePrefs.playerName == gameStatData[sDi].name){
	 playerStats = gameStatData.splice(sDi,1)[0];
	 break;
      }
   }
   // Mojo.Log.info('playerStats: %j', playerStats);
   if (playerStats.name){
      statDataIn = playerStats.data;
   } else {
      playerStats.name = this.game.gamePrefs.playerName;
      statDataIn = new statDataConstructor();
   }
   
   var deltaScore = Math.abs(this.game.Score.player - this.game.Score.computer);
   // Mojo.Log.info('delta: '+deltaScore);
   // 
   // add in new data:
   if (this.game.Score.player > this.game.Score.computer) {
      statDataIn.won += 1;
      statDataIn.winDelta += deltaScore;
      if (deltaScore > 60) {
	 statDataIn.skunks += 2;
      } else if (deltaScore > 30) {
	 statDataIn.skunks += 1;
      }
   } else {
      statDataIn.lost += 1;
      statDataIn.loseDelta += deltaScore;
      if (deltaScore > 60) {
	 statDataIn.skunked += 2;
      } else if (deltaScore > 30) {
	 statDataIn.skunked += 1;
      }
   }
   
   /* if (statDataIn.Phands) {
      statDataIn.Phands += this.game.playedHands.player;
   } else {
      statDataIn.Phands = this.game.playedHands.player;
   }
   if (statDataIn.Chands) {
      statDataIn.Chands += this.game.playedHands.computer;
   } else {
      statDataIn.Chands = this.game.playedHands.computer;
   }
   if (statDataIn.Pcribs) {
      statDataIn.Pcribs += this.game.playedCribs.player;
   } else {
      statDataIn.Pcribs = this.game.playedCribs.player;
   }
   if (statDataIn.Ccribs) {
      statDataIn.Ccribs += this.game.playedCribs.computer;
   } else {
      statDataIn.Ccribs = this.game.playedCribs.computer;
   }
   statDataIn.handpoints += this.game.HandScore.player;
   statDataIn.comphandpoints += this.game.HandScore.computer;
   statDataIn.cribpoints += this.game.CribScore.player;
   statDataIn.compcribpoints += this.game.CribScore.computer;
   statDataIn.playpoints += this.game.PlayScore.player;
   statDataIn.compplaypoints += this.game.PlayScore.computer;
   */
   
   // assess points from each round
   if (!statDataIn.pDealerPts) {
      pDealerPts = {};
   } else {
      pDealerPts = statDataIn.pDealerPts;
   }
   for (sDi=0; sDi < this.game.dealerTotalScore.player.length; sDi++) {
      scrVal = this.game.dealerTotalScore.player[sDi];
      if (pDealerPts[scrVal]) {
	 pDealerPts[scrVal] += 1;
      } else {
	 pDealerPts[scrVal] = 1;
      }
   }
   statDataIn.pDealerPts = pDealerPts;
   
   if (!statDataIn.cDealerPts) {
      cDealerPts = {};
   } else {
      cDealerPts = statDataIn.cDealerPts;
   }
   for (sDi=0; sDi < this.game.dealerTotalScore.computer.length; sDi++) {
      scrVal = this.game.dealerTotalScore.computer[sDi];
      if (cDealerPts[scrVal]) {
	 cDealerPts[scrVal] += 1;
      } else {
	 cDealerPts[scrVal] = 1;
      }
   }
   statDataIn.cDealerPts = cDealerPts;
   
   if (!statDataIn.pPonePts) {
      pPonePts = {};
   } else {
      pPonePts = statDataIn.pPonePts;
   }
   for (sDi=0; sDi < this.game.poneTotalScore.player.length; sDi++) {
      scrVal = this.game.poneTotalScore.player[sDi];
      if (pPonePts[scrVal]) {
	 pPonePts[scrVal] += 1;
      } else {
	 pPonePts[scrVal] = 1;
      }
   }
   statDataIn.pPonePts = pPonePts;
   
   if (!statDataIn.cPonePts) {
      cPonePts = {};
   } else {
      cPonePts = statDataIn.cPonePts;
   }
   for (sDi=0; sDi < this.game.poneTotalScore.computer.length; sDi++) {
      scrVal = this.game.poneTotalScore.computer[sDi];
      if (cPonePts[scrVal]) {
	 cPonePts[scrVal] += 1;
      } else {
	 cPonePts[scrVal] = 1;
      }
   }
   statDataIn.cPonePts = cPonePts;
   

   
   // assess points from stages of each round
   
   if (!statDataIn.handpointsArr) {
      handpointsArr = {};
   } else {
      handpointsArr = statDataIn.handpointsArr;
   }
   for (sDi=0; sDi < this.game.HandScoreTNG.player.length; sDi++) {
      scrVal = this.game.HandScoreTNG.player[sDi];
      if (handpointsArr[scrVal]) {
	 handpointsArr[scrVal] += 1;
      } else {
	 handpointsArr[scrVal] = 1;
      }
   }
   statDataIn.handpointsArr = handpointsArr;
   
   if (!statDataIn.comphandpointsArr) {
      comphandpointsArr = {};
   } else {
      comphandpointsArr = statDataIn.comphandpointsArr;
   }
   for (sDi=0; sDi < this.game.HandScoreTNG.computer.length; sDi++) {
      scrVal = this.game.HandScoreTNG.computer[sDi];
      if (comphandpointsArr[scrVal]) {
	 comphandpointsArr[scrVal] += 1;
      } else {
	 comphandpointsArr[scrVal] = 1;
      }
   }
   statDataIn.comphandpointsArr = comphandpointsArr;

   if (!statDataIn.cribpointsArr) {
      cribpointsArr = {};
   } else {
      cribpointsArr = statDataIn.cribpointsArr;
   }
   for (sDi=0; sDi < this.game.CribScoreTNG.player.length; sDi++) {
      scrVal = this.game.CribScoreTNG.player[sDi];
      if (cribpointsArr[scrVal]) {
	 cribpointsArr[scrVal] += 1;
      } else {
	 cribpointsArr[scrVal] = 1;
      }
   }
   statDataIn.cribpointsArr = cribpointsArr;
   
   if (!statDataIn.compcribpointsArr) {
      compcribpointsArr = {};
   } else {
      compcribpointsArr = statDataIn.compcribpointsArr;
   }
   for (sDi=0; sDi < this.game.CribScoreTNG.computer.length; sDi++) {
      scrVal = this.game.CribScoreTNG.computer[sDi];
      if (compcribpointsArr[scrVal]) {
	 compcribpointsArr[scrVal] += 1;
      } else {
	 compcribpointsArr[scrVal] = 1;
      }
   }
   statDataIn.compcribpointsArr = compcribpointsArr;
   
   if (!statDataIn.playpointsArr) {
      playpointsArr = {};
   } else {
      playpointsArr = statDataIn.playpointsArr;
   }
   for (sDi=0; sDi < this.game.PlayScoreTNG.player.length; sDi++) {
      scrVal = this.game.PlayScoreTNG.player[sDi];
      if (playpointsArr[scrVal]) {
	 playpointsArr[scrVal] += 1;
      } else {
	 playpointsArr[scrVal] = 1;
      }
   }
   statDataIn.playpointsArr = playpointsArr;
   
   if (!statDataIn.compplaypointsArr) {
      compplaypointsArr = {};
   } else {
      compplaypointsArr = statDataIn.compplaypointsArr;
   }
   for (sDi=0; sDi < this.game.PlayScoreTNG.computer.length; sDi++) {
      scrVal = this.game.PlayScoreTNG.computer[sDi];
      if (compplaypointsArr[scrVal]) {
	 compplaypointsArr[scrVal] += 1;
      } else {
	 compplaypointsArr[scrVal] = 1;
      }
   }
   statDataIn.compplaypointsArr = compplaypointsArr;
   
   statDataIn.avgPlayLevel += parseInt(this.game.gameLevel);
   
   if (this.game.shortGame) {
      statDataIn.shortgames += 1;
      statDataIn.shorthands += this.game.numHands;
   } else {
      statDataIn.hands += this.game.numHands;
      statDataIn.games += 1;
   }
   
   if (!statDataIn.CwinStreak)
     statDataIn.CwinStreak = 0;
   if (!statDataIn.CwinStreakRecord)
     statDataIn.CwinStreakRecord = 0;
   if (!statDataIn.PwinStreak)
     statDataIn.PwinStreak = 0;
   if (!statDataIn.PwinStreakRecord)
     statDataIn.PwinStreakRecord = 0;
   
   if (this.game.Score.player > this.game.Score.computer) {
      if (statDataIn.PwinStreak > 0) {
	 statDataIn.PwinStreak += 1;
      } else {
	 statDataIn.PwinStreak = 1;
	 statDataIn.CwinStreak = 0;
      }
      if (statDataIn.PwinStreak > statDataIn.PwinStreakRecord) {
	 statDataIn.PwinStreakRecord = statDataIn.PwinStreak;
      }
   } else {
      if (statDataIn.CwinStreak > 0) {
	 statDataIn.CwinStreak += 1;
      } else {
	 statDataIn.CwinStreak = 1;
	 statDataIn.PwinStreak = 0;
      }
      if (statDataIn.CwinStreak > statDataIn.CwinStreakRecord) {
	 statDataIn.CwinStreakRecord = statDataIn.CwinStreak;
      }
   }   
   
   switch (this.game.cutWinner) {
    case 'player':
      statDataIn.Pcutwins += 1;
      break;
    case 'computer':
      statDataIn.Ccutwins += 1;
      break;
   }
   
   playerStats.data = Object.toJSON(statDataIn);
   this.game.statData.push(playerStats);
   
   while (gameStatData.length) {
      var tmpStatDat = {};
      var nextDat = gameStatData.pop();
      tmpStatDat.name = nextDat.name;
      tmpStatDat.data = Object.toJSON(nextDat.data);
      this.game.statData.push(tmpStatDat);
   }
   
   // Mojo.Log.info('func statData: %j', this.game.statData);
   if (this.game.statData.length > 0) {
      this.game.saveStatsSoon();
   }
}


