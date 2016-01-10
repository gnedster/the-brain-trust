$(document).ready(function() {
  $('.application-edit input:checkbox').change(function() {
    var $el = $(this);
    $el.siblings('input.hidden').prop('checked', !$el.prop('checked'));
  });
});
