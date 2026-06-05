// ==================== CONFIGURAÇÃO ====================
const API_URL = 'http://localhost:8080';
let token = null;
let userRole = null;
let userName = null;

// ==================== UTILITÁRIOS ====================
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.innerHTML = '<div class="loading">🔄 Carregando...</div>';
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) element.innerHTML = `<div class="error">❌ ${message}</div>`;
}

function formatJSON(data) {
    return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    console.log(`📡 ${method} ${endpoint}`);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
        let errorMsg = `Erro ${response.status}`;
        try {
            const error = await response.text();
            errorMsg = error || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
    }
    
    if (response.status === 204) {
        return null;
    }
    return await response.json();
}

// ==================== LOGIN ====================
async function fazerLogin() {
    const login = document.getElementById('login').value;
    const senha = document.getElementById('senha').value;

    console.log(`🔐 Tentando login: ${login}`);

    try {
        const response = await apiRequest('/auth/login', 'POST', { login, senha });
        token = response.token;
        userRole = response.perfil;
        userName = response.nome;

        console.log('✅ Login OK! Perfil:', userRole);

        // Esconder tela de login
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        
        // Mostrar nome do usuário
        document.getElementById('userName').innerHTML = `👤 ${userName}`;
        document.getElementById('userRole').innerHTML = userRole;

        // Mostrar botões específicos para ADMIN
        if (userRole === 'ADMIN') {
            const adminBtn = document.getElementById('adminOnlyBtn');
            const btnCadastrar = document.getElementById('btnCadastrarMed');
            const btnEntrada = document.getElementById('btnEntradaManual');
            if (adminBtn) adminBtn.style.display = 'inline-block';
            if (btnCadastrar) btnCadastrar.style.display = 'inline-block';
            if (btnEntrada) btnEntrada.style.display = 'inline-block';
        }

        // Carregar medicamentos por padrão
        showSection('medicamentos');
        await carregarMedicamentos();
    } catch (error) {
        console.error('❌ Erro no login:', error);
        alert('Erro no login: ' + error.message);
    }
}

function logout() {
    token = null;
    userRole = null;
    userName = null;
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('login').value = 'admin';
    document.getElementById('senha').value = 'admin123';
}

// ==================== NAVEGAÇÃO ====================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active-section');
    });
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active-section');
}

// ==================== MEDICAMENTOS ====================
async function carregarMedicamentos() {
    if (!token) return;
    showLoading('medicamentosList');
    try {
        const data = await apiRequest('/medicamentos');
        document.getElementById('medicamentosList').innerHTML = formatJSON(data);
        console.log(`📦 ${data.length} medicamentos carregados`);
    } catch (error) {
        showError('medicamentosList', error.message);
    }
}

