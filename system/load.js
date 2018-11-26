exports.helper = {
    "url":require("./helper/url_helper"),
    "general":require("./helper/general_helper"),
    "session":require("./helper/session_helper"),
};

exports.view = function(view, req, res)
{
    fs.readFile('./application/views/'+view, 'utf8', function (err,data){
        if (err)
        {
            replie_head["Content-Type"] = 'text/html';
            // params_sys['res'].writeHead(200, {'Content-Type': 'text/html'});
            res.writeHead(200, replie_head);
            res.write("View Nao Encontrado");
            res.end();
            console.log("[x]".red,"Erro no processamento da View");
            console.log("   [x]".red,err+"");
        }
        else
        {
            var temp_data,data_final = "";
            temp_data = data.split("\n");
            for(var i = 0; i < temp_data.length; i++)
                data_final += temp_data[i].replace("{assets_local}","/default/loadAssets?file=")+"\n";

            replie_head["Content-Type"] = 'text/html';
            // params_sys['res'].writeHead(200, {'Content-Type': 'text/html'});
            res.writeHead(200, replie_head);
            res.write(data_final);
            res.end();
            if(config.application['environment'] != 'production')
                console.log("[+] ".green,"View Carregada:",view);
        }
    });
};

exports.assets = function(assets, req, res, callback)
{
    try
    {
        var data = fs.readFileSync('./application/views/assets/' + assets, 'utf8').toString();

        var temp_data,data_final = "";
        var extension = assets.split(".");
        extension = extension[extension.length - 1];

        temp_data = data.split("\n");
        for(var i = 0; i < temp_data.length; i++)
            data_final += "\n"+temp_data[i].replace("{assets_local}","/default/loadAssets?file=");

        replie_head["Content-Type"] = load.helper.general.extensionToHtmlType(extension);
        res.writeHead(200, replie_head);
        res.write(data_final);
        callback(data,"");
    }
    catch (e)
    {
        console.log("  [i]".red,"Deu ruim assets.");
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("Assets Nao Encontrado");
        callback(e,"");
    }
};