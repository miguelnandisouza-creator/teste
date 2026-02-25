# 📚 Guia Completo de Programação - Armazém Parada Obrigatória

## 📖 Índice

1. [Introdução](#introdução)
2. [Como o Projeto Funciona](#como-o-projeto-funciona)
3. [Explicação de Cada Arquivo](#explicação-de-cada-arquivo)
4. [Como Programar - Conceitos Básicos](#como-programar---conceitos-básicos)
5. [Flow de Dados](#flow-de-dados)
6. [Tutorial Passo a Passo](#tutorial-passo-a-passo)

---

## Introdução

Este é um **e-commerce completo** para supermercado. Funciona como:

- 👥 Clientes podem comprar produtos online
- 🛒 Carrinho com quantidade
- 📍 Localização no mapa
- ⚙️ Painel administrativo
- 📊 Gerenciamento de pedidos

**Tecnologias usadas:**

- **Backend**: Node.js + Express (servidor)
- **Frontend**: HTML + CSS + JavaScript (interface web)
- **Banco de Dados**: SQLite (armazena dados)

---

## Como o Projeto Funciona

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO ACESSA O SITE                        │
│             http://localhost:3000/index.html                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
        ┌────────────────────────────────────────────┐
        │    NAVEGADOR CARREGA PÁGINA HTML           │
        │    (index.html, login.html, etc)          │
        └────────────────────┬───────────────────────┘
                             │
                             ↓
       ┌──────────────────────────────────────────────┐
       │  JAVASCRIPT EXECUTA NO NAVEGADOR           │
       │  fetch('/api/produtos') chama o servidor   │
       └──────────────────┬──────────────────────────┘
                          │
                          ↓
        ┌─────────────────────────────────────────────┐
        │   SERVIDOR (src/server.js) PROCESSA       │
        │   - Valida dados                           │
        │   - Acessa banco de dados                  │
        │   - Retorna JSON                           │
        └──────────────────┬────────────────────────┘
                           │
                           ↓
       ┌───────────────────────────────────────────────┐
       │  BANCO DE DADOS (database/ecommerce.db)     │
       │  - Pega dados dos produtos                  │
       │  - Retorna para servidor                    │
       └───────────────────────────────────────────┬──┘
                                                   │
                                                   ↓
                               ┌─────────────────────────────┐
                               │  RESPOSTA JSON ENVIADA AO   │
                               │  NAVEGADOR                  │
                               │  [produto1, produto2, ...]  │
                               └──────────────┬──────────────┘
                                              │
                                              ↓
                                   ┌──────────────────────────┐
                                   │  JAVASCRIPT RENDERIZA    │
                                   │  HTML NA PÁGINA          │
                                   │  (mostra produtos)       │
                                   └──────────────────────────┘
```

---

## Explicação de Cada Arquivo

### 📁 **src/server.js** (562 linhas)

**Para que serve:** É o coração do projeto! Processa todas as requisições.

**O que faz:**

- Cria um servidor Express na porta 3000
- Define rotas (caminhos) de API
- Acessa o banco de dados SQLite
- Valida dados do usuário
- Retorna respostas em JSON

**Linhas importantes:**

```javascript
// LINHA 1-5: IMPORTAÇÕES
// Importa bibliotecas que vamos usar
const express = require("express"); // Servidor web
const sqlite3 = require("sqlite3").verbose(); // Banco dados
const bodyParser = require("body-parser"); // Para ler dados POST
const path = require("path"); // Para trabalhar com caminhos

const app = express(); // Cria aplicação Express
const PORT = 3000; // Porta onde roda

// LINHA 10-12: MIDDLEWARE
// Middleware = código que roda ANTES de processar requisição
app.use(bodyParser.json()); // Lê dados em formato JSON
app.use(express.static(path.join(__dirname, "..", "public"))); // Serve arquivos estáticos (HTML, CSS)

// LINHA 14: BANCO DE DADOS
const db = new sqlite3.Database(
  path.join(__dirname, "..", "database", "ecommerce.db"),
);
// Cria/abre banco de dados SQLite em database/ecommerce.db

// LINHA 17-60: CRIAR TABELAS
db.serialize(() => {
  // CREATE TABLE = cria tabela no banco (só cria uma vez)

  // TABELA DE CLIENTES
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  // ID único (1, 2, 3...)
    nome TEXT,                              // Nome do cliente
    email TEXT UNIQUE,                      // Email (sem duplicatas)
    senha TEXT,                             // Senha criptografada
    endereco TEXT,                          // Rua
    numero TEXT,                            // Número da casa
    bairro TEXT,                            // Bairro
    cidade TEXT,                            // Cidade
    cep TEXT,                               // CEP
    latitude REAL,                          // Localização GPS
    longitude REAL                          // Localização GPS
  )`);

  // TABELA DE PRODUTOS
  db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   // ID único
    nome TEXT,                              // Nome do produto
    descricao TEXT,                         // Descrição
    preco REAL,                             // Preço (12.50, 5.99, etc)
    quantidade INTEGER,                     // Quantos tem em estoque
    categoria TEXT,                         // Grupo (bebidas, mercearia, etc)
    unidade TEXT,                           // Un. de venda (kg, L, etc)
    codigo_barras TEXT UNIQUE,              // Código EAN-13
    imagem LONGTEXT                         // URL da foto
  )`);

  // ... outras tabelas (pedidos, categorias, promocoes, admins)
});

// LINHA 120+: ROTAS/ENDPOINTS
// Rota = um caminho que o cliente pode acessar

// EXEMPLO ROTA 1: GET (LER)
app.get("/api/produtos", (req, res) => {
  // GET = só ler (sem modificar nada)
  // /api/produtos = o caminho (URL)

  db.all("SELECT * FROM produtos", (err, rows) => {
    // SELECT * = pega TODOS os campos
    // FROM produtos = da tabela 'produtos'

    if (err) {
      res.status(500).json({ erro: err.message });
      // Se erro: retorna código 500 (erro do servidor)
    } else {
      res.json(rows); // Sucesso: retorna array de produtos
    }
  });
});

// EXEMPLO ROTA 2: POST (CRIAR)
app.post("/api/produtos", (req, res) => {
  // POST = enviar dados (criar algo novo)

  const {
    nome,
    descricao,
    preco,
    quantidade,
    categoria,
    unidade,
    codigo_barras,
    imagem,
  } = req.body;
  // Extrai dados enviados pelo cliente

  const sql = `INSERT INTO produtos 
    (nome, descricao, preco, quantidade, categoria, unidade, codigo_barras, imagem)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  // INSERT = adiciona novo registro
  // VALUES (?, ?, ?) = ? são placeholders (segurança contra SQL injection)

  db.run(
    sql,
    [
      nome,
      descricao,
      preco,
      quantidade,
      categoria,
      unidade,
      codigo_barras,
      imagem,
    ],
    function (err) {
      if (err) {
        res.status(400).json({ erro: err.message });
      } else {
        res.json({
          sucesso: true,
          id: this.lastID, // ID do novo produto criado
        });
      }
    },
  );
});

// EXEMPLO ROTA 3: PUT (EDITAR)
app.put("/api/produtos/:id", (req, res) => {
  // PUT = modificar algo existente
  // :id = parâmetro (exemplo: /api/produtos/5 = editar produto 5)

  const id = req.params.id; // Pega o ID da URL
  const { nome, descricao, preco } = req.body;

  const sql =
    "UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?";
  // UPDATE = modifica registro existente
  // WHERE id = ? = mas APENAS o produto com esse ID

  db.run(sql, [nome, descricao, preco, id], function (err) {
    if (err) {
      res.status(400).json({ erro: err.message });
    } else {
      res.json({ sucesso: true });
    }
  });
});

// EXEMPLO ROTA 4: DELETE (DELETAR)
app.delete("/api/produtos/:id", (req, res) => {
  // DELETE = remover registro

  const id = req.params.id;
  db.run("DELETE FROM produtos WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(400).json({ erro: err.message });
    } else {
      res.json({ sucesso: true });
    }
  });
});

// LINHA 555: INICIAR SERVIDOR
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  // Começa a escutar requisições
});
```

---

### 📄 **public/index.html** (1085 linhas)

**Para que serve:** Página inicial do site (homepage).

**O que mostra:**

- Header com logo
- Navegação (menu)
- Produtos em cards
- Carrinho flutuante
- Banner com ofertas

**Estrutura básica:**

```html
<!-- LINHA 1: DOCTYPE -->
<!DOCTYPE html>
<!-- Diz que é um arquivo HTML5 -->

<!-- LINHA 2: Abertura da página -->
<html lang="pt-BR">
  <!-- lang = idioma (português)

<!-- LINHA 3-6: HEAD (cabeça da página) -->
  <head>
    <meta charset="UTF-8" />
    <!-- Usa caracteres acentuados -->
    <meta name="viewport" ... />
    <!-- Faz funcionar no celular -->
    <title>Loja - Armazém</title>
    <!-- Título da aba -->
    <link rel="stylesheet" ... />
    <!-- Importa CSS (estilos) -->
  </head>

  <!-- LINHA 7: BODY (corpo da página) -->
  <body>
    <!-- Tudo que aparece na tela fica aqui -->

    <!-- HEADER (topo) -->
    <header>
      <h1>🛒 Armazém Parada Obrigatória</h1>
      <p>Bem-vindo à nossa loja!</p>
    </header>

    <!-- NAV (navegação/menu) -->
    <nav>
      <a href="index.html">Início</a>
      <a href="login.html">Login</a>
      <a href="cadastro.html">Cadastro</a>
    </nav>

    <!-- MAIN (conteúdo principal) -->
    <main>
      <h2>Nossos Produtos</h2>
      <div id="produtos">
        <!-- Aqui o JavaScript coloca os produtos dinamicamente -->
      </div>
    </main>

    <!-- SCRIPT JavaScript -->
    <script>
      // Carrega produtos quando página abre
      async function carregarProdutos() {
        const response = await fetch("/api/produtos"); // Pede ao servidor
        const produtos = await response.json(); // Recebe array de produtos

        // Para cada produto, cria um card HTML
        produtos.forEach((produto) => {
          const card = document.createElement("div");
          card.innerHTML = `
          <h3>${produto.nome}</h3>
          <p>${produto.descricao}</p>
          <p>R$ ${produto.preco}</p>
          <button onclick="adicionarCarrinho(${produto.id})">Comprar</button>
        `;
          document.getElementById("produtos").appendChild(card);
          // appendChild = adiciona como filho
        });
      }

      // Executa quando página carrega
      window.addEventListener("load", carregarProdutos);
    </script>
  </body>
</html>
```

**Conceitos importantes:**

- `<div>` = caixa para agrupar elementos
- `<button>` = botão clicável
- `id="..."` = identificador único
- `class="..."` = grupo de estilos
- `fetch()` = faz requisição HTTP ao servidor
- `addEventListener` = aguarda evento (clique, carregar página, etc)

---

### 📄 **public/login.html**

**Para que serve:** Página onde cliente faz login.

**O que tem:**

- Campo de email
- Campo de senha (com toggle 👁️)
- Botão de login
- Link para cadastro

**Fluxo:**

1. Usuário digita email e senha
2. Clica "Entrar"
3. JavaScript envia para `/api/login` (POST)
4. Se correto: salva no localStorage e redireciona
5. Se errado: mostra erro

```javascript
// Código da submissão
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita enviar formulário normalmente

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const response = await fetch("/api/login", {
    method: "POST", // POST = enviar dados
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }), // Converte para JSON
  });

  const data = await response.json();

  if (data.sucesso) {
    localStorage.setItem("cliente", JSON.stringify(data.cliente)); // Salva na memória
    window.location.href = "index.html"; // Vai para homepage
  } else {
    alert("Erro: " + data.erro);
  }
});

// Toggle visibilidade senha
function toggleSenha() {
  const campo = document.getElementById("senha");
  campo.type = campo.type === "password" ? "text" : "password";
  // Se é password (escondido), fica text (visível)
  // Se é text (visível), fica password (escondido)
}
```

---

### 📄 **public/cadastro.html** (787 linhas)

**Para que serve:** Página para criar nova conta.

**O que faz:**

- Campos: nome, email, senha, endereço
- Integração com Google Maps
- Busca de CEP
- Localização no mapa
- Salva cliente no banco

**Partes importantes:**

```javascript
// GOOGLE MAPS INTEGRATION
function initMap() {
  // Cria mapa
  const defaultLocation = { lat: -28.4842, lng: -49.0056 }; // Tubarão, SC

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: defaultLocation,
  });

  // Adiciona marcador
  marker = new google.maps.Marker({
    map: map,
    position: defaultLocation,
    draggable: true, // Pode arrastar
  });

  // Quando clica no mapa
  map.addListener("click", (e) => {
    marker.setPosition(e.latLng); // Move marcador
    latitude = e.latLng.lat();
    longitude = e.latLng.lng();
  });
}

// GEOCODING REVERSO (pega endereço de coordenadas)
async function obterEndereco(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
  );
  const data = await response.json();

  // Preenche campos automaticamente
  document.getElementById("endereco").value = data.address.road;
  document.getElementById("bairro").value = data.address.suburb;
  document.getElementById("cidade").value = data.address.city;
}

// SUBMISSÃO DO CADASTRO
document
  .getElementById("formCadastro")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const cliente = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      senha: document.getElementById("senha").value,
      endereco: document.getElementById("endereco").value,
      numero: document.getElementById("numero").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      cep: document.getElementById("cep").value,
      latitude: latitude,
      longitude: longitude,
    };

    const response = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    const result = await response.json();

    if (result.sucesso) {
      alert("Cadastro realizado!");
      window.location.href = "login.html";
    } else {
      alert("Erro: " + result.erro);
    }
  });
```

---

### 📄 **public/admin.html**

**Para que serve:** Painel administrativo (gerenciar loja).

**O que pode fazer:**

- Adicionar/editar/deletar produtos
- Upload de imagens
- Ler código de barras
- Ver pedidos

**Seções principais:**

```html
<!-- MODAL ADICIONAR PRODUTO -->
<div id="modalProduto" class="modal">
  <div class="modal-content">
    <h2>Adicionar Produto</h2>

    <input type="text" id="nomeProduto" placeholder="Nome" />
    <input type="text" id="descProduto" placeholder="Descrição" />
    <input type="number" id="precoProduto" placeholder="Preço" />
    <input type="number" id="qtdProduto" placeholder="Quantidade" />
    <input type="text" id="categoriaProduto" placeholder="Categoria" />
    <input type="file" id="imagemProduto" accept="image/*" />

    <button onclick="salvarProduto()">Salvar Produto</button>
  </div>
</div>

<!-- LEITOR DE BARCODE -->
<div class="barcode-section">
  <input type="text" id="leituraBarras" placeholder="Leia o código..." />
  <button onclick="processarBarcode()">Procesar</button>
</div>

<!-- LISTA DE PRODUTOS -->
<table id="tabelaProdutos">
  <tr>
    <th>ID</th>
    <th>Nome</th>
    <th>Preço</th>
    <th>Ações</th>
  </tr>
  <!-- Preenchida por JavaScript -->
</table>
```

**JavaScript do admin:**

```javascript
// CARREGAR PRODUTOS
async function carregarProdutos() {
  const response = await fetch("/api/admin/produtos");
  const produtos = await response.json();

  const tabela = document.getElementById("tabelaProdutos");

  // Limpa tabela
  tabela.innerHTML =
    "<tr><th>ID</th><th>Nome</th><th>Preço</th><th>Ações</th></tr>";

  // Adiciona cada produto como linha
  produtos.forEach((p) => {
    const linha = tabela.insertRow();
    linha.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>R$ ${p.preco}</td>
      <td>
        <button onclick="editarProduto(${p.id})">Editar</button>
        <button onclick="deletarProduto(${p.id})">Deletar</button>
      </td>
    `;
  });
}

// ADICIONAR PRODUTO
async function salvarProduto() {
  const nome = document.getElementById("nomeProduto").value;
  const descricao = document.getElementById("descProduto").value;
  const preco = document.getElementById("precoProduto").value;
  const quantidade = document.getElementById("qtdProduto").value;
  const categoria = document.getElementById("categoriaProduto").value;

  // Ler imagem como Base64 (texto)
  const fileInput = document.getElementById("imagemProduto");
  let imagemBase64 = "";

  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      imagemBase64 = e.target.result; // Imagem em texto

      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          descricao,
          preco,
          quantidade,
          categoria,
          imagem: imagemBase64,
        }),
      });

      const result = await response.json();
      if (result.sucesso) {
        alert("Produto adicionado!");
        carregarProdutos(); // Recarrega lista
      }
    };
    reader.readAsDataURL(fileInput.files[0]); // Lê arquivo como Data URL
  }
}

