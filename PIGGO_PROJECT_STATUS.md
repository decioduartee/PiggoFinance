# Piggo Finance --- Status do Projeto

> Projeto pessoal de estudos em desenvolvimento.

## Sobre o projeto

O **Piggo Finance** é um aplicativo mobile de controle financeiro
pessoal que estou desenvolvendo como projeto de estudo, com foco em uma
experiência simples, visual, moderna e minimalista.

Fiquei um período afastado da publicação dos meus projetos pessoais
enquanto me dedicava aos estudos e a trabalhos como freelancer. Agora
estou retomando o desenvolvimento e voltando a publicar no GitHub os
projetos que fazem parte da minha evolução como desenvolvedor.

O Piggo é um desses projetos e continuará recebendo melhorias conforme
avanço nos estudos e na implementação das funcionalidades planejadas.

------------------------------------------------------------------------

## Stack atual

-   React Native
-   Expo SDK 54
-   TypeScript
-   React Navigation
-   AsyncStorage
-   React Native Gifted Charts
-   React Native Reanimated
-   React Native Gesture Handler
-   React Native SVG
-   Expo Blur
-   Expo Linear Gradient
-   Lucide React Native
-   Google Sheets + Google Apps Script como backend

------------------------------------------------------------------------

## O que já está implementado

### Estrutura do aplicativo

-   Estrutura organizada em `screens`, `components`, `features`,
    `services`, `hooks`, `navigation` e `theme`.
-   Contexto global para centralizar o estado financeiro do aplicativo.
-   Navegação entre **Início** e **Histórico**.
-   Tela de carregamento.
-   Fluxo inicial de seleção de perfil.
-   Persistência do perfil selecionado.
-   Suporte a tema claro/escuro com persistência local.

### Perfis

-   Seleção do perfil utilizado no dispositivo.
-   Perfil persistido com AsyncStorage.
-   Possibilidade de trocar o perfil posteriormente.
-   Associação automática do responsável ao cadastrar informações
    financeiras.

### Movimentações

-   Estrutura de transações de entrada e saída.
-   Cadastro de movimentações.
-   Consulta das movimentações através da camada de serviço.
-   Edição de movimentações na interface.
-   Exclusão de movimentações na interface.
-   Busca por nome, categoria ou valor.
-   Organização das movimentações por data.

### Salários

-   Estrutura para salários.
-   Consulta de salários através da API.
-   Cadastro de salário.
-   Edição e exclusão disponíveis na camada de serviço.
-   Associação do salário ao perfil responsável.

### Histórico

-   Filtro dinâmico por mês/ano de acordo com os dados existentes.
-   Busca por nome, categoria ou valor.
-   Ordenação por movimentações mais recentes ou mais antigas.
-   Agrupamento das movimentações por dia.
-   Exibição do total de saídas.
-   Cálculo do saldo disponível do período.
-   Ocultação dos valores financeiros.

### Gráfico financeiro

O gráfico principal já utiliza **react-native-gifted-charts**.

Atualmente ele possui:

-   Linha de saldo disponível.
-   Linha de gastos.
-   Destaque para o maior gasto do mês.
-   Área preenchida de forma discreta.
-   Interface sem valores no eixo Y.
-   Tratamento para meses sem movimentações.
-   Suporte à ocultação dos valores.

### Integração com backend

A comunicação com o backend já possui uma camada própria de API.

Para **transações**, estão estruturadas operações de:

-   Listar.
-   Buscar.
-   Criar.
-   Atualizar.
-   Excluir.

Para **salários**, estão estruturadas operações de:

-   Listar.
-   Buscar.
-   Criar.
-   Atualizar.
-   Excluir.

A URL do backend é configurada através de:

`EXPO_PUBLIC_API_BASE_URL`

O backend foi planejado utilizando **Google Apps Script + Google
Sheets**, com estrutura para movimentações, dívidas, cofrinho,
configurações, logs e dashboard.

------------------------------------------------------------------------

## Em desenvolvimento / próximos passos

O projeto ainda não está finalizado. Os próximos pontos planejados são:

### 1. Finalizar a integração com Google Sheets

