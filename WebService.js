global.colors = require('colors');
global.config = require("./config/config");

if (config.application['environment'] != 'production') {
    console.log("[+]".green, "Iniciando serviço");
    console.log("[+]".green, "Carregando Módulos");
}
const Pusher = require('pusher');
global.puppeteer = require('puppeteer');

global.pusher = new Pusher({
    appId: '505604',
    key: '3e42a70bbada4320c6ab',
    secret: 'ab7e5889a43e6ffa420e',
    cluster: 'us2',
    encrypted: true
});

global.http = require('http');
global.mysql = require('mysql');
global.fs = require('fs');
global.config = require("./config/config");
const exec = require('child_process').exec;
global.status = {};
global.controllers = {};
global.model = {};
global.helpers = {};
global.dbc = {};
global.load = require("./system/load");
global.whatssession = {};

global.replie_head;

status["database"] = false;
status["controllers"] = false;
status["model"] = false;

var main_db_config = config.database['database'];
// global.db = mysql.createConnection(config.database);
// if(config.application['environment'] != 'production')
//     console.log("[i]".blue,"Conectando com o Banco de Dados");

function conect_database() {
    console.log("[i]".blue, "Conectando com o Banco de Dados");
    config.database['database'] = main_db_config;
    global.db = mysql.createConnection(config.database);
    db.connect(function (err, response) {
        if (err) {
            console.log("[x]".red, "Erro ao conectar com o Banco de Dados");
            setTimeout(function () {
                console.log("[*]".yellow, "Tentando reconectar");
                conect_database();
            }, 1000);
        }
        else {
            console.log("[+]".green, "Banco de Dados Principal Conectado");
            status["database"] = true;
            // getDatabaseVersion();
            // connectClientsDB()
        }
    });
}

conect_database();

function connectClientsDB() {
    db.query("SELECT nome_banco_dados, nome FROM clientes", function (err, data) {
        function connect_client(config, name) {
            dbc[config['database']] = mysql.createConnection(config);
            dbc[config['database']].connect(function (err, data) {
                if (err) {
                    console.log("[x]".red, "Erro ao conectar com o Banco de Dados [" + name + "]");
                    console.log("" + err);
                }
                else {
                    console.log("[i]".blue, "Banco de Dados conectado [" + name + "]");
                }
            });
        }

        if (err) {
            console.log("[x]".red, "Erro ao obter lista de clientes.");
            console.log("" + err);
            console.log("[i]".blue, "Saindo");
            process.exit(1);
        }
        else {
            for (var i = 0; i < data.length; i++) {
                var temp_config = config.database;
                temp_config['database'] = data[i]['databasename'];
                connect_client(temp_config, data[i]['nome']);
            }
        }
    });
}

global.finalizaRequisicao = (res, conteudo) => {
    console.log(conteudo);
    res.end(conteudo);
};
//Função para o servidor mysql não desconectar por TimeOut
setInterval(function () {
    db.query("SELECT 1");
    console.log("Mantem");
    var keys = Object.keys(dbc);
    for (var i = 0; i < keys.length; i++) {
        var dbname = keys[i];
        dbc[dbname].query("SELECT 1");
    }
}, 3 * 60 * 1000);

for (var i = 0; i < config.autoload.length; i++) {
    if (config.application['environment'] != 'production')
        console.log("[+]".green, "Carregando " + config.autoload[i]);

    var loads = fs.readdirSync('./application/' + config.autoload[i]);
    for (var j = 0; j < loads.length; j++) {
        try {
            if (config.autoload[i] == "controllers")
                controllers[loads[j].split(".")[0]] = require("./application/" + config.autoload[i] + "/" + loads[j]);
            else if (config.autoload[i] == "model")
                model[loads[j].split(".")[0]] = require("./application/" + config.autoload[i] + "/" + loads[j]);
            if (config.application['environment'] != 'production')
                console.log("[+]".blue, config.autoload[i] + " carregada: " + loads[j]);
        }
        catch (e) {
            if (fs.statSync("./application/" + config.autoload[i] + "/" + loads[j]).isFile()) {
                if (loads[j].split(".")[1] == "js") {
                    console.log("[x]".red, "Erro ao carregar " + config.autoload[i] + ": " + loads[j]);
                    console.log("[i]".blue, "Saindo");
                    process.exit(1);
                }
                else {
                    if (config.application['environment'] != 'production')
                        console.log("[-]".yellow, "Ignorando arquivo: " + loads[j]);
                }
            }
            else {
                if (config.application['environment'] != 'production')
                    console.log("[-]".yellow, "Ignorando Pasta: " + loads[j]);
            }
        }
    }
    status[config.autoload[i]] = true;
}
global.session = {};

