var jsdom = require('jsdom');

exports.getNextTrip = function() {
  var args = Array.prototype.slice.call(arguments);
  
  var stop_id = args.shift() || '16126';
  var callback = args.pop() || function() {};
  var options = args.pop() || {};

  var defaults = {
    nexTripUrl: 'http://metrotransit.org/Mobile/Nextrip.aspx?stopnumber='+stop_id,
    containerId: 'ctl00_mainContent_NexTripControl1_UPanelNextripOuter'
  };
  
  options = this.combine(defaults, options);

  var theDom = jsdom.env(options.nexTripUrl,
    ['http://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js'],
    function(errors, window) {
      var routes = [], i = 0;

      var $panel = window.$('#'+options.containerId);

      var retObj = {
        stop_id: stop_id,
        next_departure: $panel.find('.countdown').text(),
      };

      var rows = $panel.find('.nextripDepartures .data');
      for(i=0; i < rows.length; i+=1){
        $r = window.$(rows[i]);
        routes.push({
          route_short_name: $r.find('.col1').text(),
          route_long_name: $r.find('.col2').text(),
          next_arrival: $r.find('.col3').text()
        });
      }

      retObj.routes = routes;
      callback(retObj);
    }
  );
};

/**
 * Take a number of objects and merge them into one.  In case of conflicts, the
 * attributes in the later objects will take precedence over the earlier ones.
 * This is useful for constructing a complete view context from several smaller
 * ones.
 */
exports.combine = function(/* context1, context2, ... */) {
    var combined_context = {},
        contexts = arguments,
        context_index,
        curr_context,
        key;
    
    for (context_index in contexts) {
        curr_context = contexts[context_index];
        for (key in curr_context) {
            combined_context[key] = curr_context[key];
        }
    }
    
    return combined_context;
}