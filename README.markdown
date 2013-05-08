# Custom Check
A simple plugin for creating custom checkboxes.

Call the plugin with

    $('.jquery-selector').customCheck({ 
        onCheck: function (checked) { },
        cls: ''
    });

Optional Parameters 

onCheck - The local callback for the onCheck event.  Passes whether the checkbox is checked or not.
cls - Additional CSS class

By default the DOM element's class attribute is applied to the checkbox.


## Example

    <input type="checkbox" class="custom-check" />

    <script>
        (function($){
            function init(){
                $('.custom-check').customCheck({
                    onCheck: onCheck,
                    cls: 'my-check'
                });

                $('.custom-check').data('customCheck').check();
                $('.custom-check').data('customCheck').uncheck();
            }
            function onCheck(checked) {
                console.log(checked);
            }
            $(init);
    }(jQuery));
</script>
