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


function manScoreAssistant(sceneAssistant, myGame, scoreReturnFunction) {
   this.sceneAssistant = sceneAssistant;
   this.controller = sceneAssistant.controller;
   this.game = myGame;
   this.scoreReturnFunction = scoreReturnFunction;
}

manScoreAssistant.prototype.setup = function() {
   // $('mCardC').setStyle({'float':'right'});
   
   this.mScore = 8;
   
   this.pickScoreAttributes = {
	min: 0,
	max: 29,
	modelProperty: 'mScore'
   };
   this.pickScoreModel = {
      mScore: this.mScore
   };
   this.controller.setupWidget("pickScore", this.pickScoreAttributes, this.pickScoreModel);

   this.submitScoreModel = {label: $L("Submit score"),buttonClass:"palm-button",disabled:false};
   this.controller.setupWidget("submitScore", {}, this.submitScoreModel);
   
};

manScoreAssistant.prototype.aboutToActivate = function(event) {
   $("enterScore").innerHTML = $L("Enter score");
   
};

manScoreAssistant.prototype.activate = function(event) {
   this.pickScoreChangeHandler = this.pickScoreChange.bind(this);
   this.submitScoreHandler = this.submitScore.bind(this);
   
   Mojo.Event.listen(this.controller.get("pickScore"),Mojo.Event.propertyChange,this.pickScoreChangeHandler);
   Mojo.Event.listen(this.controller.get("submitScore"),Mojo.Event.tap,this.submitScoreHandler);
   
   $("enterScore").innerHTML = $L("Enter score");
   
   if (this.game.stage == 'crib'){
      this.showCribCards();
   } else {
      this.showHandCards();
   }
};

manScoreAssistant.prototype.deactivate = function(event) {
   Mojo.Event.stopListening(this.controller.get("pickScore"),Mojo.Event.propertyChange,this.pickScoreChangeHandler);
   Mojo.Event.stopListening(this.controller.get("submitScore"),Mojo.Event.tap,this.submitScoreHandler);
};

manScoreAssistant.prototype.cleanup = function(event) {
   Mojo.Event.stopListening(this.controller.get("pickScore"),Mojo.Event.propertyChange,this.pickScoreChangeHandler);
   Mojo.Event.stopListening(this.controller.get("submitScore"),Mojo.Event.tap,this.submitScoreHandler);
};

manScoreAssistant.prototype.pickScoreChange = function(event) {
   this.mScore = event.value;
   if (this.mScore == 19
       || this.mScore == 25
       || this.mScore == 26
       || this.mScore == 27) {
      this.mScore == 0;
      this.pickScoreModel.mScore = this.mScore;
      this.controller.modelChanged(this.pickScoreModel);
   }
};

manScoreAssistant.prototype.submitScore = function(event) {
   this.scoreReturnFunction(this.mScore);
};

manScoreAssistant.prototype.showCribCards = function() {
   for (i=0; i< this.game.crib.cardCount(); i++) {
      thisCard = this.game.crib.cards[i].canvasNode('Pcard'+i);
      $('mCard'+i).appendChild(thisCard);
   }
   thisCard = this.game.cut.cards[0].canvasNode('PcardC');
   $('mCardC').appendChild(thisCard);
};

manScoreAssistant.prototype.showHandCards = function() {
   for (i=0; i< this.game.handP.cardCount(); i++) {
      thisCard = this.game.handP.cards[i].canvasNode('Pcard'+i);
      $('mCard'+i).appendChild(thisCard);
   }
   thisCard = this.game.cut.cards[0].canvasNode('PcardC');
   $('mCardC').appendChild(thisCard);
};