http.createServer(function (req, res) {
    setTimeout(() => {
        const mensagemTimeout = {
            ok: false,
            mensagem_usuario: "TIMEOUT",
            descricao_usuario: "TIMEOUT"
        };
        if(res.end(JSON.stringify(mensagemTimeout))) {
            console.log("Finalizou requisição por timeout");
            console.log("GERAR ALGUM LOG AQUI".red);
        }
    }, 30 * 1000);
    replie_head = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'};
    load.helper.session.loadSession(req, res, function () {
        if (config.application['environment'] != 'production')
            console.log("------------------------");
        res.writeHead(200, replie_head);
        if (status["controllers"] && status["model"] && status["database"]) {
            req.url = req.url.split("/").map(prop => {
                if (prop != "api")
                    return prop;
            }).join("/").replace("//", "/");

            let reqP = load.helper.url.verify_request(req.url);
            if (reqP["status"]) {
                try {
                    controllers[reqP["data"]["controller"]][reqP["data"]["funcao"]](reqP["data"]["params"], req, res);
                    // if (config.application['environment'] != 'production')
                    //     console.log("[i] ".green, "Controller executada: ", reqP["data"]["controller"] + "." + reqP["data"]["funcao"]);
                }
                catch (e) {
                    res.write(controllers["error"]["notFound"]());
                    console.log("[x]".red, "Erro ao executar controller: ", reqP["data"]["controller"] + "." + reqP["data"]["funcao"]);
                    console.log("[x]".red, e + "");
                    res.end();
                }
            }
            else {
                res.write(controllers["error"]["notFound"]());
                console.log("[x] ".red, "Parametros invalidos: ", reqP["data"]["requisicao"]);
                res.end();
            }
        }
        else {
            res.end(JSON.stringify({
                "status": "wait",
                ok: false,
                "mensagem": "Erro interno no servidor",
                "descricao": "Aguardando Inicio dos Serviços",
                mensagem_usuario: "Erro interno no servidor.",
                descricao_usuario: "Aguardando Inicio dos Serviços."
            }));
        }
    });
}).listen(9090);

process.on('SIGINT', () => {
    var keys = Object.keys(dbc);
    for (var i = 0; i < keys.length; i++) {
        var dbname = keys[i];
        exec("for session in $(screen -ls | grep -o '[0-9]*\\." + dbname + "'); do screen -S \"${session}\" -X quit; done");
    }
    process.exit(1);
});

process.on('uncaughtException', function (errP) {
    if (errP.code == 'PROTOCOL_CONNECTION_LOST') {
        if (status["database"] == true) {
            //Verificar se esse erro é apensa do banco de dados p não dar futuras tretas
            status["database"] = false;
            conect_database();
        }
    }
    else {
        // load.helper.general.logActivity('erro',errP);
        if (config.application['environment'] != "production")
            console.log("[x]".red, "Erro ocorrido: ", '' + errP);
        if (config.application['exit_on_error']) {
            if (config.application['environment'] != "production")
                console.log("[x]".red, "Saindo");
            process.exit(1);
            var keys = Object.keys(dbc);
            for (var i = 0; i < keys.length; i++) {
                var dbname = keys[i];
                dbc[dbname].end();
            }
        }
    }
});