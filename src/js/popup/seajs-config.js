seajs.config({
  base: '../js/lib/sea-modules',
  alias: {
    'jQuery': 'jquery/jquery/2.1.0/jquery-debug.js',
    'Handlebars': 'gallery/handlebars/1.0.2/handlebars-debug.js',
    'Backbone': 'gallery/handlebars/1.1.2/backbone-debug.js'
  }
});

seajs.use('../js/popup');