var pribDataStorage = Class.create({
   
   dbVersion: 1,
   
   initialize: function() {
      this.db = openDatabase("Pribbage", 1);
   },
   
   checkDB: function(callback){
      var SQL = "SELECT * FROM 'meta'";
      this.callback = callback;
      this.dbTransact(SQL, [], this.checkDBReturn.bind(this), this.checkError.bind(this));
   },
   
   checkDBReturn: function(transaction, response){
      if (response.rows.length == 0) {
	 this.DBstate = 'start';
	 this.setupDB();
	 return;
      } else {
	 this.DBisSetup = 1;
	 this.DBstate = 'stats';
	 this.setupDB();
	 return;
      }
      this.callback();
   },
   
   checkError: function(){
      this.DBstate = 'start';
      this.setupDB();
   },
   
   setupDB: function(transaction, response) {
      var dbSQL = "CREATE TABLE IF NOT EXISTS 'meta' (version INTEGER, plays INTEGER)";
      var gameSQL = "CREATE TABLE IF NOT EXISTS 'game' (name TEXT, data TEXT)";
      var winsSQL = "CREATE TABLE IF NOT EXISTS 'wins' (playdate TEXT, name TEXT, data TEXT)";
      var handsSQL = "CREATE TABLE IF NOT EXISTS 'hands' (playdate TEXT, name TEXT, dealer TEXT, cards TEXT, score INTEGER)";
      var statsSQL = "CREATE TABLE IF NOT EXISTS 'stats' (name TEXT, data TEXT)";
      var verSQL = "INSERT INTO 'meta' (version, plays) VALUES (?,?)";
      var defaultHandSQL = "INSERT INTO 'hands' (playdate, name, dealer, cards, score) VALUES (?,?,?,?,?)";
      
      switch(this.DBstate) {
       case 'start':
	 this.DBstate = 'game';
	 this.dbTransact(dbSQL, [], this.setupDB.bind(this), this.DBError.bind(this));
	 break;
       case 'game':
	 this.DBstate = 'wins';
	 this.dbTransact(gameSQL, [], this.setupDB.bind(this), this.DBError.bind(this));
	 break;
       case 'wins':
	 this.DBstate = 'hands';
	 this.dbTransact(winsSQL, [], this.setupDB.bind(this), this.DBError.bind(this));
	 break;
       case 'hands':
	 this.DBstate = 'stats';
	 this.dbTransact(handsSQL, [], this.setupDB.bind(this), this.DBError.bind(this));
	 break;
       case 'stats':
	 // Mojo.Log.info('setting up ', this.DBstate);
	 if (this.DBisSetup) {
	    this.DBstate = 'loading-version';
	 } else {
	    this.DBstate = 'loading-game';
	 }
	 this.dbTransact(statsSQL, [], this.setupDB.bind(this), this.DBError.bind(this));
	 break;
       case 'loading-game':
	 this.DBstate = 'loading-hand';
	 this.dbTransact(verSQL, [this.dbVersion, 0], this.setupDB.bind(this), this.DBError.bind(this));
	 break;
       case 'loading-hand': // sample hand to populate DB
	 playdate = 1265662738418, name = 'bert', dealer = 'bert', score = 20;
	 cards =  [{rank: "5", suit: "H", ordinal: 4, deckIndex: 17, faceValue: 5, isCut: 0, isPlayed: 1, isSelected: 0}, 
		   {rank: "10", suit: "H", ordinal: 9, deckIndex: 22, faceValue: 10, isCut: 0, isPlayed: 1, isSelected: 0}, 
		   {rank: "J", suit: "H", ordinal: 10, deckIndex: 23, faceValue: 10, isCut: 0, isPlayed: 1, isSelected: 0}, 
		   {rank: "Q", suit: "H", ordinal: 11, deckIndex: 24, faceValue: 10, isCut: 0, isPlayed: 1, isSelected: 0}, 
		   {rank: "J", suit: "S", ordinal: 10, deckIndex: 10, faceValue: 10, isCut: 1, isPlayed: 0, isSelected: 0}
		   ];
	 this.DBstate = 'loading-version';
	 this.dbTransact(defaultHandSQL, [playdate, name, dealer, Object.toJSON(cards), score], this.setupDB.bind(this), this.DBError.bind(this));
	 break;
       case 'loading-version':
	 this.callback();
	 break;
      }
   },

   DBError: function(transaction, error) {
      Mojo.Log.error("DB error: %j", error);
   },
   
   dbTransact: function(SQL, SQLargs, successFunc, failedFunc) {
      // Mojo.Log.info(SQL);
      this.db.transaction(function(transaction) {
	 transaction.executeSql(SQL, SQLargs, successFunc.bind(this), failedFunc.bind(this));
      }.bind(this));
   },
   
   getBackup: function(callback){
      this.callback = callback;
      var SQL = "SELECT sql FROM sqlite_master WHERE type='table' AND tbl_name NOT LIKE 'sqlite%' AND tbl_name NOT LIKE '%WebKit%';";
      // var SQL = "SELECT * FROM 'stats'";
      this.dbTransact(SQL, [], this.getTableNames.bind(this), this.errorBackup.bind(this));
   },
   
   getTableNames: function(transaction, response) {
      if (response.rows.length > 0){
	 this.DBBackupData = [];
	 this.DBBackupTables = ['stats','hands','wins'];
	 for (i=0; i < response.rows.length; i++) {
	    this.DBBackupData.push(response.rows.item(i).sql);
	 }
	 this.table = this.DBBackupTables.pop();
	 var SQL = "SELECT * FROM '"+this.table+"'";
	 this.dbTransact(SQL, [], this.getTables.bind(this), this.errorBackup.bind(this));
      } else {
	 this.callback([]);
      }
   },
   
   getTables: function(transaction, response) {
      if (response.rows.length > 0){
	 for (i=0; i < response.rows.length; i++) {
	    this.DBBackupData.push(Object.toJSON([this.table,response.rows.item(i)]));
	 }
      }
      if (this.DBBackupTables.length) {
	 this.table = this.DBBackupTables.pop();
	 var SQL = "SELECT * FROM '"+this.table+"'";
	 this.dbTransact(SQL, [], this.getTables.bind(this), this.errorBackup.bind(this));	 
      } else {
	 this.gotBackup();
      }
   },
   
   gotBackup: function() {
      if (this.DBBackupData.length > 0){
	 this.callback(this.DBBackupData);
      } else {
	 this.callback([]);
      }
   },
	
   errorBackup: function(transaction, error){
      Mojo.Log.info("DB backup err: %j",error);
      this.callback([]);
   },
   
   getSavedGame: function(callback){
      this.callback = callback;
      var SQL = "SELECT * FROM 'game'";
      this.dbTransact(SQL, [], this.gotSavedGame.bind(this), this.errorSavedGame.bind(this));
   },
	
   gotSavedGame: function(transaction, response){
      if (response.rows.length > 0){
	 this.callback(response.rows);
      } else {
	 this.callback([]);
      }
   },
	
   errorSavedGame: function(transaction, error){
      this.callback([]);
   },
   
   clearGameData: function(callback){
      var SQL = "DELETE FROM 'game'";
      this.dbTransact(SQL, [], callback, this.DBError.bind(this));
   },
   
   clearWinsData: function(callback){
      var SQL = "DELETE FROM 'wins'";
      this.dbTransact(SQL, [], callback, this.DBError.bind(this));
   },
   
   clearHandsData: function(callback){
      var SQL = "DELETE FROM 'hands' WHERE score < 25";
      this.dbTransact(SQL, [], callback, this.DBError.bind(this));
   },
   
   clearStatsData: function(callback){
      var SQL = "DELETE FROM 'stats'";
      this.dbTransact(SQL, [], callback, this.DBError.bind(this));
   },
   
   writeGameData: function(gameData, callback){
      this.callback = callback;
      this.gameData = gameData;
      var SQL = "DELETE FROM 'game'";
      this.dbTransact(SQL, [], this.writingGameData.bind(this), this.errorWriteGame.bind(this));
   },
   
   writingGameData: function(){
      var SQL = "INSERT INTO 'game' (name, data) VALUES (?,?)";
      var myData = this.gameData.pop();
      if(myData == null){
	 if (this.callback) {
	    this.callback(true);
	 }
	 return;				
      }
      else {
	 this.dbTransact(SQL, [myData.name, myData.data], this.writingGameData.bind(this), this.errorWriteGame.bind(this));
      }
   },
   
   errorWriteGame: function(transaction, error){
      Mojo.Log.error("DB error loading game: %j", error);
      if (this.callback) {
	 this.callback(false);
      }
   },
   
   getSavedWinsDates: function(callback){
      Mojo.Log.info('getSavedWinsDates');
      this.callback = callback;
      var SQL = "SELECT playdate FROM 'wins'";
      this.dbTransact(SQL, [], this.gotSavedWins.bind(this), this.errorSavedWins.bind(this));
   },
	
   getSavedWinsData: function(playdate,callback){
      Mojo.Log.info('getSavedWinsDates');
      this.callback = callback;
      var SQL = "SELECT name,data FROM 'wins' where playdate='"+playdate+"'";
      this.dbTransact(SQL, [], this.gotSavedWins.bind(this), this.errorSavedWins.bind(this));
   },
	
   getSavedWins: function(callback){
      Mojo.Log.info('getSavedWins');
      this.callback = callback;
      var SQL = "SELECT * FROM 'wins'";
      this.dbTransact(SQL, [], this.gotSavedWins.bind(this), this.errorSavedWins.bind(this));
   },
	
   getOneSavedWin: function(callback,playdate){
      Mojo.Log.info('getOneSavedWin');
      this.callback = callback;
      var SQL = "SELECT * FROM 'wins' where playdate='"+playdate+"'";
      this.dbTransact(SQL, [], this.gotSavedWins.bind(this), this.errorSavedWins.bind(this));
   },
	
   gotSavedWins: function(transaction, response){
      if (response.rows.length > 0){
	 this.callback(response.rows);
      } else {
	 this.callback([]);
      }
   },
	
   errorSavedWins: function(transaction, error){
      // Return nothing if error loading data.
      this.callback([]);
   },
   
   writeWinData: function(winData, callback){
      this.callback = callback;
      this.winData = winData;
      
      var SQL = "INSERT INTO 'wins' (playdate, name, data) VALUES (?,?,?)";
      var myData = this.winData.pop();
      if(myData == null){
	 if (this.callback) {
	    this.callback(true);
	 }
	 return;				
      } else {
	 this.dbTransact(SQL, [myData.time, myData.name, myData.data], 
			 this.writeWinData.bind(this,this.winData,this.callback), 
			 this.errorWriteWin.bind(this));
      }
   },
   
   errorWriteWin: function(transaction, error){
      Mojo.Log.error("DB error loading wins: %j", error);
      if (this.callback) {
	 this.callback(false);
      }
   },
   
   getSavedHands: function(callback){
      Mojo.Log.info('getSavedHands');
      this.callback = callback;
      var SQL = "SELECT * FROM 'hands' ORDER BY score,playdate";
      this.dbTransact(SQL, [], this.gotSavedHands.bind(this), this.errorSavedHands.bind(this));
   },
	
   gotSavedHands: function(transaction, response){
      if (response.rows.length > 0){
	 this.callback(response.rows);
      } else {
	 this.callback([]);
      }
   },
	
   errorSavedHands: function(transaction, error){
      this.callback([]);
   },
   
   writeHandData: function(handData, callback){
      this.callback = callback;
      this.handData = handData;
      
      var SQL = "INSERT INTO 'hands' (playdate, name, dealer, cards, score) VALUES (?,?,?,?,?)";
      var myData = this.handData.pop();
      if(myData == null){
	 if (this.callback) {
	    this.callback(true);
	 }
	 return;				
      } else {
	 this.dbTransact(SQL, [myData.time, myData.name, myData.dealer, myData.cards, myData.score], 
			 this.writeHandData.bind(this,this.handData,this.callback), 
			 this.errorWriteHand.bind(this));
      }
   },
   
   errorWriteHand: function(transaction, error){
      Mojo.Log.error("DB error loading \'hands\': %j", error);
      if (this.callback) {
	 this.callback(false);
      }
   },
   
   getStats: function(callback){
      // Mojo.Log.info('getStats');
      this.callback = callback;
      var SQL = "SELECT * FROM 'stats'";
      this.dbTransact(SQL, [], this.gotStats.bind(this), this.errorStats.bind(this));
   },
	
   gotStats: function(transaction, response){
      if (response.rows.length > 0){
	 this.callback(response.rows);
      } else {
	 this.callback([]);
      }
   },
	
   errorStats: function(transaction, error){
      // Return nothing if error loading data.
      Mojo.Log.error('Error loading stats.');
      this.callback([]);
   },
   
   writeStats: function(gameStats){
      this.gameStats = gameStats;
      // Mojo.Log.info('DS: %j', this.gameStats);
      var SQL = "DELETE FROM 'stats'";
      this.dbTransact(SQL, [], this.writingStats.bind(this), this.errorWriteStats.bind(this));
   },
   
   writingStats: function(){
      // Mojo.Log.info
      var SQL = "INSERT INTO 'stats' (name, data) VALUES (?,?)";
      var myData = this.gameStats.pop();
      if (myData == null){
	 return;				
      } else {
	 this.dbTransact(SQL, [myData.name, myData.data], 
			 this.writingStats.bind(this,this.gameStats), 
			 this.errorWriteStats.bind(this));
      }
   },
   
   errorWriteStats: function(transaction, error){
      Mojo.Log.error("DB error writing stats: %j", error);
   }
   
});
