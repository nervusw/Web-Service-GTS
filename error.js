exports.notFound = function ()
{
    var error = {
        "status":"error",
        "data":{
            "message":"Nao encontrado"
        }
    };
    return JSON.stringify(error);
};