// DELETAR PRODUTO
async function deletarProduto(id) {
  if (confirm("Tem certeza?")) {
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    carregarProdutos();
  }
}

// LER CÓDIGO DE BARRAS
function processarBarcode() {
  const codigo = document.getElementById("leituraBarras").value;

  fetch(`/api/produtos/barras/${codigo}`)
    .then((r) => r.json())
    .then((produto) => {
      // Preenche formulário com dados do produto
      document.getElementById("nomeProduto").value = produto.nome;
      document.getElementById("precoProduto").value = produto.preco;
      // ... outros campos
    })
    .catch((e) => alert("Produto não encontrado"));
}
```

---

### 📊 **database/ecommerce.db**

**Para que serve:** Armazena todos os dados.

**Tabelas:**

```
clientes
├── id (1, 2, 3, ...)
├── nome ("João Silva")
├── email ("joao@email.com")
├── senha ("hashed_pwd_123")
├── endereco ("Rua A")
├── numero ("123")
├── bairro ("Centro")
├── cidade ("Tubarão")
├── cep ("88015")
├── latitude (-28.4842)
└── longitude (-49.0056)

produtos
├── id (1, 2, 3, ...)
├── nome ("Arroz 5kg")
├── descricao ("Arroz integral de alta qualidade")
├── preco (25.90)
├── quantidade (150)  // em estoque
├── categoria ("Mercearia")
├── unidade ("kg")
├── codigo_barras ("7891234001234")  // EAN-13
└── imagem ("data:image/png;base64,...")  // Base64

