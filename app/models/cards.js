// Score constructor function.

function Score() {
   
   this.pair = 0;
   this.fifteen = 0;
   this.flush = 0;
   this.straight = 0;
   this.nobs = 0;
   
   this.toString = scoreString;
   this.totalScore = totalScoreAdder;
}

function scoreString() {
   var scoreTxt = "<span class=\"scoreFont\">"; 
   var numScores = 0;
   var tScore = this.totalScore();
   
   if (this.fifteen > 0){
      if (this.fifteen == 2) {
	 // scoreTxt += "Fifteen for "+this.fifteen+". ";
	 scoreTxt += $L("Fifteen for #{score}. ").interpolate({score:this.fifteen});
	 numScores++;
      } else {
	 // scoreTxt += "Fifteens for "+this.fifteen+". ";
	 scoreTxt += $L("Fifteens for #{score}. ").interpolate({score:this.fifteen});
	 numScores++;
      }
   }
   if (this.pair > 0 && this.straight < 4){
      if (this.pair == 2) {
	 // scoreTxt += "A pair for "+this.pair+". ";
	 scoreTxt += $L("A pair for #{score}. ").interpolate({score:this.pair});
	 numScores++;
      } else {
	 // scoreTxt += "Pairs for "+this.pair+". ";
	 scoreTxt += $L("Pairs for #{score}. ").interpolate({score:this.pair});
	 numScores++;
      }
   }
   if (this.flush > 3){
      // scoreTxt += "A flush for "+this.flush+". ";
      scoreTxt += $L("A flush for #{score}. ").interpolate({score:this.flush});
      numScores++;
   }
   if (this.straight > 0){
      if (this.straight < 6) {
	 // scoreTxt += "A straight for "+this.straight+". ";
	 scoreTxt += $L("A straight for #{score}. ").interpolate({score:this.straight});
	 numScores++;
      } else if (this.pair == 2){
	 var dblRun = parseInt(this.straight+this.pair);
	 // scoreTxt += "A double run for "+dblRun+". ";
	 scoreTxt += $L("A double run for #{score}. ").interpolate({score:dblRun});
	 numScores++;
      } else if (this.pair == 4){
	 var dbldblRun = parseInt(this.straight+this.pair);
	 // scoreTxt += "A double double run for "+dbldblRun+". ";
	 scoreTxt += $L("A double double run for #{score}. ").interpolate({score:dbldblRun});
	 numScores++;
      } else if (this.pair == 6){
	 var trplRun = parseInt(this.straight+this.pair);
	 // scoreTxt += "A triple run for "+trplRun+"! ";
	 scoreTxt += $L("A triple run for #{score}! ").interpolate({score:trplRun});
	 numScores++;
      }
   }
   
   if (this.nobs > 0){
      if (tScore == 1) {
	 scoreTxt += $L("One for his nobs! (Better than nothing, eh?) ");
	 numScores++;
      } else {
	 scoreTxt += $L("And one for his nobs! ");
	 numScores++;
      }
   }
   if (numScores > 1) {
      scoreTxt += $L("Total score is #{score}.").interpolate({score:tScore});
   } else if (numScores == 0){
      scoreTxt += $L("Zero points. Too bad...");
   }
   
   scoreTxt += "</span>";
   return scoreTxt;
}

function totalScoreAdder() {
   return this.pair + this.fifteen + this.flush + this.straight + this.nobs;
}

// Card constructor function.

function Card(rank, suit, ordinal, deckIndex, faceValue) { 
   
   this.rank = rank;
   this.suit = suit;
   this.ordinal = ordinal;
   this.deckIndex = deckIndex;
   this.faceValue = faceValue;
   this.isCut = 0;
   this.isPlayed = 0;
   this.isSelected = 0;
   this.rSort = 0;
   
   this.canvasNode = NewCardCanvasNode;
   this.canvasBack = NewCardCanvasNodeBack;
   this.toString = cardToString;
}

// cardToString(): Returns the name of a card (including rank and suit) as a
// text string.

function cardToString() {
   switch (this.suit) {
    case "C" :
      suitChar = "\u2663";
      suitColor = "#000000";
      break;
    case "D" :
      suitChar = "\u2666";
      suitColor = "#ff0000";
      break;
    case "H" :
      suitChar = "\u2665";
      suitColor = "#ff0000";
      break;
    case "S" :
      suitChar = "\u2660";
      suitColor = "#000000";
      break;
   }

   return "<span style=\"color:"+suitColor+"\">"+this.rank + suitChar+"</span>";
}

