# Estudo aplicado de protocolo e serviço de rede no Projeto Integrador

**Curso:** Ciência da Computação - Semestre 2026/1  
**Disciplina:** Gerenciamento de Infraestrutura de Serviços  
**Turma:** 003823T2  
**Professor:** Marcos A. Lucas  
**Projeto Integrador:** Vitrine Core - Erva Mate para o Brasil  
**Repositório analisado:** `vitrine-core`

## Resumo

Este relatório relaciona o Projeto Integrador desenvolvido no repositório `vitrine-core` com os conteúdos da disciplina Gerenciamento de Infraestrutura de Serviços. O projeto implementa uma plataforma de e-commerce para a marca "Erva Mate para o Brasil", organizada como um monorepo com front-end em Next.js, back-end em Medusa, banco de dados PostgreSQL via Docker e integrações opcionais com serviços como Redis, Meilisearch, Stripe, S3, Sentry e PostHog.

O estudo aplicado foi direcionado ao protocolo HTTP/HTTPS e ao serviço web de comércio eletrônico, pois esses elementos representam a camada de aplicação mais evidente do projeto e dependem diretamente de conceitos de transporte, segurança, nomes de domínio, portas, cache, observabilidade, configuração de serviços e troubleshooting. A análise mostra que o projeto não é apenas uma aplicação de software, mas um ambiente distribuído composto por múltiplos serviços que se comunicam sobre TCP/IP e que exigem configuração correta de rede, variáveis de ambiente, políticas de segurança e exposição controlada de portas.

## 1. Introdução

A disciplina Gerenciamento de Infraestrutura de Serviços aborda os aspectos funcionais das camadas superiores de arquiteturas de redes, com foco em transporte fim a fim, protocolos de aplicação, serviços de rede, sistemas operacionais de rede, instalação de ambientes, simulação, análise de redes corporativas e tecnologias atuais. O Projeto Integrador `vitrine-core` oferece um contexto prático para aplicar esses conteúdos, pois materializa uma infraestrutura de serviços web semelhante à encontrada em ambientes empresariais.

O repositório contém uma loja virtual com recursos de catálogo, carrinho, checkout, área de cliente, lista de desejos, avaliações de produtos, newsletter, emissão de invoice, integração com pagamento e mecanismos de observabilidade. Para que essas funcionalidades operem, o sistema depende de uma cadeia de comunicação entre navegador, front-end, back-end, banco de dados e serviços externos. Cada etapa dessa cadeia utiliza protocolos e configurações de infraestrutura que estão diretamente relacionados aos objetivos da disciplina.

Assim, este documento apresenta uma análise técnica do projeto sob a perspectiva de redes e infraestrutura de serviços, demonstrando como os conceitos de HTTP/HTTPS, TCP, DNS, CORS, segurança, cache, banco de dados, containers e monitoramento aparecem na aplicação real.

## 2. Visão geral do projeto integrador

O `vitrine-core` é um monorepo baseado em Turborepo e pnpm. A organização principal do repositório é:

- `apps/front-end`: aplicação de loja virtual em Next.js, com suporte a PWA.
- `apps/medusa`: back-end Medusa, responsável pela API de comércio, módulos customizados e administração.
- `packages/site-config`: configurações compartilhadas de marca, navegação e recursos.
- `packages/revalidation`: tags e tipos compartilhados para revalidação de cache.
- `docker-compose.yaml`: serviço local de banco de dados PostgreSQL/ParadeDB.

O arquivo `README.md` descreve requisitos como Node.js 20+, pnpm 10+, Docker e mkcert. Também documenta um fluxo de teste local via HTTPS em rede local, acessando a aplicação por um IP privado, por exemplo `https://192.168.209.236:3000`. Esse ponto aproxima o projeto dos laboratórios da disciplina, porque envolve identificação de IP da máquina, certificado local, instalação de autoridade certificadora no celular, uso de rede local e validação de origem segura para instalação de PWA.

