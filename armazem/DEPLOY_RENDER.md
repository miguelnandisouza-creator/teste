# Instruções de Deploy no Render

## ✅ Alterações Feitas para Compatibilidade com Render

1. **Porta dinâmica**: A aplicação agora usa `process.env.PORT` (com fallback para 3000)
2. **Host 0.0.0.0**: O servidor agora escuta em `0.0.0.0` (necessário para Render)
3. **Script de start**: Adicionado no `package.json`
4. **.gitignore**: Criado para evitar commits desnecessários

## 🚀 Passos para Deploy no Render

### 1. Prepare seu repositório Git

```bash
cd c:/Users/Pedro/Desktop/teste_da_IA/teste/armazem
git init
git add .
git commit -m "Initial commit"
```

### 2. Faça push para GitHub

- Crie um repositório no GitHub
- Faça push do seu código: `git remote add origin seu-repo-url && git push -u origin main`

### 3. No Render

- Vá para [render.com](https://render.com)
- Clique em "New +" > "Web Service"
- Conecte seu repositório GitHub
- Configure:
  - **Name**: seu-nome-do-app
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Environment**: Node
  - **Plan**: Free (ou usar plano pago)

### 4. Deploy

- Clique em "Create Web Service"
- Render fará o deploy automaticamente

## ⚠️ IMPORTANTE - Banco de Dados SQLite

No Render, o armazenamento é **efêmero**: arquivos criados são perdidos a cada redeploy ou reinicialização.

**Soluções recomendadas:**

- **PostgreSQL gratuito**: Use o banco de dados PostgreSQL do Render (até 90 dias grátis após criação)
- **MongoDB Atlas**: Banco de dados em nuvem gratuito
- **Supabase**: PostgreSQL com camada gratuita

### Para usar PostgreSQL no Render:

1. No Render, crie um "PostgreSQL" database
2. Instale o driver PostgreSQL: `npm install pg`
3. Altere o código para usar PostgreSQL em vez de SQLite

#### Passo a passo prático

1. No dashboard do Render clique em **New** > **Database** > **Postgres** e siga as instruções para provisionar o banco.
2. Após a criação, copie a _Connection String_ (começa com `postgres://` ou `postgresql://`).
3. Vá para o seu Web Service (o serviço que roda o Node app) > **Settings** > **Environment** > **Environment Variables** e adicione:

- **Key:** `DATABASE_URL`
- **Value:** (cole a connection string do Postgres)

4. No mesmo Web Service, mantenha `Build Command` como `npm install` e `Start Command` como `npm start`.
5. Faça redeploy do Web Service. O app detectará `DATABASE_URL` e usará o Postgres automaticamente.

Comandos locais para testar antes de subir:

```powershell
cd c:/Users/Pedro/Desktop/teste_da_IA/teste/armazem
npm install
npm start
```

Observações:

- O código inclui `ssl: { rejectUnauthorized: false }` para compatibilidade com a connection string do Render.
- Quando o banco Postgres estiver vazio, o servidor irá inserir automaticamente categorias, produtos e promoções de exemplo.
- Se preferir popular manualmente, me avise e eu removo a inserção automática.

## 📝 Variáveis de Ambiente (opcional)

Se precisar de variáveis como API keys, configure na seção "Environment" do Render:

```
NODE_ENV=production
```

## 🔍 Verificar Deploy

- O URL será exibido no painel do Render (ex: `seu-app.onrender.com`)
- Veja os logs em tempo real no dashboard do Render

## ✨ Próximos Passos (Recomendado)

1. Migrar de SQLite para PostgreSQL
2. Adicionar variáveis de ambiente (.env)
3. Implementar rate limiting
4. Adicionar CORS configurável
