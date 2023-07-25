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


function HighScoresAssistant(myGame) {
   this.game = myGame;
}

HighScoresAssistant.prototype.setup = function() {
   this.index = 0;
   // set up score table/list
   this.tableTop = this.controller.get('scoreTable');
   
   this.cardGroupNode = [];
   this.scoreScroller = new Element('div',{'id':'handScroller','class':'handscroller','x-mojo-element':'Scroller'});
   if (this.game.palmType == 'pixi') {
      this.scoreScroller.setStyle({'height':'320px'});
   }
   this.tableTop.appendChild(this.scoreScroller);

   if (this.game.gamePrefs.backGroundColor) {
      this.tableTop.setStyle({'background-color':this.game.gamePrefs.backGroundColor});
      this.scoreScroller.setStyle({'background-color':this.game.gamePrefs.backGroundColor});
   }
   
   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);
}

HighScoresAssistant.prototype.activate = function(event) {
   $("scoreTitle").innerHTML = $L("Highest Scoring Hands");

   this.game.loadHands(this.checkHandData.bind(this));
}


HighScoresAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

HighScoresAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}


HighScoresAssistant.prototype.checkHandData = function() {
   var handNum = this.game.handData.length;
   if (handNum > 0) {
      this.setupCards();
   }
}

HighScoresAssistant.prototype.setupCards = function() {
   
   // pop each deck out of the handData stack.
   currHand = this.game.handData.shift();
   currDeck = new Deck();
   numCards = currHand.hand.cards.length;
   
   for (i=0; i < numCards; i++) {
      var x = currHand.hand.cards[i];
      if (x.isCut) {
	 y = x;
      } else {
	 currDeck.cards[i] = new Card(x.rank, x.suit, x.ordinal, x.deckIndex, x.faceValue);
      }
   }
   currDeck.cards.sort(sortCardsbyRank);
   m = currDeck.cardCount();
   if (y) {
      currCut = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
      currCut.isCut = 1;
   }   
   newScore = currDeck.cribScore(currCut); // make pop-up with score break-down.
   
   // set up container/group node for cards. title line should have player,
   // date, and score. use this.index for IDs, etc.
   this.cardGroupNode[this.index] = new Element('div',{'id':'cardGroupNode'+this.index,'class':'palm-group unlabeled'});
   topPos = this.index*174;
   this.cardGroupNode[this.index].setStyle({'position':'absolute','left':'0px','top':topPos+'px','width':'270px'});
   this.scoreScroller.appendChild(this.cardGroupNode[this.index]);
   
   cardList = new Element('div',{'id':'cardList'+this.index,'class':'palm-list'});
   this.cardGroupNode[this.index].appendChild(cardList);
   
   cardTitle = new Element('div',{'id':'cardTitle'+this.index,'class':'palm-row first'});
   cardList.appendChild(cardTitle);
   cardTitleWrapper = new Element('div',{'id':'cardTitleWrapper'+this.index,'class':'palm-row-wrapper'});
   cardTitle.appendChild(cardTitleWrapper);
   cardTitleWrapperInner = new Element('div',{'id':'cardTitleWrapperInner'+this.index,'class':'title'});
   cardTitleWrapper.appendChild(cardTitleWrapperInner);
   cardTitleWrapperInner.setStyle({'color':'#4a4a4a','font-size':'14px'});
   // theDay = new Date(currHand.playdate).toLocaleDateString();
   datePlayed = new Date(currHand.playdate);
   formattedDate = Mojo.Format.formatDate(datePlayed, {date:"medium"});
   
   if (currHand.name == "computer") {
      nameL18n = $L("computer");
   } else {
      nameL18n = currHand.name;
   }
   if (currHand.dealer == "computer") {
      dealerL18n = $L("computer");
   } else {
      dealerL18n = currHand.dealer;
   }
   
   cardTitleWrapperInner.innerHTML = $L("Player")+': '+nameL18n+' :: '+$L("Dealer")+': '+dealerL18n+'<br>'+$L("#{score} points on #{date}").interpolate({score:newScore.totalScore(),date:formattedDate});
   
   cardGroup = new Element('div',{'id':'cardGroup'+this.index,'class':'palm-row last'});
   cardGroup.setStyle({'height':'84px'});
   cardList.appendChild(cardGroup);
   
   leftPos = 5;
   topPos = 54;
   for (i=0; i < currDeck.cardCount(); i++) {
      // Mojo.Log.info('card: ' + currDeck.cards[i]);
      cardNode = currDeck.cards[i].canvasNode('card'+this.index+i, 1);
      cardNode.setStyle({'position':'absolute','left':leftPos+'px','top':topPos+'px'});
      cardGroup.appendChild(cardNode);
      leftPos += 36;
   }
   leftPos += 40; // pull the cut card out a bit.
   cardNode = currCut.canvasNode('cutcard'+this.index, 1);
   cardNode.setStyle({'position':'absolute','left':leftPos+'px','top':topPos+'px'});
   cardGroup.appendChild(cardNode);
   

   // close container.
   this.index++;
   if (this.game.handData.length > 0) {
	this.setupCards();
   }
}
