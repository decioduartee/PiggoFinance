# Piggo Backend

Versão: 1.0.0

---

## Objetivo

Backend responsável por armazenar e gerenciar os dados do aplicativo Piggo utilizando Google Apps Script + Google Sheets.

---

## Estrutura do Banco

Planilha:

Piggo Database

Abas:

- Movimentacoes
- Dividas
- Cofrinho
- Configuracoes
- Logs
- Dashboard

---

## Estrutura das tabelas

### Movimentacoes

id
data
tipo
categoria
descricao
valor
responsavel
criadoEm
atualizadoEm

---

### Dividas

id
nome
tipo
valor
parcelas
parcelaAtual
ativa
inicio
responsavel
criadoEm
atualizadoEm

---

### Cofrinho

id
mes
ano
valor
responsavel
criadoEm
atualizadoEm

---

### Configuracoes

chave
valor

---

### Logs

data
nivel
origem
mensagem

---

## Formato dos IDs

TRX_XXXXXXXX

DBT_XXXXXXXX

COF_XXXXXXXX

LOG_XXXXXXXX

CFG_XXXXXXXX

---

## Resposta padrão

{
  success: true,
  message: "",
  data: {}
}

---

## Convenções

- Nunca acessar SpreadsheetApp fora do Database.
- Toda movimentação possui ID.
- Datas ISO.
- Backend idempotente.