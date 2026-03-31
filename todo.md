# iPhone Seminovos - TODO

## Banco de Dados & API
- [x] Schema: tabela `iphones` com todos os campos
- [x] Schema: tabela `installment_rates` para taxas de parcelamento
- [x] Schema: tabela `iphone_photos` para fotos dos produtos
- [x] Migração SQL aplicada via webdev_execute_sql
- [x] tRPC: CRUD de iPhones (admin)
- [x] tRPC: listagem pública de iPhones
- [x] tRPC: CRUD de taxas de parcelamento (admin)
- [x] tRPC: upload de fotos para S3
- [x] tRPC: delete de fotos

## Painel Administrativo
- [x] Layout com DashboardLayout e sidebar
- [x] Página de listagem de produtos (admin)
- [x] Formulário de cadastro/edição de iPhone
  - [x] Campos: modelo, memória, saúde da bateria, reparos
  - [x] Preço de custo
  - [x] Ajuste de preço à vista (% ou valor fixo)
  - [x] Seleção de parcelas e taxas
  - [x] Upload de fotos (múltiplas, opcional)
  - [x] Status (rascunho / publicado)
- [x] Página de configuração de taxas de parcelamento
- [x] Validações de formulário com react-hook-form + zod

## Catálogo Público
- [x] Página inicial com catálogo de iPhones
- [x] Cards de produto com foto, modelo, memória, bateria, preço à vista e parcelado
- [x] Página de detalhes do produto com galeria de fotos
- [x] Filtros por modelo e memória
- [x] Responsividade mobile-first

## Design & UX
- [x] Paleta de cores elegante (dark premium)
- [x] Tipografia refinada (Google Fonts)
- [x] Loading skeletons em todas as listagens
- [x] Estados vazios com mensagens amigáveis
- [x] Animações suaves com framer-motion
- [x] Toasts de feedback para ações

## Testes
- [x] Testes vitest para rotas principais da API
- [x] Teste de cálculo de preço à vista e parcelado

## Entrega
- [x] Checkpoint salvo
- [x] Instruções de uso documentadas

## Atualizações
- [x] Inserir 19 taxas de parcelamento (débito até 18x) no banco de dados
- [x] Destaque visual para parcela de 12x no card do produto
- [x] Modal/drawer com todas as opções de parcelamento
- [x] Banner hero com imagens de iPhones em leque e logo PolliShop VGA
- [x] Integrar logo PolliShop e atualizar nome para "PolliShop Eletrônicos"
- [x] Mudar tema para branco (marketplace style)
- [x] Ajustar cards de produto com miniatura, nome e descrição
- [x] Criar botão "Parcelar" com modal de opções 2x-18x
- [x] Paleta de cores: preto, branco, cinza, azul escuro, metálico
- [x] Expandir logo na horizontal (full width)
- [x] Mesclar logo com fundo branco
- [x] Aplicar paleta de cores mais clara em todo o app
- [x] Organizar modal de parcelamento em ordem crescente (2x, 3x... 18x)
- [x] Selecionar todas as opções de parcelamento por padrão ao criar novo produto
