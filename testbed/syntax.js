var Model = Star.Model.extend({
  
  data : {
    title : 'Some Title',
    subTitle : 'sub title' 
  },
  
  init : function() {
    console.log('init');
  }
  
});

var View = Star.View.extend({
  
  template : document.getElementById('tmpl').innerHTML,
  
  init : function() {
    
  }
  
});

var model = new Model();

var view = new View({
  model : model
});

document.body.appendChild(view);