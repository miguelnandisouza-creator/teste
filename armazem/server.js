const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados SQLite
const db = new sqlite3.Database('./ecommerce.db');

// Criar tabelas
db.serialize(() => {
    // Clientes
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        endereco TEXT,
        numero TEXT,
        bairro TEXT,
        cidade TEXT,
        cep TEXT,
        latitude REAL,
        longitude REAL
    )`);

    // Admin
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE,
        senha TEXT
    )`);

    // Produtos
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        descricao TEXT,
        preco REAL,
        quantidade INTEGER,
        categoria TEXT,
        unidade TEXT,
        codigo_barras TEXT UNIQUE
    )`);

    // Pedidos
    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        produto_id INTEGER,
        quantidade INTEGER,
        data TEXT,
        status TEXT DEFAULT 'Pendente',
        forma_pagamento TEXT,
        FOREIGN KEY(cliente_id) REFERENCES clientes(id),
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
    )`);

    // Promoções (combos)
    db.run(`CREATE TABLE IF NOT EXISTS promocoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER,
        quantidade INTEGER,
        preco_combo REAL,
        descricao TEXT,
        ativa INTEGER DEFAULT 1,
        FOREIGN KEY(produto_id) REFERENCES produtos(id)
    )`);

    // Criar admin padrão se não existir
    db.get("SELECT * FROM admins WHERE usuario = 'admin'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO admins (usuario, senha) VALUES ('admin', 'admin123')");
            console.log("Admin padrão criado: admin / admin123");
        }
    });

    // Inserir produtos de exemplo se não existirem
    db.get("SELECT COUNT(*) as count FROM produtos", (err, row) => {
        if (row.count === 0) {
            const produtos = [
                ['Camiseta', 'Camiseta de cotton', 29.90, 100, 'roupas', 'un'],
                ['Calça', 'Calça jeans', 89.90, 50, 'roupas', 'un'],
                ['Tênis', 'Tênis esportivo', 199.90, 30, 'roupas', 'un'],
                ['Boné', 'Boné masculino', 19.90, 80, 'roupas', 'un'],
                ['Mochila', 'Mochila escolar', 59.90, 40, 'roupas', 'un']
            ];
            produtos.forEach(p => {
                db.run("INSERT INTO produtos (nome, descricao, preco, quantidade, categoria, unidade) VALUES (?, ?, ?, ?, ?, ?)", p);
            });
            console.log("Produtos de exemplo inseridos");
        }
    });
});

// ==================== ROTAS ====================

// Listar produtos (público)
app.get('/api/produtos', (req, res) => {
    db.all("SELECT * FROM produtos WHERE quantidade > 0", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// Listar TODOS os produtos (admin)
app.get('/api/admin/produtos', (req, res) => {
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// Listar promoções
app.get('/api/promocoes', (req, res) => {
    db.all("SELECT p.*, prod.nome FROM promocoes p JOIN produtos prod ON p.produto_id = prod.id WHERE p.ativa = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows || []);
    });
});

// Listar todas as promoções (admin)
app.get('/api/admin/promocoes', (req, res) => {
    db.all("SELECT p.*, prod.nome FROM promocoes p JOIN produtos prod ON p.produto_id = prod.id ORDER BY p.id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows || []);
    });
});

// Criar promoção (admin)
app.post('/api/promocoes', (req, res) => {
    const { produto_id, quantidade, preco_combo, descricao } = req.body;
    if (!produto_id || !quantidade || !preco_combo) {
        return res.status(400).json({ erro: "Preencha todos os campos" });
    }
    db.run("INSERT INTO promocoes (produto_id, quantidade, preco_combo, descricao) VALUES (?, ?, ?, ?)",
        [produto_id, quantidade, preco_combo, descricao || ''], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true, id: this.lastID });
    });
});

// Editar promoção (admin)
app.put('/api/promocoes/:id', (req, res) => {
    const { quantidade, preco_combo, descricao, ativa } = req.body;
    const id = req.params.id;
    
    db.run("UPDATE promocoes SET quantidade = ?, preco_combo = ?, descricao = ?, ativa = ? WHERE id = ?", 
        [quantidade, preco_combo, descricao || '', ativa, id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// Deletar promoção (admin)
app.delete('/api/promocoes/:id', (req, res) => {
    db.run("DELETE FROM promocoes WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// Cadastrar cliente
app.post('/api/clientes', (req, res) => {
    const { nome, email, senha, endereco, numero, bairro, cidade, cep, latitude, longitude } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos obrigatórios" });
    }
    db.run("INSERT INTO clientes (nome, email, senha, endereco, numero, bairro, cidade, cep, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
        [nome, email, senha, endereco || '', numero || '', bairro || '', cidade || '', cep || '', latitude || 0, longitude || 0], function(err) {
        if (err) return res.status(400).json({ erro: "Email já cadastrado" });
        res.json({ sucesso: true, id: this.lastID, nome: nome, email: email });
    });
});

// Login cliente
app.post('/api/login-cliente', (req, res) => {
    const { email, senha } = req.body;
    db.get("SELECT * FROM clientes WHERE email = ? AND senha = ?", [email, senha], (err, row) => {
        if (err || !row) return res.status(401).json({ erro: "Credenciais inválidas" });
        res.json({ sucesso: true, cliente: { id: row.id, nome: row.nome, email: row.email } });
    });
});

// Obter dados completos do cliente
app.get('/api/cliente/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT id, nome, email, endereco, numero, bairro, cidade, cep, latitude, longitude FROM clientes WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.status(404).json({ erro: "Cliente não encontrado" });
        res.json(row);
    });
});

// Atualizar dados do cliente (endereço)
app.put('/api/cliente/:id', (req, res) => {
    const { id } = req.params;
    const { endereco, numero, bairro, cidade, cep } = req.body;
    
    if (!endereco || !numero || !bairro || !cidade) {
        return res.status(400).json({ erro: "Preencha todos os campos obrigatórios" });
    }

    db.run("UPDATE clientes SET endereco = ?, numero = ?, bairro = ?, cidade = ?, cep = ? WHERE id = ?", 
        [endereco, numero, bairro, cidade, cep || '', id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true, mensagem: "Endereço atualizado com sucesso" });
    });
});

// Login admin
app.post('/api/login-admin', (req, res) => {
    const { usuario, senha } = req.body;
    db.get("SELECT * FROM admins WHERE usuario = ? AND senha = ?", [usuario, senha], (err, row) => {
        if (err || !row) return res.status(401).json({ erro: "Credenciais inválidas" });
        res.json({ sucesso: true });
    });
});

// Cadastrar produto (admin)
app.post('/api/produtos', (req, res) => {
    const { nome, descricao, preco, quantidade, categoria, unidade, codigo_barras } = req.body;
    if (!nome || !preco) {
        return res.status(400).json({ erro: "Preencha nome e preço" });
    }
    db.run("INSERT INTO produtos (nome, descricao, preco, quantidade, categoria, unidade, codigo_barras) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [nome, descricao || '', preco, quantidade || 0, categoria || '', unidade || 'un', codigo_barras || ''], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        // Retornar o produto inserido
        db.get("SELECT * FROM produtos WHERE id = ?", [this.lastID], (err, row) => {
            if (err) res.json({ sucesso: true, id: this.lastID });
            else res.json({ sucesso: true, id: this.lastID, produto: row });
        });
    });
});

