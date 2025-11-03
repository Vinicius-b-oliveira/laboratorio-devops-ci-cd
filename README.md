# Laboratório DevOps: Pipeline CI/CD com GitLab CE

Este projeto é um laboratório acadêmico para a disciplina de GERENCIAMENTO, CONFIGURAÇÃO E PROCESSOS DE SOFTWARE, demonstrando um fluxo completo de CI/CD utilizando uma stack open-source e auto-hospedada (self-hosted).

O objetivo é simular um ambiente corporativo onde o código-fonte é versionado, validado por testes unitários, publicado (build), e executado (deploy) de forma totalmente automatizada.

## 1. Equipe

- Bernardo Wehmuth
- João Vitor Dal-Ri
- João Vitor Círico
- Nicolas Soares Oliveira
- Otávio Augusto dos Santos
- Vinícius Bueno de Oliveira

## 2. Stack Utilizada (A "Fábrica")

- **Aplicação (O "Produto"):** Node.js + Express (Uma API REST minimalista).
- **Plataforma DevOps (Tudo-em-Um):** GitLab Community Edition (CE)
- **Executor de Pipeline (O "Operário"):** GitLab Runner
- **Infraestrutura (A "Base"):** Docker e Docker Compose

### Justificativa das Escolhas

A escolha central da stack foi o **GitLab Community Edition (CE)** como plataforma DevOps.

1.  **Open-Source e Auto-Hospedável:** Atende ao requisito de não usar ferramentas SaaS.
2.  **Solução "Tudo-em-Um":** Esta foi a maior vantagem estratégica. O GitLab CE entrega, em uma única instalação, as três necessidades do projeto:
    - **Repositório Git:** Um servidor Git completo (alternativa ao Gitea).
    - **Pipeline de CI/CD:** O GitLab CI, um sistema de pipeline robusto configurado pelo `.gitlab-ci.yml`.
    - **Container Registry:** Um registro de imagens Docker embutido e integrado ao projeto.

## 3. Arquitetura do Fluxo

O fluxo de automação configurado segue o diagrama abaixo:

```mermaid
graph LR
    A[Developer] -->|git push| B[GitLab CE]
    B -->|Trigger Pipeline| C[GitLab Runner]
    C -->|Stage: build| D[docker build + npm test]
    D -->|Stage: push| E[GitLab Container Registry]
    E -->|Stage: deploy| F[docker pull + run]
    F -->|Porta 8081:3000| G[API em Execução]
```

**Fluxo detalhado:**

1. **Developer** realiza `git push` para o repositório
2. **GitLab CE** detecta o push e dispara o pipeline CI/CD
3. **GitLab Runner** executa os stages definidos no `.gitlab-ci.yml`:
   - **build:** Constrói a imagem Docker e executa testes unitários (`npm test`)
   - **push:** Autentica no GitLab Container Registry e publica a imagem
   - **deploy:** Baixa a imagem do registry e executa o container na porta 8081 (mapeada para a porta 3000 interna)

## 4. Como Reproduzir o Ambiente de DevOps

Este repositório está dividido em duas partes principais:

1. **`lab-devops-infra`**: Contém o `docker-compose.yml` para subir a "fábrica" (GitLab CE e GitLab Runner).
2. **`lab-api-devops`**: Contém o código-fonte da aplicação Node.js, seu `Dockerfile` e o script de pipeline `.gitlab-ci.yml`.

### 4.1. Pré-requisitos

- Docker e Docker Compose instalados
- Uma máquina com pelo menos **8GB de RAM** (recomendado)
- Sistema operacional Linux ou macOS (para acesso ao `/etc/hosts`)

### 4.2. Subir a Infraestrutura (GitLab + Runner)

1. Navegue até a pasta de infraestrutura:

   ```bash
   cd lab-devops-infra
   ```

2. Suba os containers do GitLab e Runner:

   ```bash
   docker compose up -d
   ```

   > ⚠️ **Importante:** Aguarde alguns minutos (5-10 min) para o GitLab inicializar completamente antes de prosseguir.

### 4.3. Configurar o DNS Local

Adicione a seguinte linha ao seu arquivo `/etc/hosts` para resolver o hostname localmente:

```
127.0.0.1   gitlab.local
```

**Como editar:**