// NewCardCanvasNode(nodeType,nodeId): returns a HTML5 canvas element for a given card. 

function NewCardCanvasNode(nodeId) {
   cardNode = new Element('canvas',{'id':nodeId,'width':'60','height':'75','class':'canvasCard','x-mojo-element':'button'});
   
   var ctx = cardNode.getContext('2d');
   
   // Mojo.Log.info('Version',Mojo.Environment.DeviceInfo.platformVersion);
   
   ctx.fillStyle='white';
   ctx.strokeStyle = 'black';
   if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
      // using a Pixi!
      ctx.lineWidth=1;
      roundedRect(ctx,2,2,42,58,5);
   } else {
      ctx.lineWidth=2;
      roundedRect(ctx,2,2,51,70,6);
   }

   if (this.suit == 'H' || this.suit == 'D') {
      ctx.fillStyle='red';
   } else {
      ctx.fillStyle='black';
   }
   suitChar = "\u00a0";
   switch (this.suit) {
    case "C" :
      suitChar = "\u2663";
      break;
    case "D" :
      suitChar = "\u2666";
      break;
    case "H" :
      suitChar = "\u2665";
      break;
    case "S" :
      suitChar = "\u2660";
      break;
   }
   
   if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
      // using a Pixi!
      ctx.font='bold 14pt Prelude';
      ctx.fillText(this.rank,5,20);
      ctx.font='bold 28pt Prelude';
      ctx.fillText(suitChar,8,50);
   } else {
      ctx.font='bold 16pt Prelude';
      ctx.fillText(this.rank,6,24);
      if (Mojo.Environment.DeviceInfo.platformVersionMajor == 1) {
	 // webOS 1.x
	 ctx.font='bold 32pt Prelude';
	 ctx.fillText(suitChar,9,60);
      } else {
	 // webOS 2.x - so nice that they changed the fonts...
	 ctx.font='bold 36pt Prelude';
	 ctx.fillText(suitChar,9,63);
      }
   }

   return cardNode;
}

// NewCardCanvasNodeBack(nodeType,nodeId): returns a HTML5 canvas element for a given card back. 

function NewCardCanvasNodeBack(nodeId,backColor) {
   cardNode = new Element('canvas',{'id':nodeId,'width':'60','height':'75','style':'position:absolute'});
   
   var logo = 0;
   
   if (!backColor) {
      colorForBack = '#2A52BE';
   } else {
      if (backColor.length == 7) {
	 colorForBack = backColor;
      } else {
	 colorForBack = backColor.substring(0,7);
	 logo = 0;
      }
   }
   
   var ctx = cardNode.getContext('2d');
   // ctx.fillStyle = '#1C4597';
   ctx.fillStyle = colorForBack; // Cerulean Blue
   ctx.strokeStyle = 'black';
   
   if (Mojo.Environment.DeviceInfo.touchableRows == 7) {
      // using a Pixi!
      ctx.lineWidth=1;
      roundedRect(ctx,2,2,42,58,5);
   } else {
      ctx.lineWidth=2;
      roundedRect(ctx,2,2,51,70,6);
   }
   
   if (logo) {
      cardImg = new Image();
      cardImg.src = 'images/pribbage_logo64.png';
      cardImg.onload = function() {
	 ctx.drawImage(cardImg,0,0,64,64,5,15,45,45);
      }.bind(this);
   }
   
   return cardNode;
}




