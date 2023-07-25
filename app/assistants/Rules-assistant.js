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


function RulesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

RulesAssistant.prototype.setup = function() {
   /* setup widgets here */
   this.RuleButtPressHandler = this.RuleButtPress.bindAsEventListener(this);
   for (i = 1; i < 6; i++) {
      this.controller.setupWidget("RuleDrawer"+i, { property:'myOpenProperty',unstyled: true }, { myOpenProperty:false });
      this.controller.setupWidget("RuleButton"+i, {}, {});
      // Mojo.Event.listen(this.controller.get("RuleButton"+i), Mojo.Event.tap, this.RuleButtPressHandler);
   }

   this.controller.setupWidget(Mojo.Menu.appMenu,
			       {omitDefaultItems: true},
			       StageAssistant.appMenuModel);
}

RulesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
   for (i = 1; i < 6; i++) {
      Mojo.Event.listen(this.controller.get("RuleButton"+i), Mojo.Event.tap, this.RuleButtPressHandler);
   }
}


RulesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
   for (i = 1; i < 6; i++) {
      Mojo.Event.stopListening(this.controller.get("RuleButton"+i), Mojo.Event.tap, this.RuleButtPressHandler);
   }
}

RulesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}

RulesAssistant.prototype.RuleButtPress = function(event){
   for ( i=1; i < 6; i++)
     {
	if (event.target.id == "RuleButton"+i)
	  {
	     // Mojo.Controller.errorDialog(event.target.id + "  RuleButton"+i);
	     this.button = this.controller.get("RuleButton"+i);
	     this.drawer = this.controller.get("RuleDrawer"+i);
	     break;
	  }
     }
   if (this.button.hasClassName('palm-arrow-closed')) {
      this.button.addClassName('palm-arrow-expanded');
      this.button.removeClassName('palm-arrow-closed');
   } else if (this.button.hasClassName('palm-arrow-expanded')) {
      this.button.addClassName('palm-arrow-closed');
      this.button.removeClassName('palm-arrow-expanded');
   }
   this.drawer.mojo.setOpenState(!this.drawer.mojo.getOpenState());
}


