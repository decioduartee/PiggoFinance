# Piggo Finance — Status do Projeto

> Projeto pessoal de estudos em desenvolvimento.

## Sobre o projeto

O **Piggo Finance** é um aplicativo mobile de controle financeiro pessoal desenvolvido com foco em uma experiência simples, visual, moderna e minimalista.

O projeto também funciona como ambiente de estudo e evolução em desenvolvimento mobile, arquitetura de aplicações, integração com APIs, persistência de dados e UI/UX.

---

## Stack atual

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- AsyncStorage
- React Native Gifted Charts
- React Native Reanimated
- React Native Gesture Handler
- React Native SVG
- Expo Blur
- Expo Linear Gradient
- Lucide React Native
- Google Sheets + Google Apps Script como backend

---

## O que já está implementado

### Estrutura do aplicativo

- Estrutura organizada em `screens`, `components`, `features`, `services`, `hooks`, `navigation` e `theme`.
- Contexto global para centralizar o estado financeiro.
- Navegação entre **Início** e **Histórico**.
- Tela de carregamento.
- Fluxo inicial de seleção de perfil.
- Persistência do perfil selecionado.
- Tema claro/escuro com persistência local.
- Atualizações otimistas para deixar a interface responsiva sem aguardar o retorno do backend.

### Perfis

- Seleção do perfil utilizado no dispositivo.
- Persistência com AsyncStorage.
- Troca de perfil pelas configurações.
- Associação automática do responsável aos registros financeiros.

### Movimentações

- Estrutura de transações de entrada e saída.
- Cadastro, consulta, edição e exclusão.
- Atualização otimista após operações.
- Busca por nome, categoria ou valor.
- Organização por data.

### Salários

- Cadastro e consulta de salários.
- Edição e exclusão através da camada de serviço.
- Associação ao perfil responsável.
- Atualização imediata da interface durante sincronização.

### Dívidas fixas e parceladas

O fluxo de dívidas foi integrado ao estado financeiro e ao backend.

Atualmente é possível:

- Adicionar dívidas.
- Editar dívidas.
- Excluir dívidas.
- Ativar ou desativar.
- Definir valor e dia de vencimento.
- Diferenciar dívida fixa de compra parcelada.
- Definir total de parcelas.
- Informar parcelas já pagas.
- Definir o mês inicial do parcelamento.
- Proteger campos estruturais do parcelamento durante a edição.
- Controlar ocorrências mensais das dívidas.
- Sincronizar o progresso das parcelas.
- Impedir edição/exclusão enquanto um registro temporário ainda está sendo sincronizado.
- Atualizar a interface de forma otimista.
- Limpar automaticamente o formulário quando a dívida em edição é excluída.

As dívidas do mês participam do cálculo do **saldo disponível**.

### Histórico financeiro

A tela de Histórico foi refatorada para trabalhar com movimentações reais e compromissos financeiros mensais.

Recursos implementados:

- Filtro dinâmico por mês e ano.
- Abertura automática na competência atual.
- Navegação horizontal entre competências.
- Meses em ordem cronológica.
- Busca por nome, categoria ou valor.
- Ordenação entre mais recentes e mais antigos.
- Agrupamento por dia.
- Ocultação de valores financeiros.
- Exibição de transações e dívidas na mesma linha do tempo.
- Dívidas fixas identificadas no histórico mensal.
- Parceladas exibidas como `parcela atual/total`.
- Status **Pago**, **Pendente** e **Previsto**.
- Cálculo do saldo disponível considerando as dívidas da competência.
- Cálculo de saldo previsto ao visualizar meses futuros.
- Projeção automática das parcelas restantes.

#### Previsão de meses futuros

Meses futuros são criados para visualização somente quando existe uma dívida parcelada com parcelas restantes.

A última parcela pendente define até onde a previsão será exibida.

As dívidas fixas acompanham essa projeção, mas **não criam meses futuros indefinidamente por conta própria**.

Exemplo:

```text
Julho 2026
├── Dívida fixa
├── Parcela 4/12
└── Movimentações

Agosto 2026
├── Dívida fixa • Previsto
└── Parcela 5/12 • Previsto

...

Março 2027
├── Dívida fixa • Previsto
└── Parcela 12/12 • Previsto
```

Depois da última parcela prevista, novos meses deixam de ser projetados automaticamente.

### Gráfico financeiro

O gráfico principal utiliza **react-native-gifted-charts**.

Atualmente possui:

- Linha de saldo disponível.
- Linha de gastos.
- Destaque para o maior gasto do mês.
- Área preenchida de forma discreta.
- Interface sem valores no eixo Y.
- Tratamento para meses sem movimentações.
- Suporte à ocultação dos valores.

### Integração com backend

A comunicação com o backend possui uma camada própria de API.

Já existem operações para:

**Transações**
- Listar
- Buscar
- Criar
- Atualizar
- Excluir

**Salários**
- Listar
- Buscar
- Criar
- Atualizar
- Excluir

**Dívidas**
- Listar
- Buscar
- Criar
- Atualizar
- Excluir
- Gerenciar ocorrências mensais

A URL do backend é configurada através de:

`EXPO_PUBLIC_API_BASE_URL`

O backend utiliza **Google Apps Script + Google Sheets**.

---

## Em desenvolvimento / próximos passos

### 1. Cofrinho

Finalizar a persistência do cofrinho:

- Registrar quanto foi guardado no mês.
- Associar o registro ao mês/ano.
- Salvar o responsável.
- Buscar histórico.
- Integrar completamente ao backend.

> O cofrinho é um registro de organização financeira; o aplicativo não movimenta dinheiro real.

### 2. Gráfico da Home

Continuar refinando o gráfico para representar:

- Evolução do saldo disponível durante o mês.
- Evolução/acúmulo dos gastos.
- Dias com maior impacto financeiro.
- Dados reais vindos do Google Sheets.
- Animações sutis sem comprometer a performance.

### 3. Remover dependência dos mocks

Eliminar os dados mockados restantes do fluxo principal, mantendo mocks somente quando forem úteis para testes.

### 4. Qualidade e estabilidade

Antes da primeira versão estável:

- Revisar estados de loading e erro.
- Tratar ausência de conexão.
- Validar formulários.
- Revisar datas e valores.
- Evitar inconsistências após operações otimistas.
- Testar os principais fluxos em Android e iOS.
- Revisar responsividade.
- Refatorar componentes quando necessário.

---

## Roadmap resumido

- [x] Estrutura base em React Native + Expo
- [x] TypeScript
- [x] Navegação principal
- [x] Seleção e persistência de perfil
- [x] Tema claro/escuro
- [x] Estrutura de movimentações
- [x] Estrutura de salários
- [x] Camada de comunicação com API
- [x] Backend Google Sheets / Apps Script
- [x] CRUD de dívidas fixas e parceladas
- [x] Ocorrências mensais de dívidas
- [x] Atualizações otimistas
- [x] Histórico com busca, mês e ordenação
- [x] Dívidas integradas ao Histórico
- [x] Previsão de parcelas futuras
- [x] Saldo disponível por competência
- [x] Saldo previsto para meses futuros
- [x] Gráfico com saldo e gastos
- [ ] Finalizar persistência do cofrinho
- [ ] Remover mocks restantes
- [ ] Refinar gráfico da Home
- [ ] Melhorar tratamento de loading/erros
- [ ] Testes completos em Android e iOS
- [ ] Revisão e refatoração para primeira versão estável

---

## Objetivo

O Piggo não nasceu com a intenção de ser apenas um aplicativo pronto.

Ele também funciona como um projeto contínuo de aprendizado, onde posso aplicar e evoluir conhecimentos de **React Native, TypeScript, arquitetura de aplicações, APIs, persistência de dados, UI/UX e desenvolvimento mobile**.

Este repositório representa o estado atual desse processo e será atualizado conforme novas etapas forem concluídas.

---

**Status:** 🚧 Em desenvolvimento
