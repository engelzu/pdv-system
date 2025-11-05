# Sistema PDV Moderno - TODO

## Funcionalidades Principais

### Persistência de Dados
- [x] Implementar banco de dados MySQL com Drizzle ORM
- [x] Sincronizar estado com banco de dados

### Cadastro de Clientes (CRUD)
- [x] Criar formulário de cadastro de cliente
- [x] Listar clientes em tabela
- [x] Editar cliente existente
- [x] Deletar cliente (com validação de vendas)
- [x] Validação de CPF e email

### Cadastro de Produtos (CRUD)
- [x] Criar formulário de cadastro de produto
- [x] Suporte para URL de foto do produto
- [x] Listar produtos em grid com imagens
- [x] Editar produto existente
- [x] Deletar produto (com validação de vendas)

### Carrinho de Compras
- [x] Adicionar produtos ao carrinho
- [x] Aumentar/diminuir quantidade de itens
- [x] Remover itens do carrinho
- [x] Calcular total da venda em tempo real
- [x] Exibir carrinho com resumo de itens

### Fluxo de Venda
- [x] Selecionar cliente para a venda
- [x] Adicionar produtos ao carrinho
- [x] Modal de pagamento com abas (PIX, Cartão, Dinheiro)
- [x] Cálculo de troco para pagamento em dinheiro
- [x] Parcelamento para pagamento em cartão
- [x] Confirmar pagamento e finalizar venda

### Histórico de Vendas
- [x] Listar vendas realizadas em tabela
- [ ] Filtrar vendas por data
- [ ] Exibir detalhes completos da venda
- [ ] Exibir parcelas de vendas parceladas

### Exportacao de PDF
- [x] Gerar PDF do comprovante de venda
- [x] Incluir dados do cliente, produtos e total
- [x] Incluir forma de pagamento e parcelas
- [x] Download automatico do PDF

### Interface e UX
- [x] Layout responsivo com sidebar de navegação
- [x] Design moderno com Tailwind CSS
- [x] Componentes shadcn/ui para consistência
- [x] Feedback visual (toasts) para ações
- [x] Estados de carregamento apropriados

### Banco de Dados
- [x] Criar schema de clientes
- [x] Criar schema de produtos
- [x] Criar schema de vendas
- [x] Criar schema de itens de venda
- [x] Migrations do Drizzle

### API (tRPC)
- [x] Procedures para CRUD de clientes
- [x] Procedures para CRUD de produtos
- [x] Procedures para criar venda
- [x] Procedures para listar vendas
- [ ] Procedures para obter detalhes da venda com itens

## Notas
- Sistema mantém compatibilidade com localStorage para não perder dados
- Suporte para múltiplas formas de pagamento
- Interface intuitiva e responsiva
- Exportação de PDF para comprovante de venda
