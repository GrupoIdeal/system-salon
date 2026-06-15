# Relatório de Acessibilidade — BeautySalon Access

**Projeto:** Projeto Integrado IV (2026.1)  
**Disciplina:** Libras  
**Data:** 15 de junho de 2026

---

## 1. Introdução

Este relatório documenta as implementações de acessibilidade do sistema **BeautySalon Access**, com foco em recursos para a comunidade surda e pessoas com deficiência auditiva. A Língua Brasileira de Sinais (Libras), reconhecida pela Lei nº 10.436/2002 e regulamentada pelo Decreto nº 5.626/2005, é o principal meio de comunicação da comunidade surda brasileira.

O sistema adota os princípios do **Desenho Universal** e as diretrizes **WCAG 2.1** (Web Content Accessibility Guidelines) para garantir que todos os usuários, independentemente de suas capacidades, possam utilizar plenamente as funcionalidades do sistema.

---

## 2. Recursos de Acessibilidade Implementados

### 2.1 Modo de Alto Contraste

| Característica | Detalhe |
|---------------|---------|
| **Ativação** | Botão na barra de acessibilidade (presente em todas as páginas) |
| **Classes CSS** | `.high-contrast` aplicada ao elemento `<html>` |
| **Persistência** | Preferência salva em `localStorage` |
| **Cores** | Fundo preto (#000), texto branco (#fff), bordas e ícones com contraste elevado |
| **Conformidade** | Atende critério WCAG 2.1 AA (contraste mínimo 4.5:1 para texto normal) |

### 2.2 Ajuste de Tamanho de Fonte

| Característica | Detalhe |
|---------------|---------|
| **Controles** | Botões +A (aumentar) e -A (diminuir) na barra de acessibilidade |
| **Limites** | Mínimo: 14px / Máximo: 24px (tamanho base) |
| **Persistência** | Tamanho salvo em `localStorage` |
| **Aplicação** | Ajusta `font-size` no elemento raiz, todo o sistema escala proporcionalmente |

### 2.3 Central de Ajuda em Libras (`/ajuda-libras`)

Página dedicada com recursos educacionais em Libras:

| Recurso | Quantidade | Formato |
|---------|-----------|--------|
| **Alfabeto manual** | 27 letras (A-Z + Ç) | Imagens fotográficas reais (.jpg) |
| **Números** | 10 dígitos (0-9) | Imagens fotográficas reais (.jpg) |
| **Frases comuns** | 10 frases | Descrições textuais do movimento das mãos |
| **Vídeos de apoio** | 3 vídeos | Links para YouTube (abre em nova aba) |

**Descrição dos sinais do alfabeto:**

| Letra | Configuração das mãos |
|-------|----------------------|
| A | Mão fechada com polegar estendido para cima |
| B | Mão aberta com todos os dedos estendidos e unidos |
| C | Mão formando formato da letra C com os dedos curvados |
| Ç | Movimento do C com a cedilha (C + movimento do gancho) |
| D | Mão fechada com indicador levantado, polegar tocando o médio |
| E | Dedos dobrados, polegar sobre os dedos |
| F | Polegar e indicador formando círculo, demais dedos estendidos |
| G | Mão fechada com indicador apontando para frente |
| H | Indicador e médio estendidos na horizontal |
| I | Mão fechada com mindinho levantado |
| J | Mindinho desenha a letra J no ar |
| K | Indicador e médio abertos, polegar entre eles |
| L | Indicador para cima e polegar estendido formando L |
| M | Polegar sob os dedos indicador, médio e anelar |
| N | Polegar sob os dedos indicador e médio |
| O | Todos os dedos formando círculo (formato de O) |
| P | Indicador apontando para frente, médio atrás |
| Q | Polegar e indicador para baixo como pinça |
| R | Indicador e médio cruzados |
| S | Mão fechada com polegar sobre os dedos |
| T | Polegar entre indicador e médio |
| U | Indicador e médio unidos apontando para cima |
| V | Indicador e médio abertos em formato de V |
| W | Indicador, médio e anelar estendidos (3 dedos) |
| X | Indicador curvado formando gancho |
| Y | Polegar e mindinho estendidos |
| Z | Indicador desenha a letra Z no ar |

**Descrição dos números:**

| Número | Configuração das mãos |
|--------|----------------------|
| 0 | Dedos formando círculo (formato de zero) |
| 1 | Indicador levantado |
| 2 | Indicador e médio levantados |
| 3 | Polegar, indicador e médio levantados |
| 4 | Quatro dedos levantados (polegar sobre a palma) |
| 5 | Mão aberta com todos os dedos estendidos |
| 6 | Polegar toca o mindinho, demais dedos levantados |
| 7 | Polegar toca o anelar, demais dedos levantados |
| 8 | Polegar toca o dedo médio, demais dedos estendidos |
| 9 | Polegar toca o indicador, demais dedos estendidos |

**Frases comuns em Libras:**

| Frase | Movimento das mãos |
|-------|-------------------|
| Olá | Mão aberta balançando de um lado para o outro |
| Bom dia | Mão direita no peito e abre para cima |
| Obrigado | Mão fechada no queixo abre para frente |
| Por favor | Mãos abertas fazendo movimento circular no peito |
| Desculpa | Mão fechada esfrega o peito em movimento circular |
| Sim | Mão fechada balançando para cima e para baixo |
| Não | Mão aberta balançando de um lado para o outro |
| Beleza | Mão aberta desliza pela bochecha |
| Agendar | Mãos fechadas uma sobre a outra abrindo |
| Preço | Mão fechada esfrega o polegar nos dedos |

---

## 3. Vídeos de Apoio em Libras

O sistema integra links para vídeos educativos no YouTube que complementam o aprendizado:

| Vídeo | Conteúdo | Link |
|-------|----------|------|
| Apoio Comercial | Sinais do contexto comercial em Libras | YouTube (8hnL2W5fDPg) |
| Alfabeto em Libras | Demonstração completa do alfabeto manual | YouTube (NJU2vYoWrrI) |
| Sinais em Libras | Sinais do cotidiano | YouTube (yat_mbtbE9k) |

Cada vídeo é apresentado com thumbnail, botão de play e abre em nova aba para não interromper a navegação no sistema.

---

## 4. Navegação e Interface

### 4.1 Navegação por Teclado

| Elemento | Suporte |
|----------|---------|
| Tab | Navega entre elementos interativos em ordem lógica |
| Enter/Space | Ativa botões e links |
| Escape | Fecha modais e diálogos |
| Arrow keys | Navega em calendários e seletores |
| Atalhos | Sidebar toggle via atalho de teclado |

### 4.2 Atributos ARIA

- `aria-label` em botões com apenas ícones
- `aria-describedby` em campos de formulário com validação
- `role` attributes em componentes dinâmicos (modais, tabs, menus)
- `aria-expanded` em elementos colapsáveis (sidebar)
- `aria-current` em itens de navegação ativos

### 4.3 Layout Responsivo

| Breakpoint | Comportamento |
|------------|--------------|
| Desktop (> 768px) | Sidebar visível com menu completo |
| Mobile (< 768px) | Sidebar vira overlay (Sheet), botão hamburguer no topo |
| Conteúdo | Grid adaptável (1 a 5 colunas conforme largura) |
| Tipografia | Tamanhos relativos (rem) que respeitam zoom do navegador |

### 4.4 Ícones Intuitivos

Todas as funcionalidades são representadas por ícones da biblioteca **Lucide Icons**, acompanhados de texto descritivo:

| Ícone | Funcionalidade |
|-------|---------------|
| 📊 LayoutDashboard | Dashboard |
| 📅 Calendar | Agendamentos |
| 👥 Users | Clientes |
| ✂️ Scissors | Serviços |
| 📦 Package | Produtos |
| 👤 User | Especialistas |
| ⭐ Star | Avaliações |
| 🤟 Hand | Ajuda Libras |

---

## 5. Instalação como PWA

O sistema é instalável como aplicativo nativo via **Progressive Web App (PWA)**:

| Característica | Detalhe |
|---------------|---------|
| **Instalação** | Botão "Adicionar à tela inicial" no navegador |
| **Ícone** | Favicon em múltiplas resoluções (192x192, 512x512) |
| **Tela de abertura** | Splash screen com cor de fundo personalizada |
| **Modo standalone** | Abre sem barra de endereço do navegador |
| **Offline** | Service Worker com 56 assets pre-cacheados |
| **Atualização** | Service Worker auto-update ao detectar nova versão |

---

## 6. Conformidade com Legislação

| Legislação | Requisito | Status |
|-----------|-----------|--------|
| Lei 10.436/2002 | Reconhece Libras como meio legal de comunicação | ✅ Central Libras implementada |
| Decreto 5.626/2005 | Acessibilidade comunicativa para surdos | ✅ Imagens e vídeos em Libras |
| Lei 13.146/2015 (LBI) | Desenho universal em sistemas | ✅ Alto contraste, fonte ajustável, teclado |
| WCAG 2.1 AA | Contraste e navegação acessível | ✅ Conformidade com modo alto contraste |

---

## 7. Recomendações Futuras

Para evoluir a acessibilidade do sistema, recomendam-se as seguintes implementações:

1. **Navegação por voz** — Utilizar Web Speech API para reconhecimento de comandos em português
2. **Vídeos em Libras em todas as páginas** — Player de Libras contextual em cada funcionalidade principal
3. **Vídeo-chamada com intérprete** — Botão para chamar intérprete de Libras via plataforma de vídeo
4. **Testes com a comunidade surda** — Sessões de usabilidade com 3-5 voluntários para validar a interface
5. **Modo de redução de animações** — Respeitar preferência `prefers-reduced-motion` do sistema operacional
6. **Audiodescrição** — Textos alternativos mais descritivos para elementos visuais complexos
7. **Avatar 3D/IA para Libras** — Integração com API de tradução automática português → Libras

---

## 8. Conclusão

O BeautySalon Access implementa recursos significativos de acessibilidade, com destaque para:

- **Central de Libras completa** com 27 imagens reais do alfabeto, 10 números e 10 frases
- **Modo de alto contraste** funcional em todas as páginas
- **Ajuste de tamanho de fonte** com persistência de preferências
- **Interface responsiva** adaptada para desktop e dispositivos móveis
- **Instalação como PWA** com suporte offline
- **Navegação por teclado** e atributos ARIA

O sistema atende aos requisitos de acessibilidade para o Projeto Integrado IV, com potencial de evolução contínua conforme as recomendações listadas.

---

*Documento elaborado para o Projeto Integrado IV — 2026.1*
