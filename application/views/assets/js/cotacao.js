function sair()
{
    $.get(window.location.origin+"/cotacao/logout", function(data){
        if(data.status == "success")
            window.location.href = window.location.href;
        else
            alert("Deu ruim");
    });
}
function loadCotacoes()
{
    $.get(window.location.origin+"/cotacao/getcotacoes", function(data){
        var html = "";
        var cotacoes = data.data.cotacoes;
        if(cotacoes.length > 0)
        {
            html += '<div class="table-responsive">';
            html += '	<table class="table">';
            html += '		<thead>';
            html += '			<tr>';
            html += '				<th>#</th>';
            html += '				<th>Data Cotação</th>';
            html += '				<th>Quantidade de Itens</th>';
            html += '				<th>Opções</th>';
            html += '			</tr>';
            html += '		</thead>';
            html += '		<tbody>';
            for (var i = 0; i < cotacoes.length; i++)
            {
                if(cotacoes[i]['quant_vazio'] == 0)
                    var type = "success";
                else if(cotacoes[i]['quant_vazio'] == cotacoes[i]['quant_prods'])
                    var type = "danger";
                else
                    var type = "warning";
                if(cotacoes[i]['flag_active'] == "0")
                    var type = "danger";
                var d = new Date(cotacoes[i]['data_cotacao']);
                if(d.getDay() < 10)
                    var day = "0"+d.getDay();
                else
                    var day = d.getDay();
                if(d.getMonth() < 10)
                    var month = "0"+d.getMonth();
                else
                    var month = d.getMonth();
                var date = day+"/"+month+"/"+d.getFullYear();
                html += '			<tr class="'+type+'">';
                html += '				<td>'+cotacoes[i]['cotacao_cod']+'</td>';
                html += '				<td>'+date+'</td>';
                html += '				<td>'+cotacoes[i]['quant_prods']+'</td>';
                if(cotacoes[i]['flag_active'] == "1")
                    html += '           <td><button type="submit" class="btn btn-success" onclick="getCotacoesItens('+cotacoes[i]['cotacao_cod']+')"><i class="far fa-edit"></i></button></td>';
                else
                    html += '           <td></td>';
                html += '			</tr>';
            }
            html += '		</tbody>';
            html += '	</table>';
            html += '</div>';
        }
        else
        {
            html += "Nenhuma cotação disponível."
        }
        $("#content").html(html);
    });
}
var prods = {};
function getCotacoesItens(cod_cotacao)
{
    $.get(window.location.origin+"/cotacao/getcotacoesitens?cod_cotacao="+cod_cotacao, function(data){
        data = data['data'];
        if(data.itenscotacoes.length != undefined)
        {
            var html = '<div class="panel panel-default">';
            html += '<div class="panel-heading">';
            html += 'Opa';
            html += '</div>';
            html += '<div class="panel-body">';
            html += '<table width="100%" class="table table-striped table-bordered table-hover" id="dataTables-cotacao">';
            html += '<thead><tr><td>Produto</td><td>Quantidade</td><td>Preço Unitário</td><td>Desconto/Bonus</td><td>ICMS</td><td>Total</td><td>Opções</td></tr></thead>';
            html += '<tbody>';

            for (var i = 0; i < data['itenscotacoes'].length; i++) {
                var cod_prod = data['itenscotacoes'][i]['cod_produto'];
                if(data['itenscotacoes'][i]['valor_completo'] == "999999999")
                    data['itenscotacoes'][i]['valor_completo'] = "0";
                html += '<tr>';
                html += '<td id="nome_prod_' + cod_prod + '">' + data['itenscotacoes'][i]['DESCRICAO_COMPLETA'] + '</td>';
                html += '<td><div class="form-group input-group"><input onfocusout="mostra_total(' + cod_prod + '); verifica(this);" id="quant_' + cod_prod + '" type="number" class="form-control" min="0" max="' + data['itenscotacoes'][i]['quantidade_max'] + '" value="' + data['itenscotacoes'][i]['quantidade'] + '"><span class="input-group-addon">' + data['itenscotacoes'][i]['emb_venda'] + '</span></div></td>';
                html += '<td><div class="form-group input-group"><span class="input-group-addon">R$</span><input onfocusout="mostra_total(' + data['itenscotacoes'][i]['cod_produto'] + ');" type="number" id="valor_' + cod_prod + '" class="form-control" value="' + data['itenscotacoes'][i]['valor_completo'] + '"></div></td>';
                html += '<td><div class="form-group input-group"><input type="number" class="form-control" onfocusout="mostra_total(' + cod_prod + ');" id="desconto_' + cod_prod + '" value="' + data['itenscotacoes'][i]['desconto'] + '"><span class="input-group-addon">%</span></div></td>';
                html += '<td><div class="form-group input-group"><input type="number" class="form-control" id="icms_' + cod_prod + '" value="' + data['itenscotacoes'][i]['icme'] + '"><span class="input-group-addon">%</span></div></td>';
                var total = parseFloat(data['itenscotacoes'][i]['quantidade'])*parseFloat(data['itenscotacoes'][i]['valor_completo']);
                total = total-(total*(parseFloat(data['itenscotacoes'][i]['desconto'])/100));
                prods[cod_prod] = total.toFixed(2);
                if (data['itenscotacoes'][i]['valor_completo'] == "" || data['itenscotacoes'][i]['valor_completo'] == '0')
                    var classbtn = 'danger';
                else
                    var classbtn = 'success';
                html += '<td>R$ <span data-saved_value="'+total.toFixed(2)+'" data-original_btn_color="'+classbtn+'" data-cod_prod="'+cod_prod+'" id="total_' + cod_prod + '" class="span_total_prod">' + total.toFixed(2) + '</span></td>';

                html += '<td><button type="submit" class="btn btn-' + classbtn + '" id="btnsalva_' + cod_prod + '" onclick="salvacotacao(' + cod_prod + '); return false;"><i class="fa fa-save"></i></button></td>';
                html += '</tr>';
            }
            html += '<tr><td>Total</td><td></td><td></td><td></td><td></td><td>R$ <span id="total_cotacao">00,00</span></td><td></td></tr>';
            html += '<tbody>';
            $("#content").html(html);
            calculatotal();
            $(".span_total_prod").on('DOMSubtreeModified', function () {
                if(parseFloat($(this)[0].getAttribute('data-saved_value')) != parseFloat($(this).text()))
                {
                    $("#btnsalva_"+$(this).data('cod_prod'))[0].className = 'btn btn-info';
                }
                else
                    $("#btnsalva_"+$(this).data('cod_prod'))[0].className = 'btn btn-'+$(this)[0].getAttribute('data-original_btn_color');
            });
            // $("#nomecliente").html(data["loja"]["nomeloja"]);
        }
    });
}