// Buscar produto por código de barras
app.get('/api/produtos/barras/:codigo', (req, res) => {
    const { codigo } = req.params;
    db.get("SELECT * FROM produtos WHERE codigo_barras = ?", [codigo], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (!row) return res.status(404).json({ erro: "Produto não encontrado" });
        res.json(row);
    });
});

// Fazer pedido (cliente)
app.post('/api/pedidos', (req, res) => {
    const { cliente_id, produto_id, quantidade, forma_pagamento } = req.body;
    if (!cliente_id || !produto_id || !quantidade) {
        return res.status(400).json({ erro: "Dados incompletos" });
    }
    
    // Verificar estoque e pegar preço
    db.get("SELECT quantidade, preco FROM produtos WHERE id = ?", [produto_id], (err, row) => {
        if (!row || row.quantidade < quantidade) {
            return res.status(400).json({ erro: "Estoque insuficiente" });
        }
        
        const total = row.preco * quantidade;
        
        // Deduzir estoque
        db.run("UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?", [quantidade, produto_id]);
        
        // Criar pedido
        const data = new Date().toISOString();
        db.run("INSERT INTO pedidos (cliente_id, produto_id, quantidade, data, forma_pagamento) VALUES (?, ?, ?, ?, ?)",
            [cliente_id, produto_id, quantidade, data, forma_pagamento || 'Não informado'], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ sucesso: true, id: this.lastID, total: total });
        });
    });
});

// Listar pedidos (admin)
app.get('/api/pedidos', (req, res) => {
    const sql = `
        SELECT p.id, p.quantidade, p.data, p.status, p.forma_pagamento, c.nome as cliente_nome, prod.nome as produto_nome, (p.quantidade * prod.preco) as total
        FROM pedidos p
        JOIN clientes c ON p.cliente_id = c.id
        JOIN produtos prod ON p.produto_id = prod.id
        ORDER BY p.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// Atualizar status do pedido (admin)
app.put('/api/pedidos/:id', (req, res) => {
    const { status } = req.body;
    const id = req.params.id;
    
    db.run("UPDATE pedidos SET status = ? WHERE id = ?", [status, id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// Editar produto (admin)
app.put('/api/produtos/:id', (req, res) => {
    const { nome, descricao, preco, quantidade, categoria, unidade, codigo_barras } = req.body;
    const id = req.params.id;
    
    db.run("UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade = ?, categoria = ?, unidade = ?, codigo_barras = ? WHERE id = ?", 
        [nome, descricao || '', preco, quantidade || 0, categoria || '', unidade || 'un', codigo_barras || '', id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// Deletar produto (admin)
app.delete('/api/produtos/:id', (req, res) => {
    db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// Buscar CEP/Endereço via ViaCEP (proxy para evitar CORS)
app.get('/api/buscar-cep', async (req, res) => {
    const { cep, cidade, rua, numero } = req.query;

    let url;
    
    // Modo 1: Buscar por CEP
    if (cep) {
        const cepFormatado = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cepFormatado.length !== 8) {
            return res.status(400).json({ erro: 'CEP inválido' });
        }
        url = `https://viacep.com.br/ws/${cepFormatado}/json`;
    }
    // Modo 2: Buscar por endereço
    else if (cidade && rua && numero) {
        url = `https://viacep.com.br/ws/${cidade}/${rua}/${numero}/json`;
    }
    // Erro: parâmetros insuficientes
    else {
        return res.status(400).json({ erro: 'Parâmetros faltando: CEP ou (Cidade + Rua + Número)' });
    }

    try {
        const fetch = require('node-fetch');
        console.log('Buscando em:', url);

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (err) {
        console.error('Erro ao buscar:', err);
        res.status(500).json({ erro: 'Erro ao buscar informações' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando: http://localhost:${PORT}`);
});