async function buscarPorNome() {
    const nome = document.getElementById('buscaNome').value;
    if (!nome) return;
    showLoading('medicamentosList');
    try {
        const data = await apiRequest(`/medicamentos/buscar/nome?nome=${encodeURIComponent(nome)}`);
        document.getElementById('medicamentosList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('medicamentosList', error.message);
    }
}

async function buscarPorPrincipio() {
    const principio = document.getElementById('buscaPrincipio').value;
    if (!principio) return;
    showLoading('medicamentosList');
    try {
        const data = await apiRequest(`/medicamentos/buscar/principio-ativo?principioAtivo=${encodeURIComponent(principio)}`);
        document.getElementById('medicamentosList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('medicamentosList', error.message);
    }
}

function showCadastroMed() {
    document.getElementById('modalMed').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function cadastrarMedicamento() {
    const dto = {
        nome: document.getElementById('medNome').value,
        principioAtivo: document.getElementById('medPrincipio').value,
        fabricante: document.getElementById('medFabricante').value,
        categoria: document.getElementById('medCategoria').value,
        tipoControle: document.getElementById('medTipoControle').value,
        numeroLote: document.getElementById('medNumeroLote').value,
        dataValidade: document.getElementById('medDataValidade').value,
        quantidadeInicial: parseInt(document.getElementById('medQuantidade').value),
        estoqueMinimo: parseInt(document.getElementById('medEstoqueMinimo').value)
    };

    try {
        await apiRequest('/medicamentos', 'POST', dto);
        alert('✅ Medicamento cadastrado com sucesso!');
        closeModal('modalMed');
        await carregarMedicamentos();
        
        // Limpar campos
        document.getElementById('medNome').value = '';
        document.getElementById('medPrincipio').value = '';
        document.getElementById('medFabricante').value = '';
        document.getElementById('medNumeroLote').value = '';
        document.getElementById('medDataValidade').value = '';
        document.getElementById('medQuantidade').value = '';
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ==================== LOTES ====================
async function carregarLotes() {
    if (!token) return;
    showLoading('lotesList');
    try {
        const data = await apiRequest('/lotes');
        document.getElementById('lotesList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('lotesList', error.message);
    }
}

async function carregarLotesVencidos() {
    if (!token) return;
    showLoading('lotesList');
    try {
        const data = await apiRequest('/lotes/vencidos');
        document.getElementById('lotesList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('lotesList', error.message);
    }
}

async function carregarProximosVencimento() {
    if (!token) return;
    showLoading('lotesList');
    try {
        const data = await apiRequest('/lotes/proximos-vencimento?dias=30');
        document.getElementById('lotesList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('lotesList', error.message);
    }
}

async function buscarLotePorNumero() {
    const numero = document.getElementById('buscaLoteNumero').value;
    if (!numero) return;
    showLoading('lotesList');
    try {
        const data = await apiRequest(`/lotes/buscar/numero?numeroLote=${encodeURIComponent(numero)}`);
        document.getElementById('lotesList').innerHTML = formatJSON([data]);
    } catch (error) {
        showError('lotesList', error.message);
    }
}

async function adicionarEstoque() {
    const loteId = document.getElementById('loteId').value;
    const quantidade = prompt('Quantidade a adicionar:');
    if (!loteId || !quantidade) return;
    
    try {
        await apiRequest(`/lotes/${loteId}/adicionar-estoque?quantidade=${quantidade}`, 'PUT');
        alert('✅ Estoque adicionado!');
        await carregarLotes();
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

async function removerEstoque() {
    const loteId = document.getElementById('loteId').value;
    const quantidade = prompt('Quantidade a remover:');
    if (!loteId || !quantidade) return;
    
    try {
        await apiRequest(`/lotes/${loteId}/remover-estoque?quantidade=${quantidade}`, 'PUT');
        alert('✅ Estoque removido!');
        await carregarLotes();
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ==================== MOVIMENTAÇÕES ====================
async function carregarMovimentacoes() {
    if (!token) return;
    showLoading('movimentacoesList');
    try {
        const data = await apiRequest('/movimentacoes/historico');
        document.getElementById('movimentacoesList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('movimentacoesList', error.message);
    }
}

async function carregarMovimentacoesPorTipo(tipo) {
    if (!token) return;
    showLoading('movimentacoesList');
    try {
        const data = await apiRequest(`/movimentacoes/tipo/${tipo}`);
        document.getElementById('movimentacoesList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('movimentacoesList', error.message);
    }
}

function showEntradaManual() {
    document.getElementById('modalEntrada').style.display = 'block';
}

async function registrarEntrada() {
    const dto = {
        loteId: parseInt(document.getElementById('entradaLoteId').value),
        quantidade: parseInt(document.getElementById('entradaQuantidade').value),
        observacao: document.getElementById('entradaObs').value
    };

    try {
        await apiRequest('/movimentacoes/entrada', 'POST', dto);
        alert('✅ Entrada registrada!');
        closeModal('modalEntrada');
        await carregarMovimentacoes();
        
        document.getElementById('entradaLoteId').value = '';
        document.getElementById('entradaQuantidade').value = '';
        document.getElementById('entradaObs').value = '';
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ==================== VENDAS ====================
let itensVendaTemp = [];

async function carregarVendas() {
    if (!token) return;
    showLoading('vendasList');
    try {
        const data = await apiRequest('/vendas');
        document.getElementById('vendasList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('vendasList', error.message);
    }
}

function showVendaModal() {
    itensVendaTemp = [];
    document.getElementById('modalVenda').style.display = 'block';
    renderItensVenda();
}

function renderItensVenda() {
    const container = document.getElementById('itensVenda');
    if (!container) return;
    container.innerHTML = '';
    
    if (itensVendaTemp.length === 0) {
        adicionarItemVenda();
        return;
    }
    
    itensVendaTemp.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-venda';
        div.innerHTML = `
            <span>Lote: ${item.loteId}</span>
            <span>Qtd: ${item.quantidade}</span>
            <span>Preço: R$ ${item.precoUnitario}</span>
            <button onclick="removerItemVenda(${index})">❌</button>
        `;
        container.appendChild(div);
    });
}

function adicionarItemVenda() {
    const container = document.getElementById('itensVenda');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'item-venda';
    div.innerHTML = `
        <input type="number" placeholder="Lote ID" class="loteId" style="width:100px">
        <input type="number" placeholder="Quantidade" class="qtd" style="width:100px">
        <input type="number" placeholder="Preço Unitário" class="preco" step="0.01" style="width:120px">
        <button onclick="confirmarAdicionarItem(this)">➕</button>
    `;
    container.appendChild(div);
}

function confirmarAdicionarItem(btn) {
    const div = btn.parentElement;
    const loteId = parseInt(div.querySelector('.loteId').value);
    const quantidade = parseInt(div.querySelector('.qtd').value);
    const precoUnitario = parseFloat(div.querySelector('.preco').value);
    
    if (loteId && quantidade && precoUnitario) {
        itensVendaTemp.push({ loteId, quantidade, precoUnitario });
        div.remove();
        renderItensVenda();
    } else {
        alert('Preencha todos os campos do item!');
    }
}

function removerItemVenda(index) {
    itensVendaTemp.splice(index, 1);
    renderItensVenda();
}

async function finalizarVenda() {
    if (itensVendaTemp.length === 0) {
        alert('Adicione pelo menos um item à venda!');
        return;
    }

    const request = {
        itens: itensVendaTemp,
        receitaRegistro: document.getElementById('receitaRegistro')?.value || null,
        encomenda: document.getElementById('encomenda')?.checked || false
    };

    try {
        const data = await apiRequest('/vendas', 'POST', request);
        alert(`✅ Venda #${data.id} registrada! Total: R$ ${data.valorTotal}`);
        closeModal('modalVenda');
        await carregarVendas();
        
        itensVendaTemp = [];
        if (document.getElementById('receitaRegistro')) document.getElementById('receitaRegistro').value = '';
        if (document.getElementById('encomenda')) document.getElementById('encomenda').checked = false;
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

async function gerarComprovante() {
    const vendaId = document.getElementById('vendaId').value;
    if (!vendaId) return;
    
    try {
        const response = await fetch(`${API_URL}/vendas/${vendaId}/comprovante`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const text = await response.text();
        alert(text);
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

async function cancelarVenda() {
    const vendaId = document.getElementById('vendaId').value;
    if (!vendaId) return;
    
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
        try {
            const data = await apiRequest(`/vendas/${vendaId}/cancelar`, 'PUT');
            alert(`✅ Venda #${data.id} cancelada!`);
            await carregarVendas();
        } catch (error) {
            alert('❌ Erro: ' + error.message);
        }
    }
}

// ==================== RELATÓRIOS ====================
async function carregarEstoqueBaixo() {
    if (!token) return;
    showLoading('relatoriosResult');
    try {
        const data = await apiRequest('/medicamentos/estoque-baixo');
        document.getElementById('relatoriosResult').innerHTML = formatJSON(data);
    } catch (error) {
        showError('relatoriosResult', error.message);
    }
}

async function carregarReposicao() {
    if (!token) return;
    showLoading('relatoriosResult');
    try {
        const data = await apiRequest('/medicamentos/reposicao');
        document.getElementById('relatoriosResult').innerHTML = formatJSON(data);
    } catch (error) {
        showError('relatoriosResult', error.message);
    }
}

async function carregarMaisVendidos() {
    if (!token) return;
    const inicio = prompt('Data início (YYYY-MM-DDTHH:MM:SS):', '2026-01-01T00:00:00');
    const fim = prompt('Data fim (YYYY-MM-DDTHH:MM:SS):', '2026-12-31T23:59:59');
    if (!inicio || !fim) return;
    
    showLoading('relatoriosResult');
    try {
        const data = await apiRequest(`/vendas/mais-vendidos?inicio=${inicio}&fim=${fim}`);
        document.getElementById('relatoriosResult').innerHTML = formatJSON(data);
    } catch (error) {
        showError('relatoriosResult', error.message);
    }
}

async function gerarRelatorioMensal() {
    if (!token) return;
    const mes = prompt('Mês (1-12):', '5');
    const ano = prompt('Ano:', '2026');
    if (!mes || !ano) return;
    
    try {
        const response = await fetch(`${API_URL}/relatorios/mensal?mes=${mes}&ano=${ano}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const text = await response.text();
        document.getElementById('relatoriosResult').innerHTML = `<pre>${text}</pre>`;
    } catch (error) {
        showError('relatoriosResult', error.message);
    }
}

async function exportarCSV() {
    if (!token) return;
    const inicio = prompt('Data início (YYYY-MM-DDTHH:MM:SS):', '2026-01-01T00:00:00');
    const fim = prompt('Data fim (YYYY-MM-DDTHH:MM:SS):', '2026-12-31T23:59:59');
    if (!inicio || !fim) return;
    
    try {
        const response = await fetch(`${API_URL}/relatorios/exportar-csv?inicio=${inicio}&fim=${fim}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const csv = await response.text();
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${new Date().toISOString().slice(0,19)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('✅ Download iniciado!');
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ==================== ADMIN ====================
async function carregarUsuarios() {
    alert('Para listar usuários, consulte o banco diretamente via SQL.');
}

async function carregarMovimentacoesPorUsuario() {
    if (!token) return;
    const usuarioId = prompt('ID do Usuário:');
    if (!usuarioId) return;
    showLoading('adminList');
    try {
        const data = await apiRequest(`/movimentacoes/usuario/${usuarioId}`);
        document.getElementById('adminList').innerHTML = formatJSON(data);
    } catch (error) {
        showError('adminList', error.message);
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Frontend carregado!');
    console.log('📡 API URL:', API_URL);
    
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});