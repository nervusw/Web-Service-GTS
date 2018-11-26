function organizaParametros(params)
{
    var params_f = {};
    if(params != undefined)
    {
        if(params.indexOf(";") != -1)
        {
            params = params.split(";");
            for (var i = 0, len = params.length; i < len; i++)
                params_f[params[i].split("=")[0].trim()] = params[i].split("=")[1].trim();
        }
        else
            params_f[params.split("=")[0].trim()] = params.split("=")[1].trim();
    }
    return params_f;
}

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 50; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.loadSession = function(req, res, callback)
{
    // var cookies_obj = organizaParametros(req.headers.cookie);
    // if(cookies_obj.jid == undefined)
    // {
    //     var key = makeid();
    //     replie_head["Set-Cookie"] = 'jid='+key;
    //     session[key] = {};
    //     session[key]['fornecedor'] = null;
    //     req.headers.cookie = "jid="+key;
    // }
    // else
    // {
    //     if(session[cookies_obj.jid] == undefined)
    //     {
    //         session[cookies_obj.jid] = {};
    //         session[cookies_obj.jid]['fornecedor'] = null;
    //     }
    // }
    callback();
};

exports.getSessionKey = function(req)
{
    return organizaParametros(req.headers.cookie)["jid"];
};