pedidos
├── id (1, 2, 3, ...)
├── email_cliente ("joao@email.com")
├── produtos_json ("[{id:1, nome:'Arroz', qtd:2, preco:25.90}]")
├── total (51.80)
├── endereco_entrega ("Rua A, 123, Centro, Tubarão")
└── status ("pendente", "entregue", etc)

categorias
├── id (1, 2, 3, ...)
└── nome ("Mercearia", "Bebidas", "Hortifruti", ...)

promocoes
├── id (1, 2, 3, ...)
├── nome ("Black Friday")
├── desconto (30)  // percentual
└── produtos_json ("[1, 2, 3]")  // IDs dos produtos

admins
├── id (1)
├── usuario ("admin")
└── senha ("admin123")
```

---

## Como Programar - Conceitos Básicos

### 1️⃣ **Variáveis** (guardam dados)

```javascript
// Criar variável
let nome = "João"; // Texto
let idade = 25; // Número
let ativo = true; // Booleano (sim/não)
let produtos = [1, 2, 3]; // Array (lista)
let cliente = {
  nome: "João",
  email: "joao@email.com",
}; // Objeto

// Usar variável
console.log(nome); // Mostra no console
nome = "Maria"; // Muda o valor
```

### 2️⃣ **Funções** (bloco de código reutilizável)

```javascript
// Função simples
function saudacoes() {
  console.log("Olá!");
}
saudacoes(); // Executa

