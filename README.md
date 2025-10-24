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

4.  **Registrar o Runner:**

    - Na "Admin Area" do GitLab, vá em "CI/CD" > "Runners" e crie um "New instance runner" (adicionando a tag `docker`).
    - Copie o token de autenticação.
    - Execute o comando de registro (substituindo o token):

    ```bash
    docker compose exec -it gitlab-runner gitlab-runner register \
        --non-interactive \
        --url "http://gitlab.local" \
        --token "SEU_TOKEN_AQUI" \
        --executor "docker" \
        --docker-image "docker:latest" \
        --docker-privileged \
        --docker-volumes "/var/run/docker.sock:/var/run/docker.sock"
    ```

5.  **Corrigir a Rede do Runner:**

    - Para que os jobs possam clonar o repositório, o Runner precisa usar a rede do Compose.
    - O arquivo `lab-devops-infra/config-runner.toml-exemplo` neste repositório já contém a correção (`network_mode`).
    - Copie este arquivo de exemplo para dentro do contêiner:

    ```bash
    cd lab-devops-infra
    docker cp config-runner.toml-exemplo gitlab-runner:/etc/gitlab-runner/config.toml
    docker compose restart gitlab-runner
    cd ..
    ```

6.  **Subir o Código da Aplicação:**
    - Crie um novo projeto em branco no GitLab (ex: `lab-devops`).
    - Navegue até a pasta `lab-api-devops`:
    ```bash
    cd ../lab-api-devops
    git init
    git remote add origin [http://gitlab.local/root/lab-devops.git](http://gitlab.local/root/lab-devops.git)
    git add .
    git commit -m "Commit inicial"
    git push -u origin main
    ```

_Neste ponto, o pipeline será executado automaticamente._

Os slides utilizados na apresentação estão disponíveis no Canva:
[Link para os Slides da Apresentação](https://www.canva.com/design/DAG2p6XqZjo/-PsIE6zcCgx_J2vAv4qqLQ/view?utm_content=DAG2p6XqZjo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3c0c53cebd)
