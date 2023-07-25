function berfinv(num) {
   // Erf^(-1) is defined as a Maclaurin series 
   var phigh = 1 - 0.02425;
   var erfscale = 0.582007188123;
   var sum = 0.0;
   if (Math.abs(num) <= phigh) {
      var ck = [1.0,1.0];
      var cks;
      for (k = 2; k < 31; k++) {
	 cks = 0.0;
	 for (m=0; m < k; m++){
	    cks += parseFloat(ck[m]*ck[k-1-m]/((parseFloat(m)+1)*(2*parseFloat(m)+1)));
	 }
	 ck.push(cks);
      }
      for (k = 0; k < 30; k++) {
	 sum += ck[k]/(2.*parseFloat(k)+1)*Math.pow(0.5*Math.sqrt(Math.PI)*num,(2*k+1))
      }
   } else if (num > phigh) {
      sum = erfscale*Math.sqrt(-2*Math.log(1-num));
   } else if (num < -phigh) {
      sum = -erfscale*Math.sqrt(-2*Math.log(1+num));
   } else {
      sum = 1.0;
   }
   return sum;
}

function cumProb(curve) {
   var prob_dens = [];
   numpts = curve.length;
   var avg = (numpts+1)/2.;
   curve.sort(sortByVal);
   for (cdfi=0; cdfi < numpts; cdfi++){
      valCD = -2.0*(avg-(cdfi+1))/numpts;
      if ((valCD < 1.0) && (valCD > -1.0)) {
	 valCDpoint = [curve[cdfi],1.414*berfinv(valCD)];
	 prob_dens.push(valCDpoint);
      } else {
	 Mojo.Log.error("Bad point!");
      }
   }
   
   return prob_dens;
}

function sortByVal(a,b) {
   return a - b;
}
