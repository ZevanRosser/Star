(function() {
  
  window.Star = window.S = function(obj) {
    if (obj.template){
      return S.View.extend.apply(S.View, arguments); 
    } else if (obj.data) {
      return S.Model.extend.apply(S.Model, arguments); 
    } else {
      return S.O.extend.apply(S.O, arguments); 
    }
  }; 
  
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
  
  S.Collection = function(arr){
    this.length = 0;
    Array.prototype.push.apply(this, elems);
  };
  
  S.Collection.extend = extend;
  
  S.Collection.prototype = {
    constructor : S.Collection
    // ?
  };
  
  S.O = function() {
    this.init.apply(this, arguments);
  };
  
  S.O.extend = extend;
  
  S.O.prototype = {
    constructor : S.Model
  };
  
  
  S.Model = function() {
    this.init.apply(this, arguments);
    this.data = this.process(this.data);
  };
  
  S.Model.extend = extend;
  
  S.Model.prototype = {
    constructor : S.Model,
    process : function(obj, keyPath) {
      var i,
          path, 
          temp, 
          key, 
          setter,
          bindsTo,
          bound,
          self,
          leng;
      
      keyPath = keyPath ? keyPath + '.' : '';
      
      if(obj === null || typeof(obj) !== 'object') return obj;
      
      temp = obj.constructor(); 
      
      for(key in obj) {
        if(obj.hasOwnProperty(key)) {
          path = keyPath + key;
          temp[key] = this.process(obj[key], path);
          
          (function(key, path) {
            
            if (Array.isArray(temp[key])){
              // something else
              temp[key] = new S.Collection(temp[key]);
              
            } else  {
              setter = temp['$' + key] = function(val) {
                self = temp['$' + key];
                temp[key] = val;
                bindsTo = self.$bindsTo;
                leng = bindsTo.length;
                
                for (i = 0; i < leng; i++){
                  bound = bindsTo[i];
                  if (bound.type === 'html') {
                    bound.node.innerHTML = val;
                  } else {
                    var attr = bound.node.getAttribute(bound.type);
                    // props vs attributes problem
                    bound.node.setAttribute(bound.type, val);
                    bound.node[bound.type] = val;
                  }
                }
                
                //console.log('set', '"' + path + '"', '=', val);
              }; 
              setter.$bindsTo = [];
            }
            
          })(key, path);
          
        }
      }
      
      return temp;
    }
  };
  
  
  S.View = function() {
    this.init.apply(this, arguments);
  };
  
  S.View.extend = extend;
  
  S.View.prototype = {
    constructor : S.View
  };
  
  
})();