function roundedRect(ctx,x,y,width,height,radius) {
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
  


// Deck array and functions.

function Deck() {

   // Create an empty array of cards.
   // 
   this.cards = [];
   
   this.addCard = deckAddCard;
   this.cardCount = deckCardCount;
   this.combine = deckCombine;
   this.deal = deckDeal;
   this.draw = deckDraw;
   this.makeDeck = deckMakeDeck;
   this.shuffle = deckShuffle;
   this.cribScore = deckCribScore;
   this.toCrib = decideCrib;
   this.toCrib5 = decideCrib5;
   this.prefOrd = handPrefOrd;
   
   this.toString = deckToString;
   
}

// deckMakeDeck(n): Initializes a deck using 'n' packs of cards.

function deckMakeDeck(n) {
   
   jackrank = $L({value:"Jack",key:"jack_key"});
   queenrank = $L({value:"Queen",key:"queen_key"});
   kingrank = $L({value:"King",key:"king_key"});
   ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", jackrank, queenrank, kingrank];
   faceValue = [1,2,3,4,5,6,7,8,9,10,10,10,10];
   suits = ["S", "H", "C", "D"];
   
   m = ranks.length * suits.length;
   
   this.cards = [];
   
   for (i = 0; i < n; i++) {
      for (j = 0; j < suits.length; j++) {
	 for (k = 0; k < ranks.length; k++) {
	    if (ranks[k].length > 2) {
	       thisrank = ranks[k].slice(0,1);
	    } else {
	       thisrank = ranks[k];
	    }
	    this.cards[i * m + j * ranks.length + k] = new Card(thisrank, suits[j], k, (j * ranks.length + k), faceValue[k]);
	 }
      } 
   }
}

// deckShuffle(n): Shuffles a deck of cards 'n' times using a modified Fisher-Yates algorithm 
// (i.e., Durstenfeld's algorithm).
// NOTE: changed temporarily to a simpler .sort() based algorithm.

function deckShuffle(n) {
   while (n--) {
      for (i=0; i < this.cards.length; i++) {
	 this.cards[i].rSort = Math.random();
      }
      this.cards.sort(shuffleSort);
   }
}

function deckShuffleD(n) {
   while (n--) {
      var mTemp, j, i = this.cards.length;
      if (i) {
	 while (--i) {
	    j = Math.floor(Math.random()*(i+1));
	    mTemp = this.cards[j];
	    this.cards[j] = this.cards[i];
	    this.cards[i] = mTemp;
	 }
      }
   }
   var aTemp = [];
   for (ri=0; ri < this.cards.length; ri++) {
      aTemp.push(this.cards[ri].rank+this.cards[ri].suit);
   }
   Mojo.Log.info("aTemp: %j", aTemp);
}


// deckDeal(): Returns the first card in the deck.

function deckDeal() {

  if (this.cards.length > 0) {
     return this.cards.shift();
  } else {
     return null;
  }
}

// deckDraw(n): Returns the indicated card from the deck, or
// returns a randomly chosen card (if n < 0 or n >= deck length).

function deckDraw(n) {
   var card;
   
   if (n >= 0 && n < this.cards.length) {
      card = this.cards[n];
      this.cards.splice(n, 1);
   } else {
      cn = Math.floor(Math.random()*(this.cards.length));
      card = this.cards[cn];
      card.isCut = 1;
      // Mojo.Log.info("draw number and card: %j %j", cn, card);
      this.cards.splice(cn, 1);
   }
   
   return card;
}

// deckToString(): Returns the card rank and suit of a deck as a
// text string.

function deckToString(cutCard) {
   var cardA = [];
   for (i=0; i<this.cards.length; i++) {
      cardA.push(this.cards[i]);
   }
   return cardA.join(" ");
}

// deckAdd(card): Adds a new card to the deck.

function deckAddCard(card) {
   this.cards.push(card);
}

// deckCombine(stack): Adds the cards in a new stack to the current deck.
// The stack is left empty. Reset the isCut, isPlayed, and isSelected values to 0.

function deckCombine(stack) {
   for (i = 0; i < stack.cards.length; i++) {
      stack.cards[i].isCut = 0;
      stack.cards[i].isPlayed = 0;
      stack.cards[i].isSelected = 0;
   }
   this.cards = this.cards.concat(stack.cards);
   stack.cards = new Array();
}

// deckCardCount(): Returns the number of cards currently in the deck.

function deckCardCount() {
   return this.cards.length;
}

// handPrefOrd(): return a preferred ordinal number of the card that will maximize a score (CHEAT MODE ONLY!)

function handPrefOrd() {
   var prefOrdVal = [];
   var cuttingCards = [{rank: 'A', suit:'S', ordinal:0, deckIndex:0, faceValue:1 },
		       {rank: '2', suit:'S', ordinal:1, deckIndex:1, faceValue:2 },
		       {rank: '3', suit:'S', ordinal:2, deckIndex:2, faceValue:3 },
		       {rank: '4', suit:'S', ordinal:3, deckIndex:3, faceValue:4 },
		       {rank: '5', suit:'S', ordinal:4, deckIndex:4, faceValue:5 },
		       {rank: '6', suit:'S', ordinal:5, deckIndex:5, faceValue:6 },
		       {rank: '7', suit:'S', ordinal:6, deckIndex:6, faceValue:7 },
		       {rank: '8', suit:'S', ordinal:7, deckIndex:7, faceValue:8 },
		       {rank: '9', suit:'S', ordinal:8, deckIndex:8, faceValue:9 },
		       {rank: '10', suit:'S', ordinal:9, deckIndex:9, faceValue:10 },
		       {rank: 'J', suit:'S', ordinal:10, deckIndex:10, faceValue:10 },
		       {rank: 'Q', suit:'S', ordinal:11, deckIndex:11, faceValue:10 },
		       {rank: 'K', suit:'S', ordinal:12, deckIndex:12 , faceValue:10 }];
   
   if (this.cards.length == 4) {
      var maxScore = 0;
      for (mc=0; mc < cuttingCards.length; mc++) {
	 var y = cuttingCards[mc];
	 currCut = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
	 currCut.isCut = 1;
	 currScore = this.cribScore(currCut).totalScore();
	 // Mojo.Log.info("Ordinal: "+y.ordinal+", Score: "+currScore);
	 if (currScore > maxScore) {
	    maxScore = currScore;
	    prefOrdVal = [y.ordinal];
	 } else if (currScore == maxScore) {
	    prefOrdVal.push(y.ordinal);
	 }
      }
   }
   // Mojo.Log.info("PrefOrd: %j",prefOrdVal);
   return prefOrdVal;
}


// deckCribScore(): Return a cribbage score based on the cards in the deck. The cut card is indicated
// by the Card structure element ".isCut == 1".

function deckCribScore(cutCard, isCrib) {
   this.score = new Score();
   var numCards = this.cards.length;
   var isFlush = 0;
   scoreCards = [];
   allowedScores = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,21,22,23,24,28,29];
   
   for (i=0; i < numCards; i++){
      scoreCards[i] = this.cards[i];
   }
   
   if (cutCard) {
      scoreCards.push(cutCard);
   }
   
   
   // sort cards by rank (using ordinal)
   scoreCards.sort(sortCardsbyRank);
   // Mojo.Log.info(" %j", scoreCards);
   numCards = scoreCards.length;
   
   // 
   // Only score proper hands of 5 cards (four in hand/crib + 1 cut) or 
   // potential score with 4 cards (e.g., to determine crib discards).
   if (numCards != 5 && numCards != 4)
     return null;
   
   for (i=0; i < numCards; i++) {
      // count pairs
      for (j=i+1; j < numCards; j++) {
	 if (scoreCards[i].ordinal == scoreCards[j].ordinal) {
	    this.score.pair += 2;
	 }
      }
   } 
   
   // check for a flush: all 4 in hand must be same suit
   var cutSuit = '';
   for (i=0; i < numCards; i++) {
      if (scoreCards[i].isCut == 1) {
	 cutSuit = scoreCards[i].suit;
	 break;
      }
   }
   for (i=0; i < numCards; i++) {
      if (scoreCards[i].isCut == 0) {
	 flushSuit = scoreCards[i].suit;
	 break;
      }
   }
   for (i=0; i < numCards; i++) {
      if (scoreCards[i].isCut == 0) {
	 if (flushSuit == scoreCards[i].suit) 
	   isFlush++;		       /* count number of similar card suits */
      }
   }
   if (isFlush == 4  && cutSuit != flushSuit && !isCrib) {
      this.score.flush = 4;
   } else if (isFlush == 4 && cutSuit == flushSuit) {
      this.score.flush = 5;
   }
   
   
   // check for straights
   var cardRun = 0;
   var found5=0, found4=0;
   
   for (i=0; i< numCards; i++) {
      for (j=i+1; j< numCards; j++) {
	 for (k=j+1; k< numCards; k++) {
	    for (l=k+1; l< numCards; l++) {
	       for (m=l+1; m< numCards; m++) {
		  if (scoreCards[m].ordinal == scoreCards[l].ordinal+1 
		      && scoreCards[l].ordinal == scoreCards[k].ordinal+1 
		      && scoreCards[k].ordinal == scoreCards[j].ordinal+1 
		      && scoreCards[j].ordinal == scoreCards[i].ordinal+1) {
		     cardRun += 5;
		     // Mojo.Log.info('5-card straight.');
		     found5 = 1;
		  }
	       }
	       if (!found5 && scoreCards[l].ordinal == scoreCards[k].ordinal+1 
		   && scoreCards[k].ordinal == scoreCards[j].ordinal+1 
		   && scoreCards[j].ordinal == scoreCards[i].ordinal+1) {
		  cardRun += 4;
		  // Mojo.Log.info('4-card straight.');
		  found4 = 1;
	       }
	    }
	    if (!found4 && !found5 && scoreCards[k].ordinal == scoreCards[j].ordinal+1 
		&& scoreCards[j].ordinal == scoreCards[i].ordinal+1) {
	       // Mojo.Log.info('3-card straight.');
	       cardRun += 3;
	    }
	 }
      }
   }
   this.score.straight = cardRun;
   
   // check for 15 counts
   fifteenSets = [];
   for (i=0; i < numCards; i++) {
      for (j=i+1; j < numCards; j++) {
	 if (scoreCards[i].faceValue 
	     + scoreCards[j].faceValue == 15) { // two-card scores
	    this.score.fifteen += 2;
	 }
	 for (k=j+1; k < numCards; k++) {
	    if (scoreCards[i].faceValue 
		+ scoreCards[j].faceValue 
		+ scoreCards[k].faceValue == 15) { // three-card scores
	       this.score.fifteen += 2;
	    }
	    for (l=k+1; l < numCards; l++) {
	       if (scoreCards[i].faceValue 
		   + scoreCards[j].faceValue 
		   + scoreCards[k].faceValue  
		   + scoreCards[l].faceValue == 15) { // four-card scores
		  this.score.fifteen += 2;
	       }
	       for (m=l+1; m < numCards; m++) {
		  if (scoreCards[i].faceValue 
		      + scoreCards[j].faceValue 
		      + scoreCards[k].faceValue  
		      + scoreCards[l].faceValue  
		      + scoreCards[m].faceValue == 15) { // five-card scores
		     this.score.fifteen += 2;
		  }
	       }
	    }
	 }
      }
   }
   
   // check for 'his nobs'
   for (i=0; i < numCards; i++) {
      if (scoreCards[i].ordinal == 10 && scoreCards[i].suit == cutSuit && scoreCards[i].isCut == 0 && numCards == 5) {
	 this.score.nobs++;
      }
   }
   
   if (allowedScores.indexOf(this.score.totalScore()) == -1) {
      Mojo.Log.error("ALAAAAAAARM!!! Score problem!", this.score.totalScore());
      Mojo.Log.error("score: %j",this.score);
   }
   
   return this.score;
}


