;(function($) {

    $.fn.customCheck = function(o) {
        var n = this;
        if (n.length < 1) { return n; }

        // Set up options (and defaults)
        o = (o)?o:{};
        o = auditOptions(o);

        n.each(function() {
            var i = $(this);
            if (i.is(':checkbox') || i.is(':radio')) {
                setup(i, o);
            }
        });

        return n;
    };

    var setup = function(n, o) {
        var checked = 'checked', c = n.is(':' + checked),

        // set id on input if it doesn't have one
        id = n.attr('id');
        if (!id || id.length < 1) {
            id = n.attr('id', 'check_input_' + $.fn.customCheck.uid++).attr('id');
        }

        // we will use text of label for title on span
        var l = $('label[for="' + id + '"]');

        // Create span node
        var im = n.before("<span id='cc_" + id + "' title='" + l.text() + "' class='custom-check" + ((c)?' ' + checked : '') + "' role='" + checked + "' aria-checked='" + ((c) ? 'true' : 'false')+"' aria-controls='" + id + "' />")
                .parent()
                  .find('span#cc_' + id);

        n
        // attach handlers to the original input node to redirect to ours
        .click(function(e, triggered) {
            // Avoid infinite loop & double checking
            if (triggered === true) { return; }
            onClick(n, im, o, true);
        })
        // Hide the original input box
        .hide();

        // IE doesn't fire click event on checkbox when label clicked
        l.click(function(e) {
            im.click(); // does double duty in all but IE
            return false;
        });
        var klass = 'hover',
        // Unless the tab index is manually set, jQuery may not be able to 
        // get it using the attr() method, so we'll check multiple places
        // and then make sure its at least a number
        ti = n.attr('tabindex') || n.get(0).tabIndex || 0;

        im
        // make span look 'clickable'
        .css({cursor: 'pointer'})
        // attach handlers to the span
        .click(function(e) {
            e.preventDefault();
            onClick(n, im, o, false);
        })
        .keypress(function(e) {
            var k = (e.which) ? e.which : ((e.keyCode) ? e.keyCode : 0);
            // trigger on space or enter keys
            if (k == 13 || k == 32) {
                $(this).click();
            }
        })
        // add class to span on hover
        .hover(
            function() {
                $(this).addClass(klass);
            },
            function() {
                $(this).removeClass(klass);
            }
        )
        // set the tabIndex to make span focusable and enable key controls
        // we use DOM property versus jQuery because some older browsers
        // won't let you set the tabindex using the manner jQuery does
        .get(0).tabIndex = ti;
    }

    var onClick = function(n, im, o, inputClick) {
      // determine if we need to check input box. i.e. if input is 
      // checked and span has 'checked' class, need to flip it
      var checked = 'checked';
      if (im.hasClass(checked) === n.is(':' + checked) && !inputClick) {
          n.trigger('click', [true]).change();
      }
      // Now change the span attributes to complete the ruse
      var c = n.is(':' + checked);
      im
          .toggleClass(checked)
          .attr({
              'aria-checked': ''+((c)?'true':'false')
          });
      
      // Handle radio buttons
      if (n.is(':radio') && !inputClick) {
        $('input[name="'+n.attr('name')+'"]').not(n).each(function() {
          $('#cc_'+this.id)
              .removeClass(checked)
              .attr({'aria-checked': 'false' });
        });
      }
      
      // Timeout to allow for 'checking' to occur before callback
      setTimeout(function() {  
          o.onCheck.apply(n, [c]);
      }, 25);
    }

    // Defined outside customCheck to allow for usage during construction
    var auditOptions = function(o) {
        if (!$.isFunction(o.onCheck)) { o.onCheck = function() {}; }
        return o;
    }

    // Static properties
    $.fn.customCheck.uid = 0;
})(jQuery);
