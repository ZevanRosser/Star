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
      var path, temp, key;
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
            } else  {
              temp['$' + key] = function(val) {
                temp[key] = val;
                console.log('set', '"' + path + '"', '=', val);
              }; 
            }
            
          })(key, path);
          
        }
      }
      
      return temp;
    }
  };
  
})();