// Função com parâmetro
function somar(a, b) {
  return a + b; // Retorna resultado
}
console.log(somar(5, 3)); // Imprime 8

// Função assíncrona (espera resultado)
async function buscarProdutos() {
  const response = await fetch("/api/produtos");
  // await = aguarda resposta
  const dados = await response.json();
  return dados;
}
```

### 3️⃣ **Condicional** (se isso, faz aquilo)

```javascript
let idade = 25;

if (idade >= 18) {
  console.log("Maior de idade");
} else if (idade >= 13) {
  console.log("Adolescente");
} else {
  console.log("Menor");
}

// Operadores:
// == igua (2 == 2 = true)
// !=l diferente (2 != 3 = true)
// > maior
// < menor
// >= maior ou igual
// <= menor ou igual
```

### 4️⃣ **Loop** (repetir código)

```javascript
// FOR (repetir X vezes)
for (let i = 0; i < 5; i++) {
  console.log(i); // Imprime 0, 1, 2, 3, 4
}

// WHILE (enquanto condição for verdadeira)
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}

// FOREACH (em cada item do array)
let produtos = ["Arroz", "Feijão", "Óleo"];
produtos.forEach((produto) => {
  console.log(produto);
});
```

### 5️⃣ **Eventos** (React a algo)

```javascript
// Clique no botão
const botao = document.getElementById("meuBotao");
botao.addEventListener("click", () => {
  console.log("Botão clicado!");
});

