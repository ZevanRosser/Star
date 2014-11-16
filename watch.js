(function() {
  
  if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
  
  window.Watch = function(data) {
    this.data = this.process(data);
  };
  
  Watch.prototype = {
    constructor : Watch,
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