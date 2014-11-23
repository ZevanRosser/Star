(function() {
  
  if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
  
  // from lodash
  var isObject = function(value) {
    var type = typeof value;
    return type == 'function' || (value && type == 'object') || false;
  };
  
  // from underscore
  var has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };
  
  // from underscore
  S.extend = function(obj) {
    if (!isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
          obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };
  
  // adapted from backbone
  var extend = function(protoProps, staticProps) {
    var parent = this,
        child, 
        Surrogate;
    
    if (protoProps && has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }
    
    S.extend(child, parent, staticProps);
    
    Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
    
    if (protoProps) S.extend(child.prototype, protoProps);

    child.prototype.sup = parent.prototype;
    
    return child;
  };
  
  window.Star = window.S = function(obj) {
    if (obj.template){
      return Star.View.extend.apply(Star.View, arguments); 
    } else {
      return Star.Model.extend.apply(Star.Model, arguments); 
    } else {
      var O = function() {
        obj.init.apply(this, arguments); 
      };
      O.prototype = obj;
      O.constructor = O;
    }
  }; 
   
  S.Collection = function(){};
  
  S.Object = function() {};
  S.Model.extend = extend;
  S.Model.prototype = {
    constructor : S.Model
  };
  S.Model.extend = extend;
  
  S.Model = function() {};
  S.Model.extend = extend;
  S.Model.prototype = {
    constructor : S.Model
  };
  S.Model.extend = extend;
  
  S.View = function() {};
  S.View.extend = extend;
  S.View.prototype = {
    constructor : S.View
  };
  
  
})();