Na perspectiva de infraestrutura, o projeto possui três blocos principais:

- Cliente: navegador ou dispositivo móvel acessando a loja.
- Serviço de aplicação: front-end Next.js e API Medusa.
- Persistência e serviços auxiliares: PostgreSQL, Redis, Meilisearch, S3, Stripe, PostHog e Sentry, conforme configuração do ambiente.

Essa arquitetura se enquadra em um cenário típico de rede corporativa: há serviços publicados em portas específicas, variáveis de ambiente definindo endereços e credenciais, comunicação HTTP entre componentes e necessidade de políticas de segurança para controlar origens, autenticação e tráfego externo.

## 3. Protocolo estudado: HTTP/HTTPS

O protocolo principal do estudo é o HTTP, utilizado na camada de aplicação da arquitetura Internet. No projeto, o HTTP aparece nas requisições do navegador para o front-end, nas chamadas do front-end para a API Medusa, nas rotas internas do Next.js e nas integrações com provedores externos. Em produção e em testes de PWA, o HTTP deve operar sobre TLS, formando HTTPS.

O HTTP é adequado para esse projeto porque ele modela operações de e-commerce como recursos e métodos. Exemplos práticos no repositório:

- `GET /api/health`: endpoint do front-end que retorna o estado do serviço.
- `POST /api/revalidate`: endpoint do front-end usado para revalidação de cache.
- Rotas de loja do Medusa, como produtos, carrinho, pedidos, wishlist, newsletter e avaliações.
- Chamadas para serviços externos, como Stripe, PostHog, Sentry e Meilisearch.

O HTTPS adiciona confidencialidade, integridade e autenticação do servidor por meio de TLS. Isso é essencial no contexto do projeto porque uma loja virtual manipula dados de clientes, sessão, carrinho, pedidos e pagamento. Mesmo em ambiente de desenvolvimento, o README mostra a necessidade de HTTPS para teste de PWA em celular, pois navegadores modernos exigem origem segura para permitir instalação de aplicativo, service workers e recursos sensíveis.

O fluxo local com mkcert demonstra uma aplicação prática do conteúdo da disciplina:

1. A máquina do desenvolvedor recebe um endereço IPv4 privado na rede local.
2. Um certificado é gerado para esse IP.
3. O celular confia na autoridade certificadora local.
4. O navegador acessa o serviço via `https://IP:3000`.
5. O front-end responde como origem segura e pode ser instalado como PWA.

Essa prática relaciona conceitos de IPv4, camada de transporte, camada de aplicação, certificados digitais, DNS privado ou resolução direta por IP, portas TCP e troubleshooting de conectividade.

## 4. Serviço estudado: aplicação web de e-commerce

O serviço de rede analisado é a aplicação web de e-commerce. Ele é composto por dois serviços principais:

- Storefront: aplicação Next.js responsável pela interface da loja, renderização de páginas, PWA, SEO, rotas de API locais, cache e políticas de segurança HTTP.
- Backend Medusa: API de comércio, administração, módulos customizados, workflows e persistência de dados.

O serviço não depende apenas de código de aplicação. Ele exige infraestrutura configurada corretamente. No `docker-compose.yaml`, o banco local é publicado em `localhost:5435`, redirecionando para a porta interna `5432` do container. Isso representa um caso simples de NAT/port mapping, pois o serviço interno do container é exposto no host com uma porta diferente.

O banco definido é `paradedb/paradedb:latest`, compatível com PostgreSQL, com usuário `postgres`, senha `docker` e base `medusa`. A persistência local é feita em volume no diretório `.data/paradedb_data`. Essa configuração mostra a ligação entre aplicação e sistema operacional de rede: o serviço de banco precisa de porta, credenciais, volume e limite de recursos.

No back-end, o arquivo `apps/medusa/medusa-config.ts` centraliza configurações importantes:

- `DATABASE_URL`: conexão com o banco de dados.
- `REDIS_URL`: cache, event bus, workflow engine e locking, quando Redis estiver habilitado.
- `STORE_CORS`, `ADMIN_CORS` e `AUTH_CORS`: controle de origens autorizadas.
- `JWT_SECRET` e `COOKIE_SECRET`: segurança de autenticação e sessão.
- `STRIPE_API_KEY` e `STRIPE_WEBHOOK_SECRET`: pagamentos e verificação de webhooks.
- `S3_BUCKET` e credenciais relacionadas: armazenamento de arquivos.
- `MEILISEARCH_HOST` e `MEILISEARCH_API_KEY`: serviço de busca.
- `POSTHOG_EVENTS_API_KEY`: analytics.
- `STOREFRONT_URL` e `REVALIDATE_SECRET`: revalidação do front-end após mudanças no catálogo.

Essas variáveis mostram que gerenciar infraestrutura de serviços envolve mais do que iniciar processos. É necessário configurar corretamente endpoints, segredos, permissões, portas, provedores e políticas de comunicação.

## 5. Relação com os conteúdos da disciplina

### 5.1 Camada de transporte: TCP e UDP

O projeto usa predominantemente TCP, pois HTTP, HTTPS, PostgreSQL, Redis e Meilisearch operam sobre conexões confiáveis. O TCP fornece entrega ordenada, controle de fluxo, retransmissão e controle de congestionamento, características importantes para uma loja virtual que não pode perder dados de pedido, autenticação ou pagamento.

O UDP não aparece diretamente como protocolo de aplicação no repositório, mas é relevante para DNS em muitos cenários, já que consultas DNS tradicionais usam UDP na porta 53. Portanto, mesmo que o código não implemente DNS, a operação do projeto em produção dependeria de DNS para resolver domínios como o endereço público da loja, o domínio da API, serviços de pagamento, analytics e armazenamento de imagens.

### 5.2 Camada de aplicação: HTTP, HTTPS, DNS e APIs

O conteúdo de camada de aplicação é o mais diretamente aplicado. O Next.js expõe páginas e rotas HTTP; o Medusa expõe APIs REST; o front-end consome endpoints do back-end por meio do SDK `@medusajs/js-sdk`; e integrações externas são acessadas por URLs configuradas em variáveis de ambiente.

O arquivo `apps/front-end/next.config.ts` configura cabeçalhos HTTP importantes:

- `Strict-Transport-Security`: força uso de HTTPS em navegadores compatíveis.
- `X-Frame-Options: DENY`: reduz risco de clickjacking.
- `X-Content-Type-Options: nosniff`: reduz interpretação indevida de conteúdo.
- `Referrer-Policy`: limita vazamento de informações de navegação.
- `Permissions-Policy`: bloqueia permissões como câmera, microfone e geolocalização.
- `Content-Security-Policy`: restringe origens permitidas para scripts, conexões, imagens, frames e outros recursos.

Esses cabeçalhos demonstram gerenciamento de serviço em camada de aplicação. A aplicação não apenas responde conteúdo; ela define regras de segurança e comunicação que o navegador deve aplicar.

### 5.3 DHCP, NAT, DMZ e DNS

O README demonstra uso de IP local para acesso por celular. Em um laboratório, esse IP normalmente é atribuído por DHCP pelo roteador da rede. A aplicação é acessada por endereço privado, por exemplo `192.168.x.x`, e por porta TCP `3000`.

O Docker Compose utiliza port mapping no banco de dados: a porta interna `5432` é exposta no host como `5435`. Esse caso se relaciona com NAT, pois há tradução entre a porta do serviço dentro do container e a porta visível no host. Em produção, o mesmo conceito se aplica a proxies reversos, balanceadores de carga e gateways de entrada.

O conceito de DMZ pode ser discutido a partir da separação entre serviços públicos e privados. O front-end e a API HTTP seriam candidatos a exposição pública. Já o banco PostgreSQL não deveria ficar exposto à internet; ele deve permanecer em rede privada, acessível apenas pelo back-end. Essa separação é uma prática de segurança esperada em infraestrutura corporativa.