function sortCardsbyRank(a,b) {
   return a.ordinal - b.ordinal;
}

function sortCardsbyRankRev(b,a) {
   return a.ordinal - b.ordinal;
}

function decideCrib(dealer,gameLevel) {
   if (!dealer) {
      var dealer = 'player';
   }
   
   if (!gameLevel) {
      var gameLevel = 0;
   }
   // Mojo.Log.info('dealer = ', dealer);
   
   // loop through cards to find all 4-card combinations and evaluate for best
   var thisJSON = Object.toJSON(this.cards);
   
   // lookup table for statistical data on discards, calculated from averages for all possible card combinations
   discardToYourMom = [];
   discardToYourMom.push([5.53,4.45,4.57,5.47,5.74,4.26,4.09,4.13,4.04,3.96,4.20,3.86,3.75]); // A
   discardToYourMom.push([4.45,5.83,6.84,4.85,5.77,4.37,4.29,4.24,4.14,4.08,4.31,3.97,3.86]); // 2
   discardToYourMom.push([4.57,6.84,6.16,5.50,6.43,4.28,4.36,4.29,4.12,4.15,4.38,4.05,3.94]); // 3
   discardToYourMom.push([5.47,4.85,5.50,6.14,7.00,4.97,4.18,4.31,4.21,4.15,4.38,4.04,3.94]); // 4
   discardToYourMom.push([5.74,5.77,6.43,7.00,8.99,7.10,6.42,5.76,5.74,7.03,7.26,6.93,6.82]); // 5
   discardToYourMom.push([4.26,4.37,4.28,4.97,7.10,6.29,5.54,4.91,5.58,3.84,4.08,3.74,3.63]); // 6
   discardToYourMom.push([4.09,4.29,4.36,4.18,6.42,5.54,6.11,6.77,4.36,3.73,4.02,3.69,3.58]); // 7
   discardToYourMom.push([4.13,4.24,4.29,4.31,5.76,4.91,6.77,5.63,4.94,4.31,3.95,3.67,3.56]); // 8
   discardToYourMom.push([4.04,4.14,4.12,4.21,5.74,5.58,4.36,4.94,5.53,4.85,4.49,3.56,3.51]); // 9
   discardToYourMom.push([3.96,4.08,4.15,4.15,7.03,3.84,3.73,4.31,4.85,5.46,5.05,4.12,3.42]); // 10
   discardToYourMom.push([4.20,4.31,4.38,4.38,7.26,4.08,4.02,3.95,4.49,5.05,5.93,5.01,4.31]); // J
   discardToYourMom.push([3.86,3.97,4.05,4.04,6.93,3.74,3.69,3.67,3.56,4.12,5.01,5.25,3.97]); // Q
   discardToYourMom.push([3.75,3.86,3.94,3.94,6.82,3.63,3.58,3.56,3.51,3.42,4.31,3.97,5.03]); // K
   
   
   var cuttingCards = [{rank: 'A', suit:'S', ordinal:0, deckIndex:0, faceValue:1 },
		       {rank: '2', suit:'S', ordinal:1, deckIndex:1, faceValue:2 },
		       {rank: '3', suit:'S', ordinal:2, deckIndex:2, faceValue:3 },
		       {rank: '4', suit:'S', ordinal:3, deckIndex:3, faceValue:4 },
		       {rank: '5', suit:'S', ordinal:4, deckIndex:4, faceValue:5 },
		       {rank: '6', suit:'S', ordinal:5, deckIndex:5, faceValue:6 },
		       {rank: '7', suit:'S', ordinal:6, deckIndex:6, faceValue:7 },
		       {rank: '8', suit:'S', ordinal:7, deckIndex:7, faceValue:8 },
		       {rank: '9', suit:'S', ordinal:8, deckIndex:8, faceValue:9 },
		       {rank: '10', suit:'S', ordinal:9, deckIndex:9, faceValue:10 },
		       {rank: 'J', suit:'S', ordinal:10, deckIndex:10, faceValue:10 },
		       {rank: 'Q', suit:'S', ordinal:11, deckIndex:11, faceValue:10 },
		       {rank: 'K', suit:'S', ordinal:12, deckIndex:12 , faceValue:10 }];
   
   if (this.cards.length > 5) {
      numCards = this.cards.length;
      theseCards = []; l = 0;
            
      for (i=0; i < numCards-1; i++) {
	 for (j=i+1; j < numCards; j++) {
	    //Mojo.Log.info(i, j);
	    theseCards[l] = new cribCheck();
	    var cardArr = thisJSON.evalJSON();
	    for (m=0; m < cardArr.length; m++) {
	       theseCards[l].deck.cards[m] = cardArr[m];
	    }
	    theseCards[l].pulledCard.addCard(theseCards[l].deck.cards.splice(j,1)[0]);
	    theseCards[l].pulledCard.addCard(theseCards[l].deck.cards.splice(i,1)[0]);
	    l++;
	 }
      }
      
      if (gameLevel != 0) {
	 for (lm = 0; lm < theseCards.length; lm++) {
	    // average over all possible ranks for the cut card
	    for (mc=0; mc < cuttingCards.length; mc++) {
	       var y = cuttingCards[mc];
	       currCut = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
	       currCut.isCut = 1;
	       theseCards[lm].avgScore += theseCards[lm].deck.cribScore(currCut).totalScore();
	    }
	    theseCards[lm].avgScore /= cuttingCards.length;
	 }
      } else {
	 for (lm = 0; lm < theseCards.length; lm++) {
	    theseCards[lm].avgScore = theseCards[lm].deck.cribScore().totalScore();
	 }
      }
      
      theseCards.sort(sortByScore);
      // Add code here to optimize the hand (e.g., pick the better of multiple hands that have
      // the same high score).
      sentSet = -1;
      // eliminate all the zero-scoring combinations. we don't want them!
      for (ri=theseCards.length-1; ri >= 0 ; ri--) {
	 if (theseCards[ri].avgScore == 0) {
	    theseCards.splice(ri,1);
	 }
      }
      if (theseCards.length == 1) { // only one? send it!
	 sentSet = 0;
      } else if (gameLevel != 0 && theseCards.length > 1) {
	 if (theseCards[0].avgScore - theseCards[1].avgScore > 3){
	    sentSet = 0; // take the high score
	 } else { // compare and rank potential hands of the same score range
	    // add something to look at the crib cards: don't want to 
	    // put pairs of cards, addups to 15s, or 5s into the crib 
	    // if it's not ours.
	    var optCard = 0, counter = 0; 
	    for (mi = 0; mi < theseCards.length; mi++) {
	       thisSet = mi;
	       theseCards[thisSet].rank = theseCards[thisSet].avgScore;
	       
	       if (gameLevel < 0 || gameLevel > 1) {
		  cO0 = theseCards[thisSet].pulledCard.cards[0].ordinal;
		  cO1 = theseCards[thisSet].pulledCard.cards[1].ordinal;
	       
		  if (dealer == 'computer') {
		     theseCards[thisSet].rank += discardToYourMom[cO0][cO1];
		  } else {
		     // don't throw same suit to the player
		     theseCards[thisSet].rank -= discardToYourMom[cO0][cO1];
		     cs0 = theseCards[thisSet].pulledCard.cards[0].suit;
		     cs1 = theseCards[thisSet].pulledCard.cards[1].suit;
		     if (cs0 == cs1) {
			theseCards[thisSet].rank -= 0.5;
		     }
		  }
	       }
	    }
	    theseCards.sort(sortSetByRank);
	    sentSet = 0; // Math.floor(Math.random()*(sameScoreSet.length));
	 }
      } else if (gameLevel == 0 && theseCards.length > 1) {
	 sentSet = Math.floor(Math.random()*(theseCards.length));
      }
      
      if (theseCards.length == 0 || sentSet == -1) { // whoops! got rid of them all! must be a poor hand...
	 cardArr = thisJSON.evalJSON();
	 theseCards = new cribCheck();
	 tmpArr = [];
	 // REWORK! Could return same card twice. ;)~
	 for (oi = 0; oi < cardArr.length; oi++) {
	    tmpArr.push(oi);
	 }
	 junkNum = tmpArr.splice(Math.floor(Math.random()*(tmpArr.length)),1);
	 theseCards.pulledCard.addCard(cardArr[junkNum]);
	 junkNum = tmpArr.splice(Math.floor(Math.random()*(tmpArr.length)),1);
	 theseCards.pulledCard.addCard(cardArr[junkNum]);
	 Mojo.Log.info('pulled cards: %j', theseCards.pulledCard);
	 return theseCards.pulledCard;
      }

      // return the two pulled cards
      return theseCards[sentSet].pulledCard;
   } else  {
      return null;
   }
}

