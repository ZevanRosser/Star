(function() {
  
  window.Star = {};
  
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
  Star.extend = function(obj) {
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
  
  // from underscore
  var has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };
  
  // from backbone
  var extend = function(protoProps, staticProps) {
    var parent = this,
        child, 
        Surrogate;
    
    if (protoProps && has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }
    
    Star.extend(child, parent, staticProps);
    
    Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
    
    if (protoProps) Star.extend(child.prototype, protoProps);
    
    child.prototype.sup = parent.prototype
      
      return child;
  };
  
  Star.Events = function() {};
  
  Star.Events.prototype = {
    constructor : Star.Events,
    _makeListeners: function() {
      this._listeners = this._listeners || [];
    },
    
    trigger: function(type, data) {
      this._makeListeners();
      var leng = this._listeners.length;
      for (var i = 0; i < leng; i++) {
        var listener = this._listeners[i];
        if (listener === undefined) continue;
          if (listener.type === type) {
            listener.callback.call(listener.ctx || this, data);
          }
      }
      return this;
    },
    
    on: function(type, callback, ctx) {
      this._makeListeners();
      this._listeners.push({
        type: type,
        callback: callback,
        ctx: ctx
      });
      return this;
    },
    
    off: function(type, callback) {
      this._makeListeners();
      for (var i = 0; i < this._listeners.length; i++) {
        var listener = this._listeners[i];
        if (listener === undefined) continue;
          
          if (listener.type === type && 
              (listener.callback === callback || 
               callback === undefined)) {
            this._listeners.splice(i, 1);
          }
      }
      return this;
    },
    allOff: function() {
      this._listeners = [];
      return this;
    }
  };
  
  
  Star.View = function(attrs) {
    
    attrs = attrs || {};   
    Star.extend(this, attrs);
    
    var div = document.createElement('div');
    
    this.isVar = /\s?^\*+/;
    this.isCollection = /^data--/;
    
    div.innerHTML = this.template;
    
    this.traverse(div, this.model.data || this.model);
    
    this.el = div;
    
    this.init.apply(this, arguments);
  };
  
  Star.View.extend = extend;
  
  Star.View.prototype = {
    constructor : Star.View,
    
    init : function() {},
    
    appendToCollection : function(node, tempEl, scope){
      var collectionItem = document.createElement('div');
      collectionItem.innerHTML = tempEl.innerHTML;
      
      this.traverse(collectionItem, scope);
      
      while(collectionItem.childNodes.length) {
        node.appendChild(collectionItem.childNodes[0]);
      }
    },
    
    prependToCollection : function(node, tempEl, scope){
      var collectionItem = document.createElement('div');
      collectionItem.innerHTML = tempEl.innerHTML;
      
      this.traverse(collectionItem, scope);
      
      while(collectionItem.childNodes.length) { 
        node.insertBefore(collectionItem.childNodes[0], node.firstChild);
      }
    },
    
    resolveVar : function(path, ctx, node, type){
      var curr;
      if (path === '*'){
        return ctx;
      }else{ 
        path = path.replace(this.isVar,'').split('.');
        curr = ctx;
        
        for (var i = 0; i < path.length; i++){
          if (i === path.length - 1){
            var obj = curr['$' + path[i]];
            if (obj) {
              obj.$bindsTo.push({node : node, type : type});
            }
          }
          curr = curr[path[i]];
        }
        
        if (curr) {
          return curr;
        } else {
          return false;
        }
      }
    },
    
    traverse : function(parent, scope){
      var i, j, k, 
          attr, 
          val, 
          varValue, 
          node, 
          tempEl,   
          collection, 
          collectionItem;
      
      if (parent.attributes) {
        for (i = 0; i < parent.attributes.length; i++){
          attr = parent.attributes[i];
          if (attr.value.match(this.isVar)){ 
            val = this.resolveVar(attr.value, scope, parent, attr.name); 
            if (val === false || val === ''){
              parent.attributes.removeNamedItem(attr.name);
            } else {
              parent.setAttribute(attr.name, val); 
            }
          }
        }
      }
      
      if (!parent.innerHTML) { return; }
      
      if (parent.innerHTML.match(this.isVar)){
        varValue = this.resolveVar(parent.innerHTML, scope, parent, 'html');
        if (varValue){
          parent.innerHTML = varValue; 
        } 
        return;
          }
      
      for (i = 0; i < parent.childNodes.length; i++){
        node = parent.childNodes[i];
        
        if (node.attributes){
          for(j = 0; j < node.attributes.length; j++){
            attr = node.attributes[j];
            if (attr.name.match(this.isCollection)){
              
              tempEl = document.createElement('div');
              tempEl.innerHTML = node.innerHTML;
              
              collection = scope[attr.value];
              
              if (collection){ 
                
                node.innerHTML = "";
                collection.$tmpl = tempEl; 
                collection.$addParent(node);
                collection._add = this.appendToCollection.bind(this);
                collection._prep = this.prependToCollection.bind(this);
                
                for (var k = 0; k < collection.length; k++){
                  this.appendToCollection(node, tempEl, collection[k]);
                }
                
              }  
            }
          } 
          
        }
        
        if (node.childNodes.length > 0) {  
          if (node.nodeType === 3){ continue; }
          this.traverse(node, scope);
        } else {
          this.traverse(node, scope);
        }
        
      }
    }
  };
  
  Star.Model = function(attrs){
    attrs = attrs || {};
    var data = attrs.data || this.data || {};
    this.data = new Star.Object(data);
    delete attrs.data;
    Star.extend(this, attrs);
    this.init.apply(this, arguments);
  };
  
  Star.Model.extend = extend;
  
  Star.Object = function(data) {
    return this.process(data);
  };
  
  Star.Object.prototype = {
    
    constructor : Star.Object,
    
    init : function() {},
    
    process : function(obj, keyPath) {
      var i, j, path, 
          temp,
          key, 
          setter, 
          self, 
          bindsTo, 
          boundData,
          array,
          collection;
      
      keyPath = keyPath ? keyPath + '.' : '';
      
      if(obj === null || typeof(obj) !== 'object') return obj;
      
      temp = obj.constructor(); 
      
      for(key in obj) {
        if(obj.hasOwnProperty(key)) {
          path = keyPath + key;
          temp[key] = this.process(obj[key], path);
          
          (function(key, path, ts) {
            
            if (Array.isArray(temp[key])){
              
              collection = temp[key];
              
              collection.$addParent = function(parent){
                temp[key].$parents.push(parent);
              };
              
              collection.$parents = [];
              
              collection.$remove = function(index, num) {
                var els, el, boundTo, node;
                self = temp[key];
                els = self.splice(index, 1 || num);
                for (i = 0; i < els.length; i++){
                  el = els[i];
                  for ($prop in el){
                    boundTo = el[$prop].$bindsTo;
                    if (boundTo) {
                      for (j = 0; j < boundTo.length; j++){
                        node = boundTo[j].node;
                        if (node.parentNode){
                          node.parentNode.removeChild(node); 
                        }
                      }
                    }
                  }
                }
                return els;
              };
              
              collection.$push = function(val) {
                self = temp[key];
                val = ts.process(val, path);
                self.push(val);
                
                var leng = self.$parents.length;
                for (i = 0; i < leng; i++){
                  self._add(self.$parents[i], self.$tmpl, val);
                }
              };
              
              collection.$unshift = function(val) {
                self = temp[key];
                val = ts.process(val, path);
                self.unshift(val);
                
                var leng = self.$parents.length;
                for (i = 0; i < leng; i++){
                  self._prep(self.$parents[i], self.$tmpl, val);
                }
              };
              
            } else {
              
              setter = temp['$' + key] = function(val, silent) {
                self = temp['$' + key];
                temp[key] = val;
                bindsTo = self.$bindsTo;
                
                for (i = 0; i < bindsTo.length; i++){ 
                  boundData = bindsTo[i];
                  if (boundData.type === 'html'){
                    boundData.node.innerHTML = val; 
                  } else {
                    if (val || val === 0) {
                      boundData.node.setAttribute(boundData.type, val);
                    } else { 
                      boundData.node.attributes.removeNamedItem(boundData.type);
                    }
                  }
                }
                
              }; 
              setter.$delete = function() {
                self = temp['$' + key];
                
                bindsTo = self.$bindsTo;
                for (i = 0; i < bindsTo.length; i++){ 
                  var node = bindsTo[i].node;
                  
                  if (node.parentNode){
                    node.parentNode.removeChild(node);
                  }
                }
                delete temp[key];
                delete temp['$' + key];
              };
              setter.$bindsTo = [];
            }
            
          })(key, path, this);
          
        }
      }
      
      return temp;
    }
  };
  
})();