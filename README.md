<div align="center">
  <h1>SIMPATIC</h1>
  <p><b>Sistema de Recomendações de Aquisições de TIC</b></p>
  <p><i>Poder Judiciário do Estado de Goiás (TJGO)</i></p>

  <p>
    <img alt="Status: Em Testes" src="https://img.shields.io/badge/Status-Em_Testes_(Beta)-warning?style=for-the-badge">
    <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E">
  </p>
</div>

---

> ⚠️ **AVISO IMPORTANTE: FASE DE TESTES (BETA)**  
> Este sistema encontra-se atualmente em fase de **testes ativos e homologação (Beta)**.  
> As funcionalidades, interfaces e integrações de Inteligência Artificial estão sujeitas a instabilidades, modificações e aprimoramentos. Os dados gerados não devem ser utilizados em processos oficiais de contratação sem a devida revisão e validação humana por parte da equipe responsável e instâncias competentes.

---

## 📖 Visão Geral

O **SIMPATIC** (Sistema de Recomendações de Aquisições de TIC) é uma aplicação web inovadora desenvolvida para otimizar, padronizar e apoiar a elaboração de documentos fundamentais no processo de planejamento de contratações de Tecnologia da Informação e Comunicação (TIC) do TJGO.

Utilizando integração com modelos avançados de Inteligência Artificial através de arquitetura **RAG (Retrieval-Augmented Generation)**, o sistema propõe textos embasados no contexto histórico e na base de conhecimento institucional, acelerando a criação de:
- **DOD** (Documento de Oficialização da Demanda)
- **ETP** (Estudo Técnico Preliminar)
- **TR** (Termo de Referência)

## ✨ Principais Funcionalidades

- 🧠 **Geração Inteligente de Conteúdo:** Sugestões textuais baseadas em contexto geradas por IA para campos complexos dos artefatos de contratação.
- 📝 **Editor de Documentos Avançado (Rich Text):** Uma interface de edição robusta tipo "Word", permitindo ao usuário revisar as recomendações da IA, aplicar formatações (negrito, itálico, cores, tabelas) e visualizar o documento em tempo real.
- 🔄 **Fluxo de Trabalho Contínuo:** Progressão lógica e guiada entre as etapas (DOD ➡️ ETP ➡️ TR).
- 💾 **Exportação Multi-formato:** Geração e download imediato dos documentos revisados nos formatos nativos PDF, DOCX e ODT.
- ⚙️ **Ambiente Configurável:** Suporte a mock/homologação e integração real com API de backend via chaves dinâmicas.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores práticas e ferramentas modernas do ecossistema front-end:

*   **Core:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build & Tooling:** [Vite](https://vitejs.dev/)
*   **Editor Rich Text:** [Tiptap](https://tiptap.dev/) (baseado em ProseMirror)
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **Estilização:** CSS Customizado focado em perfomance e variáveis de design system institucional.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18.x ou superior recomendada)
- `npm` ou `yarn` instalados.

### Passos para instalação

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd <nome-da-pasta>/front-end
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação no navegador:**
   O terminal exibirá a porta local (geralmente `http://localhost:5173`).

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento com Hot-Module Replacement (HMR).
- `npm run build`: Compila o projeto TypeScript e realiza o build otimizado para produção na pasta `dist/`.
- `npm run lint`: Inspeciona o código em busca de erros de sintaxe e padronização utilizando ESLint.

## 📁 Estrutura do Projeto

```text
src/
├── api/                  # Serviços e integrações com o Backend (Axios/Fetch)
├── assets/               # Imagens, SVGs e arquivos estáticos
├── components/           # Componentes React reutilizáveis
│   ├── features/         # Componentes complexos (ex: DocumentEditor, EditorToolbar)
│   ├── layout/           # Componentes estruturais (Header, Footer, Layout principal)
│   └── ui/               # Componentes de interface genéricos (Botões, Modais, Loaders)
├── config/               # Configurações globais e de ambiente
├── homolog-documents/    # Dados e artefatos em mock para modo homologação
├── pages/                # Componentes que representam páginas (rotas) da aplicação
├── styles/               # CSS global, design tokens e variáveis
├── types/                # Definições de interfaces e tipos TypeScript globais
└── utils/                # Funções utilitárias e helpers genéricos
```

---

_Desenvolvido e mantido para o Poder Judiciário do Estado de Goiás. Todos os direitos reservados._
