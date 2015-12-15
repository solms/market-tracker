var url = require('url');
module.exports = function(db){
  var stocks = db.collection('stocks');

  this.getStocks = function(req, res){
    stocks.find().toArray(function(err, data){
      if(err){
        console.log('ERROR: ' + err);
      }
      res.json(data);
    });
  };

  this.addStock = function(req, res){
    stocks.insert({
      'code': req.query.code
    });
    res.send('Added stock with code "' + req.query.code + '" to the database.');
  };

  this.removeStock = function(req, res){
    stocks.remove({
      'code': req.query.code
    });
    res.send('Removed ' + JSON.stringify(req.query.code));
  };
}
