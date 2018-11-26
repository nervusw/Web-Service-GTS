const utf8 = require('utf8');

function get_params(url) {
    var params = {};
    let urlBase = url;
    if (url.indexOf("?") != -1) {
        var param = url.split("?")[1];
        urlBase = url.split("?")[0];
        if (url.indexOf("&") != -1) {
            param = param.split("&");
            for (var i = 0, len = param.length; i < len; i++)
                params[param[i].split("=")[0]] = decodeURI(utf8.decode(param[i].split("=")[1]).toString());
        }
        else
            params[param.split("=")[0]] = decodeURI(utf8.decode(param.split("=")[1]).toString());
    }
    if (url.split("/")[3]) {
        params['extra'] = "";
        for (var i = 3; i < url.split("/").length; i++) {
            if (i > 3)
                params['extra'] += "/";
            params['extra'] += url.split("/")[i];
        }
    }
    console.log("[+]".green, urlBase);

    const keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
        if(keys[i] != "token")
            console.log(keys[i], "=", params[keys[i]]);
    }
    return params;
}

exports.verify_request = function (url_requi) {
    var requisicao = {};
    var temp_params = url_requi;

    requisicao["data"] = {};

    requisicao["status"] = true;
    requisicao["data"]["params"] = get_params(url_requi);
    requisicao["data"]["funcao"] = "index";
    requisicao["data"]["requisicao"] = temp_params;

    if (url_requi.indexOf("?") != -1)
        temp_params = url_requi.split("?")[0];

    if (temp_params == "/" || temp_params == "") {
        requisicao["data"]["controller"] = "default";
    }
    else if (temp_params.indexOf(".") != -1) {
        requisicao["data"]["controller"] = null;
        requisicao["data"]["funcao"] = null;
        requisicao["status"] = false;
    }
    else {
        requisicao["data"]["controller"] = temp_params.split("/")[1];
        if (temp_params.split("/")[2] != undefined && temp_params.split("/")[2] != "")
            requisicao["data"]["funcao"] = temp_params.split("/")[2];
    }

    return requisicao;
};