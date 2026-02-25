# 📂 Estrutura Completa do Projeto

## Organização de Pastas

```
armazem/
│
├── src/                              # 🔧 Código-fonte do servidor
│   └── server.js                    # API Express principal (562 linhas)
│                                     # - CRUD de produtos
│                                     # - Autenticação (admin + clientes)
│                                     # - Gerenciamento de pedidos
│                                     # - Busca de CEP
│                                     # - Barcode lookup
│
├── public/                           # 📄 Frontend estático
│   ├── pages/                       # HTML das páginas
│   │   ├── index.html               # 🏠 Homepage (1085 linhas)
│   │   │                            # - Listagem de produtos
│   │   │                            # - Banner hero
│   │   │                            # - Carrinho flutuante
│   │   │                            # - Promoções
│   │   │
│   │   ├── login.html               # 👤 Login de clientes
│   │   │                            # - Toggle visibilidade senha
│   │   │                            # - Redirecionamento admin
│   │   │
│   │   ├── cadastro.html            # 📝 Cadastro de clientes (787 linhas)
│   │   │                            # - Google Maps interativo
│   │   │                            # - Geocoding reverso
│   │   │                            # - Busca de CEP
│   │   │
│   │   ├── admin-login.html         # 🔐 Login administrativo
│   │   │                            # - Sistema de 3-cliques
│   │   │
│   │   ├── admin.html               # ⚙️ Painel admin
│   │   │                            # - CRUD de produtos
│   │   │                            # - Leitor de barcode
│   │   │                            # - Upload de imagens
│   │   │                            # - Visualização de pedidos
│   │   │
│   │   └── pedido.html              # 📦 Página de pedidos
│   │
│   └── assets/                      # 🎨 Recursos estáticos
│       └── (imagens, ícones quando necessário)
│
├── database/                         # 🗄️ Banco de dados
│   └── ecommerce.db                # SQLite3 gerado automaticamente
│                                     # Tabelas:
│                                     # - clientes (11 campos)
│                                     # - admins (3 campos)
│                                     # - produtos (9 campos)
│                                     # - pedidos (9 campos)
│                                     # - categorias (2 campos)
│                                     # - promocoes (4 campos)
│
├── backups/                          # 📦 Versões antigas
│   └── html/                        # Backups de HTML antigos
│       ├── index-backup.html        # Backup anterior do index
│       ├── index-old-backup.html    # Backup mais antigo
│       └── index-old-design.html    # Design antigo
│
├── docs/                             # 📚 Documentação
│   └── (usar para adicionar documentação específica)
│
├── DEPLOY_RENDER.md                  # 🚀 Instruções de deploy
├── README.md                         # 📖 Documentação principal
├── STRUCTURE.md                      # 📂 Este arquivo
├── .env.example                      # ⚙️ Exemplo de variáveis
├── .gitignore                        # 🚫 Arquivos ignorados
├── package.json                      # 📦 Dependências (atualizadas)
├── package-lock.json                # 🔒 Lock de dependências
└── node_modules/                    # 📚 Pacotes instalados

```

## 📊 Resumo de Arquivos

| Arquivo          | Tamanho     | Descrição             |
| ---------------- | ----------- | --------------------- |
| server.js        | 562 linhas  | Backend principal     |
| index.html       | 1085 linhas | Homepage              |
| cadastro.html    | 787 linhas  | Cadastro com mapa     |
| admin.html       | ~900 linhas | Painel administrativo |
| login.html       | ~400 linhas | Login cliente         |
| admin-login.html | ~300 linhas | Login admin           |
| pedido.html      | ~300 linhas | Página de pedidos     |

## 🗂️ Mapas de Localização

```javascript
// Estrutura do Banco de Dados

clientes {
  id, nome, email, senha,
  endereco, numero, bairro, cidade, cep,
  latitude, longitude
}

produtos {
  id, nome, descricao, preco,
  quantidade, categoria, unidade,
  codigo_barras, imagem
}

pedidos {
  id, email_cliente, produtos_json,
  total, endereco_entrega,
  status, data
}
```

## 🎯 Fluxo de Dados

```
Cliente
  ↓
[Frontend - index.html] → GET /api/produtos
  ↓
[Backend - server.js] → Query BD
  ↓
[Produtos JSON] → Renderiza página
  ↓
[Carrinho] → POST /api/pedidos
  ↓
[Pedido Criado] → Confirmação
  ↓
[Admin] → Visualiza pedidos
```

## 🔑 Funcionalidades por Arquivo

### server.js

- Express app setup
- SQLite database
- CRUD endpoints
- Autenticação
- Barcode lookup
- CEP search

### index.html

- Product listing
- Shopping cart
- Hero banner
- Promotions
- Product images

### admin.html

- Product management
- Barcode reader
- Image upload (Base64)
- Order tracking
- Admin dashboard

### cadastro.html

- User registration
- Google Maps integration
- Geocoding
- CEP lookup
- Location selection

### login.html / admin-login.html

- Authentication
- Password visibility toggle
- Session management

## 🚀 Próximas Melhorias Sugeridas

1. ✅ Organizar estrutura (FEITO!)
2. ⏳ Adicionar testes unitários (Jest)
3. ⏳ Implementar sistema de logs
4. ⏳ Adicionar validações robustas
5. ⏳ Usar variáveis de ambiente
6. ⏳ Adicionar autenticação JWT
7. ⏳ Implementar cache de produtos
8. ⏳ Adicionar rate limiting

---

**Última atualização**: 25/02/2026  
**Versão estrutura**: 2.0 (organizado)