// Quando página carrega
window.addEventListener("load", () => {
  console.log("Página carregou!");
});

// Submit de formulário
const form = document.getElementById("meuForm");
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Evita recarregar página
  console.log("Form enviado!");
});
```

### 6️⃣ **Fetch** (fazer requisição ao servidor)

```javascript
// GET (buscar dados)
fetch("/api/produtos")
  .then((response) => response.json()) // Converte para JSON
  .then((dados) => console.log(dados)) // Recebe dados
  .catch((erro) => console.log(erro)); // Se algo dá errado

// POST (enviar dados)
fetch("/api/login", {
  method: "POST", // Tipo de requisição
  headers: { "Content-Type": "application/json" }, // Tipo de conteúdo
  body: JSON.stringify({ email, senha }), // Dados a enviar
})
  .then((response) => response.json())
  .then((dados) => console.log(dados))
  .catch((erro) => console.log(erro));

// PUT (atualizar dados)
fetch(`/api/produtos/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Novo nome" }),
});

// DELETE (deletar dados)
fetch(`/api/produtos/${id}`, {
  method: "DELETE",
});
```

---

## Flow de Dados

```
┌─────────────────────────────┐
│   Cliente abre index.html    │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ JavaScript carrega página   │
│ (fetch('/api/produtos'))    │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ Servidor recebe requisição  │
│ GET /api/produtos           │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ Server executa:             │
│ SELECT * FROM produtos      │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ Banco de dados retorna      │
│ [produto1, produto2, ...]   │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ Server envia JSON            │
└──────────┬──────────────────┘
           │
           ↓
┌─────────────────────────────┐
│ JavaScript recebe e renderiza│
│ Loop: adiciona cada produto │
│ na página com HTML dinamico │
└─────────────────────────────┘
```

---

## Tutorial Passo a Passo

### 🎯 **Objetivo:** Adicionar um novo tipo de produto

#### Passo 1: Adicionar campo no cadastro (admin.html)

```html
<!-- Em public/admin.html, na seção de formulário -->
<input type="text" id="fabricante" placeholder="Fabricante" />
```

#### Passo 2: Alterar banco de dados (server.js)

```javascript
// Editar a CREATE TABLE de produtos
db.run(`CREATE TABLE IF NOT EXISTS produtos (
  ...
  fabricante TEXT,  // ← Nova coluna
  ...
)`);
```

#### Passo 3: Atualizar POST (server.js)

```javascript
app.post("/api/produtos", (req, res) => {
  const { nome, descricao, preco, fabricante } = req.body; // ← Novo

  const sql = `INSERT INTO produtos 
    (nome, descricao, preco, fabricante)  // ← Novo
    VALUES (?, ?, ?, ?)`;

  db.run(sql, [nome, descricao, preco, fabricante], function (err) {
    if (err) {
      res.status(400).json({ erro: err.message });
    } else {
      res.json({ sucesso: true, id: this.lastID });
    }
  });
});
```

#### Passo 4: Atualizar PUT (server.js)

```javascript
app.put("/api/produtos/:id", (req, res) => {
  const id = req.params.id;
  const { nome, descricao, preco, fabricante } = req.body; // ← Novo

  const sql =
    "UPDATE produtos SET nome = ?, descricao = ?, preco = ?, fabricante = ? WHERE id = ?"; // ← Novo

  db.run(sql, [nome, descricao, preco, fabricante, id], function (err) {
    // ← Novo
    if (err) {
      res.status(400).json({ erro: err.message });
    } else {
      res.json({ sucesso: true });
    }
  });
});
```

#### Passo 5: Atualizar JavaScript (admin.html)

```javascript
async function salvarProduto() {
  const nome = document.getElementById("nomeProduto").value;
  const descricao = document.getElementById("descProduto").value;
  const preco = document.getElementById("precoProduto").value;
  const fabricante = document.getElementById("fabricante").value; // ← Novo

  const response = await fetch("/api/produtos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      descricao,
      preco,
      fabricante, // ← Novo
    }),
  });

  const result = await response.json();
  if (result.sucesso) {
    alert("Produto adicionado!");
  }
}
```

---

## Resumo Rápido

| Arquivo          | O quê         | Onde      |
| ---------------- | ------------- | --------- |
| server.js        | API/Backend   | src/      |
| index.html       | Homepage      | public/   |
| login.html       | Login cliente | public/   |
| cadastro.html    | Cadastro      | public/   |
| admin-login.html | Login admin   | public/   |
| admin.html       | Painel admin  | public/   |
| ecommerce.db     | Banco dados   | database/ |

| Conceito         | Para quê           | Exemplo                              |
| ---------------- | ------------------ | ------------------------------------ |
| GET              | Buscar dados       | /api/produtos                        |
| POST             | Criar data         | /api/clientes                        |
| PUT              | Editar dados       | /api/produtos/5                      |
| DELETE           | Apagar dados       | /api/produtos/5                      |
| await            | Aguardar resultado | await fetch(...)                     |
| async            | Função assíncrona  | async function() {}                  |
| forEach          | Repetir em array   | array.forEach(x => {})               |
| addEventListener | Ouvir evento       | botao.addEventListener('click', ...) |

---

## 🚀 Próximos Passos

1. **Entender HTML**: Leia sobre tags (`<div>`, `<button>`, `<input>`, etc)
2. **Aprender CSS**: Estilizar elementos (cores, tamanhos, posições)
3. **JavaScript avançado**: Promises, async/await, arrow functions
4. **Backend**: Routes, middleware, autenticação
5. **Banco de dados**: SQL, índices, relacionamentos

---

**Criado em**: 25/02/2026  
**Versão**: 1.0  
**Autor**: GitHub Copilot
