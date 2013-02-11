/*

Call the plugin with

$('jquery-selector').customCheck({
    onCheck: function (checked) { },
    cls: ''
});

onCheck - The local callback for the onCheck event.  Passes whether the checkbox is checked or not.
cls - Additional CSS class

By default the DOM element's class attribute is applied to the checkbox.

*/

(function ($) {
    $.customCheck = function (el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this,
            $el = $(el),
            $cb,
            checked = 'checked';

        // Access to jQuery and DOM versions of element
        base.$el = $el;
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("customCheck", base);

        function init() {
            
            base.options = $.extend({}, $.customCheck.defaults, options);
            
            var c = $el.is(':' + checked),
                id = $el.attr('id'),
                hov = 'hover',
                // Use text of label for title on span
                $label,
                // Unless the tab index is manually set, jQuery may not be able to
                // get it using the attr() method, so we'll check multiple places
                // and then make sure its at least a number
                ti = $el.attr('tabindex') || $el.get(0).tabIndex || 0;

            // Set id on input if it doesn't have one
            if (!id || id.length < 1) {
                id = $el.attr('id', 'check_input_' + $.customCheck.uid++).attr('id');
            }
            $label = $('label[for="' + id + '"]');
            // Create span node
            $cb = $el.before('<span id="cc_' + id + '" role="' + checked + '" aria-checked="' + ((c) ? 'true' : 'false') + '" aria-controls="' + id + '" />')
                    .parent()
                    .find('span#cc_' + id);

            if ($label.length > 0) {
                $cb.attr('title', $label.text());
            }

            $el
                // Attach handlers to the original input node to redirect to ours
                .click(function(e, triggered) {
                    // Avoid infinite loop & double checking
                    if (triggered === true) { return; }
                    onClick($el, $cb, base.options, true);
                })
                // Hide the original input box
                .hide();

            // IE doesn't fire click event on checkbox when label clicked
            $label.click(function(e) {
                $cb.click(); // does double duty in all but IE
                return false;
            });

            $cb
                .addClass($el.attr('class') + ' ' + base.options.cls + ' ' + ((c) ? checked : ''))
                // Make span look 'clickable'
                .css({ cursor: 'pointer' })
                // Attach handlers to the span
                .click(function(e) {
                    e.preventDefault();
                    onClick($el, $cb, base.options, false);
                })
                .keypress(function (e) {
                    e.preventDefault();
                    var k = (e.which) ? e.which : ((e.keyCode) ? e.keyCode : 0);
                    // Trigger on space or enter keys
                    if (k == 13 || k == 32) {
                        $(this).click();
                    }
                })
                // Add class to span on hover
                .hover(
                    function() {
                        $(this).addClass(hov);
                    },
                    function() {
                        $(this).removeClass(hov);
                    }
                )
                // Set the tabIndex to make span focusable and enable key controls
                // we use DOM property versus jQuery because some older browsers
                // won't let you set the tabindex using the manner jQuery does
                .get(0).tabIndex = ti;
        };

        function onClick(el, cb, o, inputClick) {
            // Determine if we need to check input box. i.e. if input is
            // checked and span has 'checked' class, need to flip it
            if (cb.hasClass(checked) === el.is(':' + checked) && !inputClick) {
                el.trigger('click', [true]).change();
            }
            // Now change the span attributes to complete the ruse
            var c = el.is(':' + checked);
            cb
                .toggleClass(checked)
                .attr({ 'aria-checked': '' + ((c) ? 'true' : 'false') });
            
            // Handle radio buttons
            if (el.is(':radio') && !inputClick) {
                $('input[name="'+el.attr('name')+'"]').not(el).each(function() {
                    $('#cc_'+this.id)
                        .removeClass(checked)
                        .attr({'aria-checked': 'false' });
                });
            }
            if (o) {
                // Timeout to allow for 'checking' to occur before callback
                setTimeout(function () {
                    o.onCheck.apply(el, [c]);
                }, 25);
            }
        }

        base.check = function() {
            if (!$cb.hasClass(checked)) {
                $el.attr(checked, checked);
                $cb
                    .addClass(checked)
                    .attr({ 'aria-checked': 'true' });
            }
        };

        base.uncheck = function() {
            if ($cb.hasClass(checked)) {
                $el.removeAttr(checked);
                $cb
                    .removeClass(checked)
                    .attr({ 'aria-checked': 'false' });
            }
        };

        // Run initializer
        init();
    };
    
    // Static properties
    $.customCheck.uid = 0;
    
    // Default settings
    $.customCheck.defaults = {
        onCheck: function () { },
        cls: ''
    };

    $.fn.customCheck = function (options) {
        return this.each(function () {
            (new $.customCheck(this, options));
        });
    };

})(jQuery);