DNS é necessário quando o sistema deixa de ser acessado por IP e passa a usar domínio. Em produção, nomes como `loja.exemplo.com` e `api.exemplo.com` apontariam para os serviços correspondentes. O DNS também influencia TLS, pois certificados públicos normalmente são emitidos para nomes de domínio, não para IPs privados.

### 5.4 IPv4 e IPv6

O fluxo local documentado usa IPv4 privado. A disciplina também aborda IPv6, e o projeto pode ser analisado sob esse aspecto: para funcionar em redes modernas, o front-end e o back-end devem aceitar conexões em pilha dupla quando hospedados em provedores compatíveis. O código não depende de endereços IPv4 fixos, exceto na documentação local de PWA, o que facilita adaptação a IPv6.

Em uma implantação real, seria recomendável:

- Configurar DNS com registros `A` para IPv4 e `AAAA` para IPv6.
- Garantir que o proxy ou provedor de hospedagem aceite tráfego IPv6.
- Testar chamadas de API e carregamento de imagens em ambientes de pilha dupla.
- Evitar hardcode de endereços IP em variáveis públicas.

### 5.5 Instalação e simulação de ambientes de rede

O projeto já possui elementos próprios para laboratório:

- Execução local via pnpm.
- Banco PostgreSQL em container Docker.
- Teste HTTPS local com mkcert.
- Acesso por celular na mesma rede local.
- Endpoints de health check.
- Variáveis de ambiente para simular provedores externos.

Esses elementos permitem montar um miniambiente de rede com máquina host, container de banco, navegador desktop e dispositivo móvel. Um exercício prático poderia consistir em iniciar o banco, subir o back-end, subir o front-end via HTTPS, acessar pelo celular e capturar o tráfego com Wireshark para observar DNS, TCP, TLS e HTTP.

### 5.6 Sistemas operacionais de rede e administração de serviços

Embora o projeto seja escrito em TypeScript, sua operação depende de administração de sistema. O desenvolvedor precisa configurar Node.js, pnpm, Docker, certificados locais, variáveis de ambiente, portas e processos. Isso corresponde ao papel de um administrador de serviços em Linux ou ambiente servidor.

O Docker permite isolar o banco e reproduzir o ambiente. O limite de recursos definido no Compose (`0.25` CPU e `1G` de memória) também é um aspecto de gerência de infraestrutura, pois evita que o serviço de banco consuma recursos excessivos em ambiente local.

### 5.7 Troubleshooting

O projeto apresenta vários pontos adequados para diagnóstico:

- Front-end não acessa o back-end: verificar `MEDUSA_BACKEND_URL`, CORS, porta `9000` e disponibilidade da API.
- Banco não conecta: verificar `DATABASE_URL`, container, porta `5435`, credenciais e volume.
- PWA não instala no celular: verificar HTTPS, certificado mkcert, IP correto e confiança da CA no dispositivo.
- Imagens não carregam: verificar CSP, `remotePatterns` do Next.js, S3 e origem das imagens.
- Pagamento não funciona: verificar chaves Stripe e webhook secret.
- Busca não retorna resultados: verificar Meilisearch, chave de API e sincronização de produtos.
- Eventos não aparecem: verificar PostHog, Sentry e variáveis públicas/privadas.

Esses cenários estão alinhados ao objetivo da disciplina de desenvolver competências práticas em identificação de problemas e implementação de soluções de rede.

## 6. Fluxo operacional de comunicação

Um fluxo simplificado de compra no projeto pode ser descrito assim:

1. O usuário acessa o domínio ou IP do front-end pelo navegador.
2. O navegador estabelece conexão TCP com o servidor.
3. Em HTTPS, ocorre negociação TLS antes do tráfego HTTP.
4. O Next.js entrega HTML, CSS, JavaScript, imagens e manifesto PWA.
5. O front-end consulta a API Medusa para produtos, regiões, carrinho e checkout.
6. O Medusa processa regras de comércio e acessa o PostgreSQL.
7. Se configurado, o Medusa usa Redis para cache/eventos/workflows, Meilisearch para busca, S3 para arquivos e Stripe para pagamentos.
8. Eventos operacionais são enviados para PostHog e erros para Sentry.
9. Mudanças de catálogo podem acionar revalidação no front-end por meio de endpoint protegido por segredo.

Esse fluxo demonstra uma cadeia de serviços distribuídos. Qualquer falha em DNS, porta, TLS, CORS, credencial, banco, cache ou serviço externo pode comprometer a experiência do usuário.

## 7. Segurança e boas práticas observadas

O projeto contém decisões importantes de segurança:

- Uso de HTTPS para PWA e recomendação de origem segura.
- Validação de segredos em produção no `medusa-config.ts`.
- Avisos para chaves inseguras ou ausentes em desenvolvimento.
- Exigência de `STRIPE_WEBHOOK_SECRET` quando Stripe está ativo em produção.
- CORS separado para loja, administração e autenticação.
- CSP no front-end restringindo scripts, conexões, imagens e frames.
- `frame-ancestors 'none'` e `X-Frame-Options: DENY`.
- `object-src 'none'`, reduzindo superfície de execução de conteúdo legado.
- Rate limit em rotas como contato e newsletter.
- Health check sem cache para observabilidade básica.

Essas práticas se relacionam com a formação crítica e ética prevista na disciplina. Uma aplicação de e-commerce manipula dados pessoais e transacionais; portanto, segurança de rede e configuração correta de serviços são responsabilidades técnicas e éticas.

## 8. Aplicação prática proposta para a disciplina

Como estudo aplicado para a avaliação de Projeto Integrador, a prática pode ser organizada no seguinte roteiro:

1. Subir o banco local:

```sh
docker compose up -d postgres
```

2. Instalar dependências:

```sh
pnpm install
```

3. Executar o back-end:

```sh
pnpm dev:medusa
```

4. Executar o front-end:

```sh
pnpm dev:front-end
```

5. Testar o endpoint de saúde do front-end:

```text
http://localhost:3000/api/health
```

6. Testar o acesso por HTTPS local em celular usando mkcert, conforme documentação do README.

7. Capturar tráfego com Wireshark, comparando:

- Acesso HTTP local.
- Acesso HTTPS local.
- Resolução de DNS quando houver domínio.
- Conexões TCP para front-end, back-end e banco.

8. Registrar evidências:

- Print dos serviços em execução.
- Print do endpoint de health.
- Print do PWA acessado no celular.
- Trecho do Docker Compose com porta do banco.
- Trecho dos cabeçalhos de segurança configurados no Next.js.
- Tabela com portas e protocolos.

## 9. Tabela de serviços, portas e protocolos

| Componente | Protocolo | Porta típica | Evidência no projeto | Função |
| --- | --- | ---: | --- | --- |
| Front-end Next.js | HTTP/HTTPS sobre TCP | 3000 | `apps/front-end/package.json`, README | Interface da loja, PWA e rotas locais |
| Back-end Medusa | HTTP sobre TCP | 9000 | `MEDUSA_BACKEND_URL`, `medusa-config.ts` | API de comércio e administração |
| PostgreSQL/ParadeDB | Protocolo PostgreSQL sobre TCP | 5435 no host / 5432 no container | `docker-compose.yaml` | Persistência de dados |
| Redis opcional | RESP sobre TCP | 6379 | `REDIS_URL`, `medusa-config.ts` | Cache, eventos, workflows e locking |
| Meilisearch opcional | HTTP sobre TCP | variável | `MEILISEARCH_HOST`, módulo customizado | Busca de produtos |
| Stripe | HTTPS sobre TCP | 443 | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | Pagamentos e webhooks |
| S3 compatível | HTTPS sobre TCP | 443 | `S3_BUCKET`, `S3_ENDPOINT` | Armazenamento de arquivos |
| PostHog | HTTPS sobre TCP | 443 | PostHog no front-end e back-end | Analytics |
| Sentry | HTTPS sobre TCP | 443 | Configurações Sentry | Observabilidade de erros |

