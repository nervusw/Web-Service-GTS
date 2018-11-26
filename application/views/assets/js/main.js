$(function () {
    document.getElementsByTagName("body")[0].innerHTML += '<div class="pull-alert"><div id="alert_float_type" class="alert pull-right"><strong id="alert_float_title">Titulo</strong><hr class="hr-alert"><div id="alert_float_content"></div></div></div>';
});
var timeout;
function alert_float(type, title, message)
{
    $("#alert_float_content").html(message);
    $("#alert_float_type")[0].className = "alert alert-"+type+" pull-right";
    $("#alert_float_title").html(title);

    $('.alert').fadeIn();
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        $('.alert').fadeOut();
    }, 5000);
}