# Como testar o PWA

## Pré-requisitos

- O app deve estar rodando em **HTTPS** ou **localhost** (Safari exige HTTPS em produção)
- Faça `pnpm build && pnpm start` para testar em modo produção

## 1. Verificar se está funcionando (qualquer navegador)

1. Abra o app no navegador
2. Abra as **DevTools** (F12 ou Cmd+Option+I)
3. Vá em **Application** (Chrome) ou **Storage** (Firefox)
4. No menu lateral:
   - **Manifest** → deve mostrar nome, ícones e configurações
   - **Service Workers** → deve mostrar o SW registrado como "activated"

## 2. Teste no Safari (iOS / iPadOS)

O Safari **no desktop** não oferece "Adicionar à tela inicial". Use apenas em **iPhone ou iPad**:

1. Abra o Safari no dispositivo
2. Acesse a URL do app (ex: `https://seu-dominio.com`)
3. Toque no botão **Compartilhar** (quadrado com seta para cima)
4. Role até **"Adicionar à Tela de Início"**
5. Toque para confirmar

O ícone deve aparecer na tela inicial com o nome "Graciosa Studio".

## 3. Teste no Chrome (Android ou desktop)

- **Android**: Abra o menu (⋮) → "Adicionar à tela inicial" ou "Instalar app"
- **Desktop**: Ícone de instalação na barra de endereço (ou menu → "Instalar app")

## 4. Se o ícone não aparecer no Safari

- Confirme que está usando **HTTPS** (não HTTP)
- Limpe o cache do Safari: Ajustes → Safari → Limpar Histórico e Dados
- Tente adicionar novamente
- Verifique se `/image/Logo.png` carrega corretamente ao acessar a URL no navegador

## 5. Lighthouse (auditoria PWA)

1. Abra o app no Chrome
2. DevTools → aba **Lighthouse**
3. Marque "Progressive Web App"
4. Clique em "Analyze page load"

O relatório deve indicar se o PWA está configurado corretamente.
