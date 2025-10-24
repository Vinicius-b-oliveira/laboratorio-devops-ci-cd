# Laboratório DevOps: Pipeline CI/CD com GitLab CE

Este projeto é um laboratório acadêmico para a disciplina de GERENCIAMENTO, CONFIGURAÇÃO E PROCESSOS DE SOFTWARE, demonstrando um fluxo completo de CI/CD utilizando uma stack open-source e auto-hospedada (self-hosted).

O objetivo é simular um ambiente corporativo onde o código-fonte é versionado, testado (build), e publicado (deploy) de forma automatizada.

## 1. Equipe

- Bernardo Wehmuth
- João Vitor Dal-Ri
- Nicolas Soares Oliveira
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

`[Developer]` -> `git push` -> `[GitLab CE]` -> `[GitLab Runner (DooD)]` -> `docker build` -> `docker push` -> `[GitLab Container Registry]`

## 4. Como Reproduzir o Ambiente de DevOps

Este repositório está dividido em duas partes principais:

1.  `lab-devops-infra`: Contém o `docker-compose.yml` para subir a "fábrica" (GitLab CE e GitLab Runner).
2.  `lab-api-devops`: Contém o código-fonte da aplicação Node.js, seu `Dockerfile` e o script de pipeline `.gitlab-ci.yml`.

### Pré-requisitos

- Docker e Docker Compose
- Uma máquina com pelo menos 8GB de RAM (Recomendado)

### Passos para a Instalação

1.  **Subir a Infraestrutura (GitLab + Runner):**

    ```bash
    cd lab-devops-infra
    docker compose up -d
    ```

    _Aguarde alguns minutos para o GitLab inicializar._

2.  **Configurar o DNS Local:**
    Adicione a seguinte linha ao seu arquivo `/etc/hosts`:

    ```
    127.0.0.1   gitlab.local
    ```

3.  **Acessar e Configurar o GitLab:**

    - Acesse `http://gitlab.local` no seu navegador.
    - Pegue a senha de `root` inicial: `docker compose exec -it gitlab cat /etc/gitlab/initial_root_password`
    - Faça login como `root` e altere a senha.

### 4. Configurar e Registrar o Runner

1.  Na "Admin Area" do seu GitLab (`http://gitlab.local`), vá em **CI/CD** > **Runners**.
2.  Clique no botão azul **New instance runner**.
3.  Adicione a tag `docker` e clique em **Create runner**.
4.  Na página seguinte, **copie o token de autenticação** (ex: `glrt-...`).

5.  Agora, vamos usar esse token para criar o arquivo de configuração do Runner. Volte para o seu terminal (na pasta `lab-devops-infra`):

    ```bash
    # (Certifique-se de estar em lab-devops-infra)
    cd lab-devops-infra

    # Copie o arquivo de exemplo para um arquivo .toml temporário
    cp config-runner.toml-exemplo config.toml

    # Abra o novo arquivo .toml para editá-lo
    nano config.toml
    ```

6.  Dentro do `nano`, encontre a linha `token = "COLE_O_TOKEN_GERADO_PELA_UI_AQUI"`.
7.  **Substitua o placeholder `"COLE_O_TOKEN..."` pelo seu token (`glrt-...`)** que você copiou da UI.
8.  Salve e feche (Ctrl+O, Enter, Ctrl+X).

9.  Agora, copie este arquivo finalizado para dentro do contêiner (isto _é_ o registro):

    ```bash
    docker cp config.toml gitlab-runner:/etc/gitlab-runner/config.toml

    # Reinicie o Runner para ele ler a nova config
    docker compose restart gitlab-runner

    # (Opcional) Limpe o arquivo temporário
    rm config.toml
    cd ..
    ```

10. **Verificação:** Volte para a UI do GitLab (Admin Area > Runners). A "bolinha" do seu Runner deve ficar verde 🟢 em alguns segundos.

### 5. Subir o Código da Aplicação

1.  Crie um novo projeto em branco no GitLab (ex: `lab-devops`).
2.  Navegue até a pasta `lab-api-devops`:
    ```bash
    cd lab-api-devops
    ```
3.  Execute os comandos Git para enviar o código ao seu **GitLab local**:
    ```bash
    git init
    git remote add origin http://gitlab.local/root/lab-devops.git
    git add .
    git commit -m "Commit inicial"
    git push -u origin main
    ```

_Neste ponto, o pipeline será executado automaticamente._

## 6. Slides da Apresentação

Os slides utilizados na apresentação estão disponíveis no Canva:
[Link para os Slides da Apresentação](https://www.canva.com/design/DAG2p6XqZjo/-PsIE6zcCgx_J2vAv4qqLQ/view?utm_content=DAG2p6XqZjo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3c0c53cebd)