- **Linux/macOS:** `sudo nano /etc/hosts`
- **Windows:** Edite `C:\Windows\System32\drivers\etc\hosts` como Administrador

### 4.4. Acessar e Configurar o GitLab

1. Acesse `http://gitlab.local` no seu navegador.

2. Obtenha a senha inicial do usuário `root`:

   ```bash
   docker compose exec gitlab cat /etc/gitlab/initial_root_password
   ```

3. Faça login com:

   - **Usuário:** `root`
   - **Senha:** (senha obtida no passo anterior)

4. **Altere a senha** após o primeiro login para algo de sua preferência.

### 4.5. Configurar e Registrar o Runner

1. No GitLab, acesse a **Admin Area** (ícone de chave inglesa no menu lateral).

2. Navegue para **CI/CD** > **Runners**.

3. Clique no botão azul **New instance runner**.

4. Configure o runner:

   - Adicione a tag `docker` (obrigatória)
   - Clique em **Create runner**

5. Na página seguinte, **copie o token de autenticação** (formato: `glrt-...`).

6. De volta ao terminal, prepare o arquivo de configuração:

   ```bash
   # Certifique-se de estar na pasta lab-devops-infra
   cd lab-devops-infra

   # Copie o arquivo de exemplo
   cp config-runner.toml-exemplo config.toml

   # Edite o arquivo
   nano config.toml
   ```

7. No editor `nano`:

   - Localize a linha: `token = "COLE_O_TOKEN_GERADO_PELA_UI_AQUI"`
   - **Substitua** o placeholder pelo token copiado (ex: `glrt-abc123...`)
   - Salve e feche: `Ctrl+O`, `Enter`, `Ctrl+X`

8. Copie o arquivo para dentro do container e reinicie o runner:

   ```bash
   # Copia o arquivo de configuração
   docker cp config.toml gitlab-runner:/etc/gitlab-runner/config.toml

   # Reinicia o runner
   docker compose restart gitlab-runner

   # (Opcional) Limpa o arquivo temporário
   rm config.toml
   ```

9. **Verificação:**
   - Volte para **Admin Area** > **Runners** no GitLab
   - O status do runner deve aparecer com uma **bolinha verde** 🟢 em alguns segundos
   - Isso indica que o runner está online e pronto para executar pipelines

### 4.6. Criar e Configurar o Projeto da Aplicação

1. No GitLab, clique em **New project** > **Create blank project**.

2. Configure o projeto:

   - **Project name:** `lab-devops` (ou nome de sua preferência)
   - **Visibility Level:** Público ou Privado
   - **Initialize repository with a README:** Deixe desmarcado
   - Clique em **Create project**

3. Anote a URL do repositório (ex: `http://gitlab.local/root/lab-devops.git`)

### 4.7. Subir o Código da Aplicação

1. Navegue até a pasta da aplicação:

   ```bash
   cd ../lab-api-devops
   ```

2. Inicialize o repositório Git e envie o código:

   ```bash
   git init
   git remote add origin http://gitlab.local/root/lab-devops.git
   git add .
   git commit -m "Commit inicial: API Node.js com pipeline CI/CD"
   git push -u origin main
   ```

3. **Pipeline Automático:**
   - Após o push, o pipeline será **executado automaticamente**
   - Acesse o projeto no GitLab e vá em **CI/CD** > **Pipelines** para acompanhar

### 4.8. Entendendo o Pipeline

O arquivo `.gitlab-ci.yml` define três stages que são executados sequencialmente:

#### **Stage 1: Build**

- Constrói a imagem Docker usando o `Dockerfile`
- Durante o build, os testes unitários são executados (`RUN npm test` no Dockerfile)
- Se os testes falharem, o pipeline para aqui
- A imagem é taggeada com o hash do commit e com `latest`

#### **Stage 2: Push**

- Autentica no GitLab Container Registry
- Publica a imagem testada no registry interno
- Só executa se o stage de build for bem-sucedido
- Só executa na branch `main`

#### **Stage 3: Deploy**

- Autentica no registry para fazer pull da imagem
- Para e remove o container anterior (se existir)
- Baixa a imagem mais recente do registry
- Inicia um novo container na **porta 8081** do host (mapeada para porta 3000 interna)
- O container fica acessível em `http://localhost:8081`

