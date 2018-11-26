function valida_parametros(params, validar) {
    for (var i = 0; i < validar.length; i++) {
        if (params[validar[i]] == "" || params[validar[i]] == undefined)
            return false;
    }
    return true;
}

exports.busca_local_periodo = (params, req, res) => {
    if (!valida_parametros(params, ['ts_inicio', "ts_final", "device_id"])) {
        finalizaRequisicao(res, JSON.stringify({
            ok: false,
            mensagem_usuario: 'Campos obrigatórios inválidos ou ausentes.',
            codigo_erro: 500
        }));
        return false;
    }

    db.query(`SELECT latitude, longitude, timestamp, address FROM EventData WHERE timestamp BETWEEN '${params['ts_inicio']}' AND '${params['ts_final']}' AND deviceID = '${params['device_id']}' GROUP BY latitude, longitude, timestamp`, (err, data) => {
        if (err) {
            finalizaRequisicao(res, JSON.stringify({
                ok: false,
                mensagem_usuario: "",
                descricao_usuario: ""
            }));
        }
        else {
            finalizaRequisicao(res, JSON.stringify({
                ok: true,
                dados: data
            }));
        }
    });
};

exports.busca_ultimo_local_veiculo = (params, req, res) => {
    if (!valida_parametros(params, ["device_id"])) {
        finalizaRequisicao(res, JSON.stringify({
            ok: false,
            mensagem_usuario: 'Campos obrigatórios inválidos ou ausentes.',
            codigo_erro: 500
        }));
        return false;
    }

    db.query(`SELECT latitude, longitude, timestamp, address FROM EventData WHERE deviceID = "${params["device_id"]}" AND address <> "" AND longitude <> 0 AND latitude <> "" ORDER BY timestamp DESC LIMIT 1`, (err, data) => {
        if (err) {
            finalizaRequisicao(res, JSON.stringify({
                ok: false,
                mensagem_usuario: "Deu ruim",
                descricao_usuario: ""
            }));
        }
        else {
            finalizaRequisicao(res, JSON.stringify({
                ok: true,
                mensagem_usuario: "Dados retornados com sucesso!",
                descricao_usuario: "",
                dados: {
                    ...data[0]
                }
            }));
        }
    });
};