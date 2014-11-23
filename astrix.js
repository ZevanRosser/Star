(function() {
  
  window.Star = window.S = {};
  
  var extend = function() {};
  
  S.View = function() {};
  S.View.extend = extend;
  S.View.prototype = {
    constructor : S.View
  };
  
  S.Variable = function(){};
  S.Collection = function(){};
  
  S.Model = function() {};
  S.Model.extend = extend;
  S.Model.prototype = {
    constructor : S.Model
  };
  S.Model.extend = extend;
  
})();