### 4.9. Verificação Final

Após o pipeline ficar 100% verde (✅), verifique se a API está rodando:

```bash
curl http://localhost:8081
```

**Saída esperada:**

```json
{ "message": "Pipeline N3 com Testes e Deploy!", "versao": "1.1.0" }
```

Você também pode testar os outros endpoints:

```bash
# Listar usuários
curl http://localhost:8081/users

# Buscar usuário específico
curl http://localhost:8081/users/1
```

## 5. Estrutura do Projeto

### 5.1. Aplicação (`lab-api-devops`)

- **`server.js`**: Código da API Express com 3 endpoints REST:
  - `GET /`: Retorna mensagem de boas-vindas e versão da API
  - `GET /users`: Lista todos os usuários cadastrados
  - `GET /users/:id`: Busca um usuário específico por ID
- **`server.test.js`**: Testes unitários com Jest e Supertest (cobertura completa dos endpoints)
- **`package.json`**: Dependências (Express) e dependências de desenvolvimento (Jest, Supertest)
- **`Dockerfile`**: Build multi-stage da aplicação:
  1. **builder**: Instala dependências e executa testes
  2. **pruner**: Remove dependências de desenvolvimento
  3. **runtime**: Imagem final otimizada com apenas o necessário para produção
- **`.gitlab-ci.yml`**: Pipeline CI/CD com 3 stages (build, push, deploy)

### 5.2. Infraestrutura (`lab-devops-infra`)

- **`docker-compose.yml`**: Orquestração do GitLab CE e GitLab Runner
- **`config-runner.toml-exemplo`**: Template de configuração do Runner

### 5.3. Pipeline CI/CD

O arquivo `.gitlab-ci.yml` implementa:

- **Variáveis de ambiente**:
  - `IMAGE_TAG`: Tag da imagem com o hash do commit (`$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA`)
  - `IMAGE_LATEST`: Tag latest da imagem (`$CI_REGISTRY_IMAGE:latest`)
  - `APP_CONTAINER_NAME`: Nome do container da aplicação (`lab-api-n3`)
- **Regras de execução**: Pipeline ativado em merge requests e na branch `main`
- **Docker-in-Docker (DooD)**: Runner compartilha o socket Docker do host (`/var/run/docker.sock`)
- **Registry integrado**: Imagens armazenadas no GitLab Container Registry
- **Tags obrigatórias**: Todos os jobs usam a tag `docker` para serem executados pelo runner configurado

## 6. Troubleshooting

### Runner não aparece online (bolinha vermelha ou cinza)

**Possíveis causas:**

- Token incorreto no arquivo `config.toml`
- Runner não foi reiniciado após a configuração
- Problemas de conectividade com o GitLab

**Solução:**

```bash
# Verifique os logs do runner
docker logs gitlab-runner

# Reinicie o runner
docker compose restart gitlab-runner
```

### Pipeline falha no stage de build

**Possíveis causas:**

- Testes unitários falhando
- Problemas de conectividade para baixar dependências do npm

**Solução:**

```bash
# Execute os testes localmente para depurar
cd lab-api-devops
npm install
npm test
```

### Pipeline falha no stage de deploy

**Possíveis causas:**

- Porta 8081 já está em uso
- Permissões insuficientes para acessar o Docker socket

**Solução:**

```bash
# Verifique se a porta está em uso
sudo lsof -i :8081

# Se necessário, pare o container anterior
docker stop lab-api-n3
docker rm lab-api-n3
```

### Não consigo acessar `http://gitlab.local`

**Possíveis causas:**

- Arquivo `/etc/hosts` não foi configurado corretamente
- GitLab ainda está inicializando

**Solução:**

```bash
# Verifique se o GitLab está rodando
docker ps | grep gitlab

# Verifique os logs do GitLab
docker logs gitlab

# Aguarde a mensagem de que o GitLab está pronto (pode levar 5-10 minutos)
```

## 7. Slides da Apresentação

Os slides utilizados na apresentação estão disponíveis no Canva:
[Link para os Slides da Apresentação](https://www.canva.com/design/DAG2p6XqZjo/-PsIE6zcCgx_J2vAv4qqLQ/view?utm_content=DAG2p6XqZjo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3c0c53cebd)
