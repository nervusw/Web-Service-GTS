exports.index = function (params, req, res)
{
    load.view("demonstracao.html", req, res);
    return "";
};

exports.loadAssets = function (params, req, res)
{
    load.assets(params["file"], req, res, function (img,type) {
        res.end(img, type);
    });
    return "";
};