A prioridade é substituir completamente os dados temporários/mockados
pelos dados reais armazenados no Google Sheets.

Isso inclui:

-   Transações.
-   Salários.
-   Dívidas fixas.
-   Cofrinho.
-   Configurações necessárias ao aplicativo.
-   Sincronização correta após criar, editar ou excluir dados.
-   Tratamento de erros de rede/API.

### 2. Dívidas fixas

Finalizar o CRUD de dívidas recorrentes:

-   Adicionar.
-   Editar.
-   Excluir.
-   Ativar/desativar.
-   Definir valor mensal.
-   Vencimento.
-   Diferenciar despesas recorrentes e parceladas.
-   Controlar parcelas pagas/restantes.
-   Identificar automaticamente quando uma dívida parcelada estiver
    quitada.
-   Integrar os dados ao Google Sheets.

### 3. Cofrinho

Finalizar a persistência do cofrinho:

-   Registrar quanto foi guardado no mês.
-   Associar o registro ao mês/ano.
-   Salvar o responsável.
-   Buscar o histórico.
-   Integrar ao backend.

> O cofrinho é um registro de organização financeira; o aplicativo não
> movimenta dinheiro real.

### 4. Histórico financeiro

Evoluir a tela de histórico com:

-   Revisão dos cálculos mensais.
-   Integração completa das edições e exclusões com o backend.
-   Comparação visual entre entradas e saídas.
-   Melhor tratamento dos dados entre diferentes meses e anos.

### 5. Gráfico da Home

Continuar refinando o gráfico para representar de forma clara:

-   Evolução do saldo disponível durante o mês.
-   Evolução/acúmulo dos gastos.
-   Dias com maior impacto financeiro.
-   Dados reais vindos do Google Sheets.
-   Animações sutis sem comprometer a performance.

### 6. Remover dependência dos mocks

Ainda existem estados inicializados com dados mockados durante o
desenvolvimento.

A meta é deixar o aplicativo totalmente dependente da camada de dados
real, mantendo mocks apenas para testes quando necessário.

### 7. Qualidade e estabilidade

Antes de considerar uma primeira versão estável:

-   Revisar estados de loading e erro.
-   Tratar ausência de conexão.
-   Validar formulários.
-   Revisar datas e valores.
-   Evitar inconsistências após operações otimistas.
-   Testar os principais fluxos em Android e iOS.
-   Revisar responsividade em diferentes tamanhos de tela.
-   Refatorar componentes onde necessário.

------------------------------------------------------------------------

## Roadmap resumido

-   [x] Estrutura base em React Native + Expo
-   [x] TypeScript
-   [x] Navegação principal
-   [x] Seleção e persistência de perfil
-   [x] Tema claro/escuro
-   [x] Estrutura de movimentações
-   [x] Estrutura de salários
-   [x] Histórico com busca, mês e ordenação
-   [x] Gráfico com saldo e gastos
-   [x] Camada de comunicação com API
-   [x] Estrutura inicial do backend Google Sheets / Apps Script
-   [ ] Finalizar integração Google Sheets
-   [ ] Remover mocks do fluxo principal
-   [ ] Finalizar CRUD de dívidas fixas
-   [ ] Finalizar persistência do cofrinho
-   [ ] Persistir edição/exclusão das movimentações no backend
-   [ ] Refinar cálculos mensais
-   [ ] Finalizar comparação Entradas x Saídas
-   [ ] Refinar gráfico da Home
-   [ ] Melhorar tratamento de loading/erros
-   [ ] Testes completos em Android e iOS
-   [ ] Revisão e refatoração para primeira versão estável

------------------------------------------------------------------------

## Objetivo

O Piggo não nasceu com a intenção de ser apenas um aplicativo pronto.
Ele também funciona como um projeto contínuo de aprendizado, onde posso
aplicar e evoluir conhecimentos de **React Native, TypeScript,
arquitetura de aplicações, APIs, persistência de dados, UI/UX e
desenvolvimento mobile**.

Este repositório representa o estado atual desse processo e será
atualizado conforme novas etapas forem concluídas.

------------------------------------------------------------------------

**Status:** 🚧 Em desenvolvimento
