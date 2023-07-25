var Board = Class.create({
   
   initialize: function() {
      this.pegBoard = new Element('canvas', {'id':'pegBoard','height':'50','width':'320','style':'position:absolute'});
      this.ctx = this.pegBoard.getContext('2d');
   },
   
   drawBoard: function() {
      ctx = this.ctx;
      var pitch = 9;
      var gap = 5;
      boardImg = new Image();
      boardImg.src = 'images/board_320x50.png';
      boardImg.onload = function() {
	 ctx.drawImage(boardImg,0,0);
	 Xpos = 9;
	 for (i=0; i < 31; i++) {
	    if ((i+4)%5 == 0) Xpos += gap;
	    this.drawPeg(Xpos,7,3.5,'#333333','black');
	    this.drawPeg(Xpos,17,3.5,'#333333','black');
	    this.drawPeg(Xpos,33,3.5,'#333333','black');
	    this.drawPeg(Xpos,43,3.5,'#333333','black');
	    Xpos += pitch;
	 }
      }.bind(this);
   },
      
   updateBoard: function(pegX,pegY,color1,color2) {
      ctx = this.ctx;
      this.drawPeg(pegX,pegY,3.5,color1,color2);
   },
   
   updateBoardToClear: function(pegXY) {
      ctx = this.ctx;
      this.unDrawPeg(pegXY[0],pegXY[1],5);
   },
   
   updateBoardSoon: function(peg,color,delay) {
      if (color == 'clear') {
	 setTimeout(function(thisObj) {thisObj.updateBoardToClear(peg);}, delay, this);
      } else {
	 setTimeout(function(thisObj) {thisObj.updateBoard(peg[0],peg[1],color[0],color[1]);}, delay, this);
      }
   },
   
   refreshBoard: function(player) {
      ctx = this.ctx;
      var pitch = 9;
      var gap = 5;
      Xpos = 18;
      switch (player) {
       case "computer":
	 for (i=1; i < 31; i++) {
	    if ((i+4)%5 == 0) Xpos += gap;
	    this.drawPeg(Xpos,7,3.5,'#333333','black');
	    this.drawPeg(Xpos,17,3.5,'#333333','black');
	    Xpos += pitch;
	 }
	 break;
       case "player":
	 for (i=1; i < 31; i++) {
	    if ((i+4)%5 == 0) Xpos += gap;
	    this.drawPeg(Xpos,33,3.5,'#333333','black');
	    this.drawPeg(Xpos,43,3.5,'#333333','black');
	    Xpos += pitch;
	 }
	 break;
      }
   },
   
   drawHole: function(x_center,y_center,rad) {
      ctx = this.ctx;
      ctx.fillStyle = '#333333';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x_center,y_center,rad,0,Math.PI*2,1);
      ctx.fill();
      ctx.stroke();
   },
   
   reDrawPeg: function(peg,color) {
      this.drawPeg(peg[0],peg[1],3.5,color[0],color[1]);      
   },
   
   drawPeg: function(x_center,y_center,rad,color1,color2) {
      ctx = this.ctx;
      ctx.fillStyle = color1;
      ctx.strokeStyle = color2;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x_center,y_center,rad,0,Math.PI*2,1);
      ctx.fill();
      ctx.stroke();
   },

   unDrawPeg: function(x_center,y_center,rad) {
      ctx = this.ctx;
      ctx.clearRect(x_center-rad,y_center-rad,2*rad,2*rad);
   }

});
