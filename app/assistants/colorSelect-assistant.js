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


function colorSelectAssistant(sceneAssistant, myGame, colorReturnFunction) {
   this.sceneAssistant = sceneAssistant;
   this.controller = sceneAssistant.controller;
   this.game = myGame;
   this.colorReturnFunction = colorReturnFunction;
}

colorSelectAssistant.prototype.setup = function() {
   // $('mCardC').setStyle({'float':'right'});
   
   this.rColor = this.randomColor();
   
   this.enterColorAttributes = {maxLength:7,
      changeOnKeyPress:true,
      multiline:false,
      hintText:this.rColor
   };
   this.enterColorModel = {value:this.rColor,disabled:false};
   this.controller.setupWidget("enterColor", this.enterColorAttributes, this.enterColorModel);
   
   $("enterColor").setStyle({'width':'120px','margin-left':'auto','margin-right':'auto'});

   this.submitColorModel = {label: $L("Colorize!"),buttonClass:"palm-button",disabled:false};
   this.controller.setupWidget("submitColor", {}, this.submitColorModel);
   
};

colorSelectAssistant.prototype.activate = function(event) {
   this.enterColorChangeHandler = this.enterColorChange.bind(this);
   this.submitColorHandler = this.submitColor.bind(this);
   
   Mojo.Event.listen(this.controller.get("enterColor"),Mojo.Event.propertyChange,this.enterColorChangeHandler);
   Mojo.Event.listen(this.controller.get("submitColor"),Mojo.Event.tap,this.submitColorHandler);
   
   $("colorSelectText").innerHTML = $L("Enter a 6-digit RGB hex color code (e.g., #ABC123).");
   
};

colorSelectAssistant.prototype.deactivate = function(event) {
   Mojo.Event.stopListening(this.controller.get("enterColor"),Mojo.Event.propertyChange,this.enterColorChangeHandler);
   Mojo.Event.stopListening(this.controller.get("submitColor"),Mojo.Event.tap,this.submitColorHandler);
};

colorSelectAssistant.prototype.cleanup = function(event) {
   Mojo.Event.stopListening(this.controller.get("enterColor"),Mojo.Event.propertyChange,this.enterColorChangeHandler);
   Mojo.Event.stopListening(this.controller.get("submitColor"),Mojo.Event.tap,this.submitColorHandler);
};

colorSelectAssistant.prototype.enterColorChange = function(event) {
   // regex for 3 or 6 char codes: /^#[0-9a-f]{3,6}$/i
   var strRegEx = /^#[0-9a-f]{6}$/i;
   
   if (strRegEx.test(event.value)) {
      $("colorSelectText").setStyle({'color':'green'});
   } else {
      $("colorSelectText").setStyle({'color':'red'});
   }
   this.rColor = event.value;
};

colorSelectAssistant.prototype.submitColor = function(event) {
   var strRegEx = /^#[0-9a-f]{6}$/i;
   // strRegEx.compile(strRegEx);
   
   if (strRegEx.test(this.rColor)) {
      this.colorReturnFunction(this.rColor);
   }
   
};

colorSelectAssistant.prototype.randomColor = function() {
   var fullColorElements = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
   var colorElements = [7,8,9,'A','B','C','D','E','F'];
   var colorStr = '#';
   
   for (ri=0; ri < 6; ri++) {
      colorStr += colorElements[Math.floor(Math.random() * colorElements.length)];
   }
   
   return colorStr;
}