function salvacotacao(id_produto)
{
    verify0(id_produto);
    var quant = $("#quant_"+id_produto).val();
    var valor = $("#valor_"+id_produto).val();
    var desconto = $("#desconto_"+id_produto).val();
    var icms = $("#icms_"+id_produto).val();
    var params = "quantidade="+quant+"&valor_completo="+valor+"&desconto="+desconto+"&icme="+icms+"&cod_produto="+id_produto;
    var total = parseFloat(quant)*parseFloat(valor);
    total = total-(total*(desconto/100));
    $.get(window.location.origin+"/cotacao/savecotacoes?"+params, function(data){
        alert_float(data.status, $("#nome_prod_"+id_produto).html(), data.data.message);
        if(valor == "0")
            data.status = 'danger';
        if(data.status == 'info')
            data.status = 'success';

        $("#total_"+id_produto)[0].setAttribute('data-original_btn_color', data.status);
        $("#total_"+id_produto)[0].setAttribute("data-saved_value", total);
        $("#btnsalva_"+id_produto)[0].className = 'btn btn-'+data.status;
    });
}
function verify0(id_produto) {
    if($("#quant_"+id_produto).val() == "")
        $("#quant_"+id_produto).val("0");
    if($("#valor_"+id_produto).val() == "")
        $("#valor_"+id_produto).val("0");
    if($("#desconto_"+id_produto).val() == "")
        $("#desconto_"+id_produto).val("0");
    if($("#icms_"+id_produto).val() == "")
        $("#icms_"+id_produto).val("0");
}
function mostra_total(id_produto)
{
    verify0(id_produto);
    var quant = $("#quant_"+id_produto).val();
    var valor = $("#valor_"+id_produto).val();
    var desconto = $("#desconto_"+id_produto).val();
    var total = parseFloat(quant)*parseFloat(valor);
    total = total-(total*(desconto/100));
    $("#total_"+id_produto).html(total.toFixed(2));
    calculatotal();
}

function calculatotal()
{
    var result=0.0;
    for(var i=0; i<$(".span_total_prod").length; i++)
    {
        result += parseFloat($(".span_total_prod")[i].innerText);
    }
    $("#total_cotacao").text(result);
}

function verifica(input)
{
    if(parseFloat(input.value) > parseFloat(input.max))
    {
        input.focus();
        alert_float("warning","Atenção","A quantidade deve ser inferior ou igual a "+input.max);
    }
}
$.get(window.location.origin+"/cotacao/getpanel", function(data){
    $("#nomefornecedor").html(data["fornecedor"]["name"]);
    $("#nomecliente").html(data["loja"]["nomeloja"]);
});
$(function () {
    $(".menu_item_class_control").on("click", function(){
        $(".menu_item_class_control").removeClass("active");
        $(this)[0].className = "menu_item_class_control active";
    });
});

function loadDashboard()
{
    
}