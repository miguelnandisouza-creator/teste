const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Banco de dados SQLite
const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'ecommerce.db'));

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
        codigo_barras TEXT UNIQUE,
        imagem LONGTEXT
    )`);

    // Adicionar coluna de imagem se não existir
    db.run(`ALTER TABLE produtos ADD COLUMN imagem LONGTEXT`, (err) => {
        if (err && err.message.includes('duplicate column')) {
            // Coluna já existe, ignorar erro
        } else if (err) {
            console.error('Erro ao adicionar coluna de imagem:', err);
        }
    });

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

    // Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        descricao TEXT,
        data_criacao TEXT
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
                // MERCEARIA
                ['Arroz Integral 5kg', 'Arroz integral tipo 1 - 5kg', 32.90, 50, 'mercearia', 'un', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop&q=80', '7891234001234'],
                ['Feijão Carioca 1kg', 'Feijão carioca premium', 11.99, 100, 'mercearia', 'kg', 'https://images.unsplash.com/photo-1512621539385-2c0cf99b7800?w=400&h=400&fit=crop&q=80', '7891234002341'],
                ['Feijão Preto 1kg', 'Feijão preto tipo 1', 12.50, 80, 'mercearia', 'kg', 'https://images.unsplash.com/photo-1585707418624-c7f54ed53859?w=400&h=400&fit=crop&q=80', '7891234003058'],
                ['Açúcar Cristal 1kg', 'Açúcar cristal refinado', 3.99, 120, 'mercearia', 'kg', 'https://images.unsplash.com/photo-1610271012795-29c4c7cf45dc?w=400&h=400&fit=crop&q=80', '7891234004765'],
                ['Sal Refinado 1kg', 'Sal refinado iodado', 2.49, 100, 'mercearia', 'un', 'https://images.unsplash.com/photo-1599599810694-b5ac4dd15fcb?w=400&h=400&fit=crop&q=80', '7891234005472'],
                ['Farinha de Trigo 1kg', 'Farinha de trigo integral', 4.50, 90, 'mercearia', 'un', 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f6?w=400&h=400&fit=crop&q=80', '7891234006189'],
                ['Macarrão 500g', 'Macarrão tipo penne', 3.99, 150, 'mercearia', 'un', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop&q=80', '7891234007896'],
                ['Azeite 500ml', 'Azeite extra virgem', 28.90, 40, 'mercearia', 'un', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&q=80', '7891234008603'],
                ['Óleo de Soja 900ml', 'Óleo de soja refinado', 8.99, 120, 'mercearia', 'un', 'https://images.unsplash.com/photo-1587224267537-b85e80c78f89?w=400&h=400&fit=crop&q=80', '7891234009310'],
                ['Vinagre 750ml', 'Vinagre de álcool', 4.50, 80, 'mercearia', 'un', 'https://images.unsplash.com/photo-1535985660195-90bae4c1c59c?w=400&h=400&fit=crop&q=80', '7891234010027'],
                ['Molho de Tomate 340g', 'Molho de tomate concentrado', 2.99, 200, 'mercearia', 'un', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop&q=80', '7891234011734'],
                ['Leite Condensado 395g', 'Leite condensado', 5.50, 100, 'mercearia', 'un', 'https://images.unsplash.com/photo-1568861617036-92fc8b3e3591?w=400&h=400&fit=crop&q=80', '7891234012441'],
                
                // BEBIDAS
                ['Café Coado 500g', 'Café torrado e moído', 9.90, 80, 'bebidas', 'un', 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=400&h=400&fit=crop&q=80', '7891234013158'],
                ['Café em Cápsula', 'Café em cápsula premium', 34.90, 50, 'bebidas', 'un', 'https://images.unsplash.com/photo-1575806253481-29e2b4996e0c?w=400&h=400&fit=crop&q=80', '7891234014865'],
                ['Chá Preto 25 Saches', 'Chá preto variedade', 6.99, 60, 'bebidas', 'un', 'https://images.unsplash.com/photo-1597318030842-b52eab6c0590?w=400&h=400&fit=crop&q=80', '7891234015572'],
                ['Suco Natural 1L', 'Suco natural de laranja', 7.99, 50, 'bebidas', 'un', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop&q=80', '7891234016279'],
                ['Refrigerante 2L', 'Refrigerante cola', 8.99, 100, 'bebidas', 'un', 'https://images.unsplash.com/photo-1554866585-48cedfbf61dd?w=400&h=400&fit=crop&q=80', '7891234017986'],
                ['Água Mineral 1.5L', 'Água mineral sem gás', 2.99, 200, 'bebidas', 'un', 'https://images.unsplash.com/photo-1610485064966-d93e97b78dab?w=400&h=400&fit=crop&q=80', '7891234018693'],
                ['Leite Integral 1L', 'Leite integral UHT', 4.50, 150, 'laticínios', 'un', 'https://images.unsplash.com/photo-1563636619-ce894fbb6b9b?w=400&h=400&fit=crop&q=80', '7891234019400'],
                
                // HORTIFRUTI
                ['Banana Prata (kg)', 'Banana prata extra fresca', 5.99, 250, 'hortifruti', 'kg', 'https://images.unsplash.com/photo-1603643808063-96b991b8b764?w=400&h=400&fit=crop&q=80', '7891234020017'],
                ['Maçã Gala (kg)', 'Maçã gala importada', 9.99, 150, 'hortifruti', 'kg', 'https://images.unsplash.com/photo-1560806715-da9a02842330?w=400&h=400&fit=crop&q=80', '7891234021724'],
                ['Laranja Pêra (kg)', 'Laranja pêra selecionada', 4.99, 200, 'hortifruti', 'kg', 'https://images.unsplash.com/photo-1587735639519-c21a76f6f3b5?w=400&h=400&fit=crop&q=80', '7891234022431'],
                ['Tomate Caqui (kg)', 'Tomate caqui vermelho', 8.99, 120, 'hortifruti', 'kg', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop&q=80', '7891234023148'],
                ['Alface Crespa (un)', 'Alface crespa hidropônica', 3.99, 80, 'hortifruti', 'un', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&q=80', '7891234024855'],
                ['Cenoura (kg)', 'Cenoura fresca selecionada', 3.49, 100, 'hortifruti', 'kg', 'https://images.unsplash.com/photo-1447556519635-367e063ffc0c?w=400&h=400&fit=crop&q=80', '7891234025562'],
                ['Batata Inglesa (kg)', 'Batata inglesa tipo A', 4.99, 150, 'hortifruti', 'kg', 'https://images.unsplash.com/photo-1590594033100-9f60a05a9d82?w=400&h=400&fit=crop&q=80', '7891234026269'],
                ['Cebola (kg)', 'Cebola roxa selecionada', 5.50, 120, 'hortifruti', 'kg', 'https://images.unsplash.com/photo-1597619437267-ff5caebe2556?w=400&h=400&fit=crop&q=80', '7891234027976'],
                
                // PADARIA
                ['Pão Francês (un)', 'Pão francês saído do forno', 0.80, 500, 'padaria', 'un', 'https://images.unsplash.com/photo-1535920527894-b400b62fe660?w=400&h=400&fit=crop&q=80', '7891234028683'],
                ['Além Pastel (6un)', 'Além pastel tradicional', 8.99, 100, 'padaria', 'un', 'https://images.unsplash.com/photo-1616147280519-e788d2354644?w=400&h=400&fit=crop&q=80', '7891234029390'],
                ['Bolo de Chocolate', 'Bolo de chocolate caseiro 500g', 16.90, 50, 'padaria', 'un', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&q=80', '7891234030007'],
                ['Croissant 3un', 'Croissant doce recheado', 12.90, 80, 'padaria', 'un', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop&q=80', '7891234031714'],
                ['Pão Integral 400g', 'Pão integral caseiro', 6.50, 60, 'padaria', 'un', 'https://images.unsplash.com/photo-1586190936945-fc5672b0191e?w=400&h=400&fit=crop&q=80', '7891234032421'],
                ['Biscoito Água e Sal 400g', 'Biscoito integral', 4.99, 100, 'padaria', 'un', 'https://images.unsplash.com/photo-1585080298635-02a3b5ea9d9e?w=400&h=400&fit=crop&q=80', '7891234033128'],
                
                // LATICÍNIOS
                ['Queijo Meia Cura 500g', 'Queijo meia cura fatiado', 28.90, 50, 'laticínios', 'un', 'https://images.unsplash.com/photo-1452195412191-768234609b66?w=400&h=400&fit=crop&q=80', '7891234034835'],
                ['Iogurte Natural 500ml', 'Iogurte natural integral', 7.99, 80, 'laticínios', 'un', 'https://images.unsplash.com/photo-1488477181946-85a2a11afe19?w=400&h=400&fit=crop&q=80', '7891234035542'],
                ['Requeijão 200g', 'Requeijão cremoso', 8.50, 100, 'laticínios', 'un', 'https://images.unsplash.com/photo-1605350322401-197c0e16ca5d?w=400&h=400&fit=crop&q=80', '7891234036249'],
                ['Manteiga 250g', 'Manteiga extra fina', 16.90, 60, 'laticínios', 'un', 'https://images.unsplash.com/photo-1589985643862-16055ee40c6e?w=400&h=400&fit=crop&q=80', '7891234037956'],
                ['Mozzarella 500g', 'Mozzarella fatiada tipo A', 22.90, 70, 'laticínios', 'un', 'https://images.unsplash.com/photo-1626082927389-6cd097cda687?w=400&h=400&fit=crop&q=80', '7891234038663'],
                
                // AÇOUGUE
                ['Carne Moída 1kg', 'Carne moída vermelha fresca', 32.90, 40, 'açougue', 'kg', 'https://images.unsplash.com/photo-1618885472179-c5f1cc44dce5?w=400&h=400&fit=crop&q=80', '7891234039370'],
                ['Contra Filé 1kg', 'Contra filé bovino premium', 48.90, 30, 'açougue', 'kg', 'https://images.unsplash.com/photo-1555939594-58d7cb561d1f?w=400&h=400&fit=crop&q=80', '7891234040077'],
                ['Peito de Frango 1kg', 'Peito de frango congelado', 18.99, 50, 'açougue', 'kg', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop&q=80', '7891234041784'],
                ['Linguiça Calabresa 500g', 'Linguiça calabresa fatiada', 15.90, 40, 'açougue', 'un', 'https://images.unsplash.com/photo-1609975289736-a47a0cd6e83a?w=400&h=400&fit=crop&q=80', '7891234042491'],
                ['Presunto 500g', 'Presunto classe A fatiado', 24.90, 35, 'açougue', 'un', 'https://images.unsplash.com/photo-1585457337503-9ef47acd655c?w=400&h=400&fit=crop&q=80', '7891234043198'],
                
                // LIMPEZA
                ['Sabão em Pó 1kg', 'Sabão em pó para roupa', 12.90, 80, 'limpeza', 'un', 'https://images.unsplash.com/photo-1585829488829-a605c317214d?w=400&h=400&fit=crop&q=80', '7891234044905'],
                ['Detergente Neutro 500ml', 'Detergente neutro concentrado', 3.99, 150, 'limpeza', 'un', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop&q=80', '7891234045612'],
                ['Desinfetante 1L', 'Desinfetante bactérias e vírus', 5.99, 100, 'limpeza', 'un', 'https://images.unsplash.com/photo-1599599810694-b5ac4dd15fcb?w=400&h=400&fit=crop&q=80', '7891234046319'],
                ['Papel Higiênico (4 rolos)', 'Papel higiênico dupla camada', 8.99, 200, 'limpeza', 'un', 'https://images.unsplash.com/photo-1566287621715-4d50a5ca4809?w=400&h=400&fit=crop&q=80', '7891234047026'],
                ['Álcool 70% 1L', 'Álcool 70% para limpeza', 9.90, 80, 'limpeza', 'un', 'https://images.unsplash.com/photo-1599599810694-b5ac4dd15fcb?w=400&h=400&fit=crop&q=80', '7891234048733'],
                ['Pano de Limpeza 3un', 'Pano multiuso para limpeza', 6.50, 120, 'limpeza', 'un', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&q=80', '7891234049440'],
                ['Sabonete Líquido 250ml', 'Sabonete líquido antibacteriano', 4.50, 100, 'limpeza', 'un', 'https://images.unsplash.com/photo-1629460488159-23b992074eae?w=400&h=400&fit=crop&q=80', '7891234050057']
            ];
            produtos.forEach(p => {
                db.run("INSERT INTO produtos (nome, descricao, preco, quantidade, categoria, unidade, imagem, codigo_barras) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", p);
            });
            console.log("Produtos de exemplo inseridos");
        }
    });

    // Inserir categorias de exemplo se não existirem
    db.get("SELECT COUNT(*) as count FROM categorias", (err, row) => {
        if (row.count === 0) {
            const categorias = [
                ['açougue', 'Carnes e derivados'],
                ['hortifruti', 'Frutas, legumes e verduras'],
                ['padaria', 'Pães e bolos'],
                ['bebidas', 'Bebidas em geral'],
                ['mercearia', 'Alimentos secos e artigos diversos'],
                ['laticínios', 'Leite, queijo e derivados'],
                ['limpeza', 'Produtos de limpeza']
            ];
            categorias.forEach(c => {
                db.run("INSERT INTO categorias (nome, descricao, data_criacao) VALUES (?, ?, ?)", 
                    [c[0], c[1], new Date().toISOString()]);
            });
            console.log("Categorias de exemplo inseridas");
        }
    });

    // Inserir promoções padrão se não existirem
    db.get("SELECT COUNT(*) as count FROM promocoes", (err, row) => {
        if (row && row.count === 0) {
            // Esperar um pouco para os produtos serem inseridos
            setTimeout(() => {
                const promocoes = [
                    [1, 3, 68.70, 'Combo Arroz 3 pacotes'], // Arroz 5kg - 3 por 68,70
                    [2, 5, 52.90, 'Combo Feijão 5kg'], // Feijão - 5 por 52,90
                    [7, 6, 35.90, 'Meia dúzia de Pão'], // Pão - 6 por 35,90
                    [15, 4, 32.90, 'Pacote Café 4un'], // Café - 4 por 32,90
                    [18, 5, 26.90, 'Kit Laranja 5kg'], // Laranja - 5kg por 26,90
                    [27, 2, 28.90, 'Duo Queijo'], // Queijo - 2 por 28,90
                    [30, 3, 89.90, 'Trio de Carnes 3kg'], // Carne moída - 3kg por 89,90
                    [34, 6, 49.99, 'Pacote Papel Higiênico'] // Papel - 6 por 49,99
                ];
                promocoes.forEach(p => {
                    db.run("INSERT INTO promocoes (produto_id, quantidade, preco_combo, descricao) VALUES (?, ?, ?, ?)", p);
                });
                console.log("Promoções de exemplo inseridas");
            }, 1000);
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
    db.all("SELECT p.*, prod.nome, prod.imagem FROM promocoes p JOIN produtos prod ON p.produto_id = prod.id WHERE p.ativa = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows || []);
    });
});

// Listar todas as promoções (admin)
app.get('/api/admin/promocoes', (req, res) => {
    db.all("SELECT p.*, prod.nome, prod.imagem FROM promocoes p JOIN produtos prod ON p.produto_id = prod.id ORDER BY p.id DESC", [], (err, rows) => {
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
    const { nome, descricao, preco, quantidade, categoria, unidade, codigo_barras, imagem } = req.body;
    if (!nome || !preco) {
        return res.status(400).json({ erro: "Preencha nome e preço" });
    }
    db.run("INSERT INTO produtos (nome, descricao, preco, quantidade, categoria, unidade, codigo_barras, imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
        [nome, descricao || '', preco, quantidade || 0, categoria || '', unidade || 'un', codigo_barras || '', imagem || null], function(err) {
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
    const { nome, descricao, preco, quantidade, categoria, unidade, codigo_barras, imagem } = req.body;
    const id = req.params.id;
    
    if (imagem) {
        db.run("UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade = ?, categoria = ?, unidade = ?, codigo_barras = ?, imagem = ? WHERE id = ?", 
            [nome, descricao || '', preco, quantidade || 0, categoria || '', unidade || 'un', codigo_barras || '', imagem, id], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ sucesso: true });
        });
    } else {
        db.run("UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade = ?, categoria = ?, unidade = ?, codigo_barras = ? WHERE id = ?", 
            [nome, descricao || '', preco, quantidade || 0, categoria || '', unidade || 'un', codigo_barras || '', id], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ sucesso: true });
        });
    }
});

// Deletar produto (admin)
app.delete('/api/produtos/:id', (req, res) => {
    db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// ==================== CATEGORIAS ====================

// Listar categorias
app.get('/api/categorias', (req, res) => {
    db.all("SELECT * FROM categorias ORDER BY nome ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows || []);
    });
});

// Criar categoria (admin)
app.post('/api/categorias', (req, res) => {
    const { nome, descricao } = req.body;
    if (!nome) {
        return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
    }
    const data = new Date().toISOString();
    db.run("INSERT INTO categorias (nome, descricao, data_criacao) VALUES (?, ?, ?)",
        [nome, descricao || '', data], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ erro: "Categoria já existe" });
            }
            return res.status(500).json({ erro: err.message });
        }
        res.json({ sucesso: true, id: this.lastID });
    });
});

// Atualizar categoria (admin)
app.put('/api/categorias/:id', (req, res) => {
    const { nome, descricao } = req.body;
    const id = req.params.id;
    
    if (!nome) {
        return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
    }
    
    db.run("UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?", 
        [nome, descricao || '', id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ erro: "Categoria já existe" });
            }
            return res.status(500).json({ erro: err.message });
        }
        res.json({ sucesso: true });
    });
});

// Deletar categoria (admin)
app.delete('/api/categorias/:id', (req, res) => {
    const id = req.params.id;
    
    // Verificar se há produtos com essa categoria
    db.get("SELECT COUNT(*) as count FROM produtos WHERE categoria = (SELECT nome FROM categorias WHERE id = ?)", [id], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        
        if (row.count > 0) {
            return res.status(400).json({ erro: "Não é possível deletar. Existem produtos nesta categoria." });
        }
        
        db.run("DELETE FROM categorias WHERE id = ?", [id], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ sucesso: true });
        });
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});