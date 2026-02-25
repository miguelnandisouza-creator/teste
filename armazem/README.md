# 🛒 Armazém Parada Obrigatória

E-commerce profissional para supermercado em Tubarão, SC.

## 📁 Estrutura do Projeto

```
armazem/
├── src/                          # Código do servidor
│   └── server.js                # API Express principal
├── public/                       # Arquivos estáticos
│   ├── pages/                   # Páginas HTML
│   │   ├── index.html           # Homepage
│   │   ├── login.html           # Login de clientes
│   │   ├── cadastro.html        # Cadastro de clientes
│   │   ├── admin-login.html     # Login admin
│   │   ├── admin.html           # Painel administrativo
│   │   └── pedido.html          # Página de pedidos
│   └── assets/                  # Imagens e recursos
├── database/                     # Banco de dados
│   └── ecommerce.db             # SQLite database
├── backups/                      # Arquivos de backup
│   └── html/                    # Versões antigas de HTML
├── docs/                         # Documentação
├── package.json                  # Dependências do projeto
└── README.md                     # Este arquivo
```

## 🚀 Como Iniciar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar Servidor

```bash
npm start
```

O servidor rodará em `http://localhost:3000`

## 🔐 Credenciais Padrão

### Admin

- **Usuário**: admin
- **Senha**: admin123

### Clientes

- Criar conta pela página de cadastro

## 📍 Localização

- **Endereço**: R. João Adolfo Corrêa 760, Passo do Gado, Tubarão - SC
- **Telefone**: (48) 99137-7066
- **Horário**: Seg-Sex 8h-20h, Sáb 8h-19h, Dom 8h-12h

## ✨ Recursos Principais

✅ Lojas com 50+ produtos  
✅ Sistema de carrinho com quantidade  
✅ Cadastro de clientes com localização no mapa  
✅ Painel administrativo completo  
✅ Leitor de código de barras (EAN-13)  
✅ Sistema de promoções e descontos  
✅ Upload de imagens de produtos  
✅ Busca de CEP integrada

## 🗄️ API Endpoints

### Produtos

- `GET /api/produtos` - Lista todos os produtos
- `GET /api/produtos/:id` - Detalhes de um produto
- `POST /api/produtos` - Criar novo produto (admin)
- `PUT /api/produtos/:id` - Editar produto (admin)
- `DELETE /api/produtos/:id` - Deletar produto (admin)
- `GET /api/produtos/barras/:codigo` - Buscar por código de barras

### Clientes

- `POST /api/clientes` - Criar novo cliente
- `POST /api/login` - Login de cliente
- `POST /api/admin/login` - Login admin

### Pedidos

- `POST /api/pedidos` - Criar novo pedido
- `GET /api/pedidos/:email` - Pedidos do cliente

### Administrativo

- `GET /api/admin/produtos` - Produtos para admin
- `GET /api/admin/pedidos` - Todos os pedidos
- `GET /api/categorias` - Categorias

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Maps**: Google Maps API
- **Auth**: Session-based

## 📱 Funcionalidades

### Para Clientes

- Navegação por categorias
- Carrinho com quantidade customizável
- Checkout com localização no mapa
- Histórico de pedidos

### Para Admin

- Gerenciamento de produtos
- Upload de imagens
- Leitor de código de barras
- Visualização de pedidos
- Gerenciamento de promoções

## 🎨 Design

Cores principais:

- **Amarelo**: #FFFF00 (Destaque)
- **Preto**: #1a1a1a (Fundo/Texto)

Estilo: Líder Atacadista (supermercado profissional)

## 📝 Notas

- Banco de dados é criado automaticamente na primeira execução
- Imagens de produtos são armazenadas como URLs
- CEP busca integrada com ViaCEP e Google Geocoding
- Mapa interativo para seleção de endereço

---

**Desenvolvido por**: GitHub Copilot  
**Versão**: 1.0.0  
**Última atualização**: 25/02/2026