function decideCrib5(dealer,gameLevel) {
   if (!dealer) {
      var dealer = 'player';
   }
   
   if (!gameLevel) {
      var gameLevel = 0;
   }
   // Mojo.Log.info('gamelevel = ', gameLevel);
   
   discard5 = [4.43,4.67,4.68,4.71,6.75,4.68,4.58,4.45,4.42,4.42,4.75,4.27,4.09];
      
   // loop through cards to find all 4-card combinations and evaluate for best
   var thisJSON = Object.toJSON(this.cards);
   var cuttingCards = [{rank: 'A', suit:'S', ordinal:0, deckIndex:0, faceValue:1 },
		       {rank: '2', suit:'S', ordinal:1, deckIndex:1, faceValue:2 },
		       {rank: '3', suit:'S', ordinal:2, deckIndex:2, faceValue:3 },
		       {rank: '4', suit:'S', ordinal:3, deckIndex:3, faceValue:4 },
		       {rank: '5', suit:'S', ordinal:4, deckIndex:4, faceValue:5 },
		       {rank: '6', suit:'S', ordinal:5, deckIndex:5, faceValue:6 },
		       {rank: '7', suit:'S', ordinal:6, deckIndex:6, faceValue:7 },
		       {rank: '8', suit:'S', ordinal:7, deckIndex:7, faceValue:8 },
		       {rank: '9', suit:'S', ordinal:8, deckIndex:8, faceValue:9 },
		       {rank: '10', suit:'S', ordinal:9, deckIndex:9, faceValue:10 },
		       {rank: 'J', suit:'S', ordinal:10, deckIndex:10, faceValue:10 },
		       {rank: 'Q', suit:'S', ordinal:11, deckIndex:11, faceValue:10 },
		       {rank: 'K', suit:'S', ordinal:12, deckIndex:12 , faceValue:10 }];
      
   
   if (this.cards.length == 5) {
      numCards = this.cards.length;
      theseCards = []; l = 0;
            
      for (i=0; i < numCards; i++) {
	 theseCards[i] = new cribCheck();
	 var cardArr = thisJSON.evalJSON();
	 for (m=0; m < cardArr.length; m++) {
	    theseCards[i].deck.cards[m] = cardArr[m];
	 }
	 theseCards[i].pulledCard.addCard(theseCards[i].deck.cards.splice(i,1)[0]);
      }
      
      if (gameLevel > 1) {
	 for (lm = 0; lm < theseCards.length; lm++) {
	    // average over all possible ranks for the cut card
	    for (mc=0; mc < cuttingCards.length; mc++) {
	       var y = cuttingCards[mc];
	       currCut = new Card(y.rank, y.suit, y.ordinal, y.deckIndex, y.faceValue);
	       currCut.isCut = 1;
	       theseCards[lm].avgScore += theseCards[lm].deck.cribScore(currCut).totalScore();
	    }
	    theseCards[lm].avgScore /= cuttingCards.length;
	 }
      } else {
	 for (lm = 0; lm < theseCards.length; lm++) {
	    theseCards[lm].avgScore = theseCards[lm].deck.cribScore().totalScore();
	 }
      }
      
      theseCards.sort(sortByScore);
      // Add code here to optimize the hand (e.g., pick the better of multiple hands that have
      // the same high score).
      sentSet = -1;
      // eliminate all the zero-scoring combinations. we don't want them!
      for (ri=theseCards.length-1; ri >= 0 ; ri--) {
	 if (theseCards[ri].avgScore == 0) {
	    theseCards.splice(ri,1);
	 }
      }
      if (theseCards.length == 1) { // only one? send it!
	 sentSet = 0;
      } else if (gameLevel != 0 && theseCards.length > 1) {
	 if (theseCards[0].avgScore - theseCards[1].avgScore > 3){
	    sentSet = 0; // take the high score
	 } else { // compare and rank potential hands of the same score range
	    // add something to look at the crib cards: don't want to 
	    // put pairs of cards, addups to 15s, or 5s into the crib 
	    // if it's not our turn.
	    var optCard = 0, counter = 0; 
	    for (mi = 0; mi < theseCards.length; mi++) {
	       thisSet = mi;
	       theseCards[thisSet].rank = theseCards[thisSet].avgScore;
	       
	       if (gameLevel < 0 || gameLevel > 1) {
		  cO0 = theseCards[thisSet].pulledCard.cards[0].ordinal;
		  if (dealer == 'computer') {
		     theseCards[thisSet].rank += discard5[cO0];
		  } else {
		     theseCards[thisSet].rank -= discard5[cO0];
		  }
	       }
	    }
	    theseCards.sort(sortSetByRank);
	    sentSet = 0; // Math.floor(Math.random()*(sameScoreSet.length));
	 }
      } else if (gameLevel == 0 && theseCards.length > 1) {
	 sentSet = Math.floor(Math.random()*(theseCards.length));
      }
      
      if (theseCards.length == 0 || sentSet == -1) { // whoops! got rid of them all! must be a poor hand...
	 cardArr = thisJSON.evalJSON();
	 theseCards = new cribCheck();
	 tmpArr = [];
	 // REWORK! Could return same card twice. ;)~
	 for (oi = 0; oi < cardArr.length; oi++) {
	    tmpArr.push(oi);
	 }
	 junkNum = tmpArr.splice(Math.floor(Math.random()*(tmpArr.length)),1);
	 theseCards.pulledCard.addCard(cardArr[junkNum]);
	 return theseCards.pulledCard;
      }

      // return the two pulled cards
      return theseCards[sentSet].pulledCard;
   } else  {
      return null;
   }
}



function cribCheck() {
   this.deck = new Deck();
   this.pulledCard = new Deck();
   this.avgScore = 0;
   this.rank = 0;
}

function sortByScore(a,b) {
   return b.avgScore - a.avgScore;
}

function sortSetByRank(a,b) {
   return b.rank - a.rank;
}

function shuffleSort(a,b) {
   return b.rSort - a.rSort;
}

