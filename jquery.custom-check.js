/*

Call the plugin with

    $('jquery-selector').customCheck({
        onCheck: function (checked) { },
        cls: ''
    });


    $('jquery-selector').customCheck({ onCheck: onCheck });

    function onCheck(checked) {
        console.log('on check', checked);
    }

options

    onCheck - The local callback for the onCheck event.  Passes whether the checkbox is checked or not.
    cls - Additional CSS class

functions

    $(selector).data('customCheck').check();
    $(selector).data('customCheck').uncheck();

By default the DOM element's class attribute is applied to the checkbox.

*/

(function ($) {
    $.customCheck = function (el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this,
            $el = $(el), // The original input
            $cb, // Our new checkbox element
            checked = 'checked',
            hov = 'hover';

        // Access to jQuery and DOM versions of element
        base.$el = $el;
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("customCheck", base);

        function init() {

            base.options = $.extend({}, $.customCheck.defaults, options);

            var cls = $el.attr('class') === undefined ? 'custom-check' : $el.attr('class'),
                id = $el.attr('id'),
                // Use text of label for title on span
                $label,
                // Unless the tab index is manually set, jQuery may not be able to
                // get it using the attr() method, so we'll check multiple places
                // and then make sure its at least a number
                ti = $el.attr('tabindex') || $el.get(0).tabIndex || 0;

            // Set id on input if it doesn't have one
            if (!id || id.length < 1) {
                id = $el
                        .attr('id', 'check_input_' + $.customCheck.uid++)
                        .attr('id');
            }

            // Create span node
            $cb = $el.before('<span id="cc_' + id + '" role="' + checked + '" aria-checked="' + ((isChecked()) ? 'true' : 'false') + '" aria-controls="' + id + '" />')
                    .parent()
                    .find('span#cc_' + id);

            $label = $('label[for="' + id + '"]');
            // Give it a title if it's got a label
            if ($label.length > 0) {
                $cb.attr('title', $label.text());
            }

            // Listen to any changes on the original checkbox
            $el
                .change(onCheckChange)
                // Hide the original input box
                .hide();

            $cb
                .addClass(cls + ' ' + base.options.cls + ' ' + (isChecked() ? checked : ''))
                // Attach handlers to the span
                .click(toggleCheck)
                .keypress(onKeyPress)
                // Add class to span on hover
                .hover(
                    function() {
                        $cb.addClass(hov);
                    },
                    function() {
                        $cb.removeClass(hov);
                    }
                )
                // Set the tabIndex to make span focusable and enable key controls
                // we use DOM property versus jQuery because some older browsers
                // won't let you set the tabindex using the manner jQuery does
                .get(0).tabIndex = ti;
        }

        function isChecked() {
            return $el.is(':' + checked);
        }

        function onCheckChange() {
            if (isChecked()) {
                $cb
                    .addClass(checked)
                    .attr({ 'aria-checked': 'true' });
            } else {
                $cb
                    .removeClass(checked)
                    .attr({ 'aria-checked': 'false' });
            }
            base.options.onCheck.apply($el, [isChecked()]);
        }

        function onKeyPress(e) {
            e.preventDefault();
            var k = (e.which) ? e.which : ((e.keyCode) ? e.keyCode : 0);
            // Trigger on space or enter keys
            if (k == 13 || k == 32) {
                $el.click();
            }
        }

        function toggleCheck(e) {
            e.preventDefault();
            $el.click();
        }

        base.check = function() {
            if (!isChecked()) {
                $el.click();
            }
        };

        base.uncheck = function() {
            if (isChecked()) {
                $el.click();
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
