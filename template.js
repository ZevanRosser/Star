window.Template = function(html, data) {
  var div = document.createElement('div');
  
  this.isVar = /\s?^\*+/;
  this.isCollection = /^data--/;
  
  div.innerHTML = html;
  
  this.traverse(div, data);
  
  this.el = div;
};


Template.prototype = {
  constructor : Template,
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

