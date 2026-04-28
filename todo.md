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
- [x] Testes para validação de campos dinâmicos por categoria (17 testes)

## Categorias de Produtos
- [x] Adicionar campo categoria no schema do banco de dados
- [x] Implementar seleção de categoria no painel admin
- [x] Criar barra de menu com ícones para 6 categorias (Smartphones, Tablet, Notebook, Computadores, Periféricos, Acessórios)
- [x] Implementar filtro por categoria no catálogo público
- [x] Carrossel de categorias com setas de navegação
- [x] Suporte a deslizar com dedo (touch)

## Campos Dinâmicos por Categoria
- [x] Smartphones: modelo, memória, bateria, reparos
- [x] Tablet: modelo, memória, bateria, reparos
- [x] Notebook: marca, processador, RAM, armazenamento, tela, GPU
- [x] Computadores: processador, RAM, armazenamento, GPU, fonte, cooler, gabinete
- [x] Periféricos: tipo, marca, especificação, categoria, subcategoria
- [x] Acessórios: tipo, compatibilidade, descrição
- [x] Implementar formulário dinâmico que muda campos conforme categoria
- [x] Testes vitest para validar campos dinâmicos por categoria (17 testes)

## Correções Aplicadas
- [x] Corrigir erro de query no banco de dados (coluna category não existia)
- [x] Aplicar migrações SQL ao banco de dados (0005, 0006)
- [x] Transformar menu de categorias em carrossel horizontal
- [x] Adicionar setas de navegação ao carrossel
- [x] Implementar scroll com deslizar de dedo (touch)
- [x] Implementar scroll com clique nas setas (mouse)
- [x] Erro ao criar produto: storage e batteryHealth undefined
- [x] Schema de validação exigindo campos opcionais
- [x] Formulário não sincronizava valores com React Hook Form
- [x] Migrações 0005 e 0006 aplicadas com sucesso
- [x] Produtos agora carregam corretamente com as novas colunas
- [x] Script standalone `migrate.mjs` criado para aplicar migrações
- [x] Alguns produtos não estavam carregando fotos - RESOLVIDO
- [x] Schema reorganizado conforme estrutura de descrição de cada categoria
- [x] Adicionados campos: cooler, cabinet, itemCategory, itemSubcategory

## Próximas Melhorias
- [x] Atualizar AdminProductForm.tsx com novos campos (cooler, cabinet, itemCategory, itemSubcategory)
- [x] Atualizar ProductDetail.tsx para exibir campos específicos por categoria
- [x] Atualizar AdminProducts.tsx para exibir campos específicos por categoria
- [x] Criar componente ProductModal com carrossel de fotos e detalhes do produto
- [x] Integrar ProductModal ao Home.tsx com clique na imagem
- [ ] Adicionar filtro de faixa de preço no catálogo público
- [ ] Implementar busca por nome/modelo de produto
- [ ] Adicionar avaliações e comentários de clientes
- [ ] Implementar sistema de notificações de novos produtos

## Atualizações Anteriores
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
- [x] Colocar logo branca no header
- [x] Remover logo azul do banner
- [x] Implementar carrinho de compras (adicionar/remover produtos, atualizar quantidade)
- [x] Integrar métodos de pagamento (débito/crédito/PIX)
- [x] Encaminhar pedido para WhatsApp (35998782791)
- [x] Desvincular parcelamentos do carrinho
- [x] Mover seleção de parcelas para checkout final via WhatsApp
- [x] Remover texto "Qual opção de parcelamento você deseja?" da mensagem WhatsApp


## Layout do Catálogo - Reformulação
- [ ] Redesenhar grid com imagens menores e padronizadas
- [ ] Implementar toggle entre vista em lista e vista em grade
- [ ] Reduzir altura dos cards de produtos
- [ ] Mostrar descrição compacta com campos principais da categoria
- [ ] Padronizar tamanho das imagens (ex: 200x200px ou 250x250px)