## 10. Relação direta com os objetivos da disciplina

O projeto atende ao objetivo geral da disciplina porque permite compreender e aplicar serviços de dados e protocolos das camadas superiores de redes. A aplicação depende de HTTP/HTTPS, TCP, DNS, banco de dados, autenticação, CORS, cache, observabilidade e comunicação com serviços externos.

Também atende aos objetivos específicos:

- Protocolos de transporte e aplicação: uso prático de TCP, HTTP, HTTPS e DNS.
- Configuração e gerência de infraestrutura: Docker, portas, variáveis de ambiente, CORS, CSP e segredos.
- Integração teórico-prática: execução local, teste em celular, PWA, certificados e troubleshooting.
- Sistemas operacionais de rede: uso de Linux, Docker, Node.js, processos e serviços.
- Tecnologias atuais: Next.js, Medusa, PWA, Stripe, S3, Redis, Meilisearch, Sentry e PostHog.
- Formação crítica e ética: segurança de dados, proteção de sessão, headers de segurança e redução de exposição de serviços internos.

## 11. Considerações finais

O repositório `vitrine-core` é adequado para ser usado como Projeto Integrador na disciplina Gerenciamento de Infraestrutura de Serviços porque representa um caso realista de aplicação web distribuída. Ele exige conhecimentos de redes não apenas para ser desenvolvido, mas para ser executado, testado, publicado e mantido.

O estudo aplicado de HTTP/HTTPS demonstra como um protocolo de camada de aplicação se relaciona com transporte TCP, DNS, TLS, segurança, cache, APIs, serviços externos e troubleshooting. Além disso, a presença de Docker, banco PostgreSQL, CORS, CSP, Redis opcional, Meilisearch, Stripe, S3, Sentry e PostHog evidencia que a aplicação possui uma infraestrutura de serviços comparável a ambientes corporativos.

Portanto, o projeto permite aplicar os conteúdos da disciplina de forma prática e contextualizada, conectando teoria de redes com uma solução concreta de comércio eletrônico. A análise também reforça que o bom funcionamento de um sistema moderno depende da integração correta entre software, protocolo, rede, segurança e operação.

## Referências

COMER, Douglas E. *Redes de Computadores e Internet*. 4. ed. Porto Alegre: Bookman, 2007.

KUROSE, James F.; ROSS, Keith W. *Redes de computadores e a Internet: uma abordagem top-down*. 6. ed. São Paulo: Pearson Addison Wesley, 2013.

TANENBAUM, Andrew S. *Redes de Computadores*. 4. ed. Rio de Janeiro: Campus.

POSTEL, Jon. *RFC 791: Internet Protocol*. Internet Engineering Task Force, 1981. Disponível em: https://www.rfc-editor.org/rfc/rfc791

FIELDING, Roy et al. *RFC 9110: HTTP Semantics*. Internet Engineering Task Force, 2022. Disponível em: https://www.rfc-editor.org/rfc/rfc9110

RESCORLA, Eric. *RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3*. Internet Engineering Task Force, 2018. Disponível em: https://www.rfc-editor.org/rfc/rfc8446

MOCKAPETRIS, Paul. *RFC 1035: Domain Names - Implementation and Specification*. Internet Engineering Task Force, 1987. Disponível em: https://www.rfc-editor.org/rfc/rfc1035

The PostgreSQL Global Development Group. *PostgreSQL Documentation*. Disponível em: https://www.postgresql.org/docs/

Docker Inc. *Docker Compose Documentation*. Disponível em: https://docs.docker.com/compose/

Vercel. *Next.js Documentation*. Disponível em: https://nextjs.org/docs

Medusa. *Medusa Documentation*. Disponível em: https://docs.medusajs.com/
