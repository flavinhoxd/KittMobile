# KITT Mobile - Assistente de Voz IA

Um aplicativo mobile futurista desenvolvido com React Native e Expo que implementa um assistente pessoal por voz estilo KITT, com visual sci-fi em preto e vermelho neon.

## Características

- **Interface Futurista**: Design HUD sci-fi com animações sofisticadas
- **Assistente de Voz**: Gravação de áudio, transcrição via OpenAI Whisper e respostas via GPT
- **Síntese de Voz**: Respostas convertidas para áudio com voice "onyx"
- **Orbe Pulsante**: Animações reanimated com múltiplos estados (idle, recording, processing, speaking)
- **Tela Principal Premium**: Bordas neon, feedback visual avançado e responsivo

## Tecnologias

- React Native + Expo
- TypeScript
- React Native Reanimated (animações)
- Expo AV (gravação e reprodução de áudio)
- OpenAI APIs (Whisper, Chat Completions, TTS)
- Expo Router (navegação)

## Instalação

### 1. Clonar/Preparar o Projeto

```bash
npm install
```

### 2. Configurar Variável de Ambiente

Copie `.env.example` para `.env` e adicione sua chave da OpenAI:

```bash
cp .env.example .env
```

Edite `.env` com sua chave:
```
EXPO_PUBLIC_OPENAI_API_KEY=seu_token_aqui
```

**IMPORTANTE**: Obtenha sua chave em https://platform.openai.com/api-keys

### 3. Rodar o App

#### Para Expo Go (desenvolvimento rápido):
```bash
npm run dev
```

Após iniciar, escaneie o QR code com seu telefone usando:
- **iOS**: App de Câmera > Abrir com Expo Go
- **Android**: App Expo Go > Escanear QR Code

#### Para Build Web:
```bash
npm run build:web
```

A build será gerada em `/dist`

### 4. Testar Localmente

Certifique-se que seu telefone:
- Está na mesma rede Wi-Fi que o computador
- Tem o Expo Go instalado
- Tem permissão de microfone habilitada

## Como Usar

1. **Abra o App**: Veja a tela principal com o orbe KITT pulsante
2. **Clique em "FALAR COM KITT"**: Solicita permissão de microfone
3. **Fale Normalmente**: O status muda para "GRAVANDO..."
4. **Clique Novamente**: Para a gravação
5. **Veja a Resposta**: A IA transcreve, analisa e responde com áudio
6. **Novo Ciclo**: Clique em "NOVA SESSÃO" para começar novamente

## Limitações

- **Apenas em Dispositivos Físicos**: A gravação de áudio não funciona no Expo Go web
- **Requer Microfone**: Dispositivo deve ter microfone funcionando
- **Conexão de Internet**: Necessária para APIs da OpenAI
- **Créditos OpenAI**: Cada uso consome créditos de API

## Estrutura de Arquivos

```
project/
├── app/
│   ├── _layout.tsx          # Root layout com carregamento de fonts
│   ├── index.tsx            # Tela principal KITT
│   └── +not-found.tsx       # 404 page
├── components/
│   └── PulsingOrb.tsx       # Componente orbe animado
├── services/
│   └── openai.ts            # API calls (Whisper, Chat, TTS)
├── types/
│   └── env.d.ts             # Tipagem de env vars
├── hooks/
│   └── useFrameworkReady.ts # Hook framework (não modificar)
├── .env.example             # Template de env vars
├── package.json
├── tsconfig.json
└── README.md
```

## Personalidade da IA (KITT)

O assistente é configurado para:
- Ser inteligente e analítico
- Falar com elegância e sofisticação
- Ser direto e conciso
- Tom levemente robótico
- Referir-se ao usuário como "parceiro"
- Respostas em português brasileiro
- Máximo 3 frases por resposta

Edite o `KITT_SYSTEM_PROMPT` em `services/openai.ts` para alterar a personalidade.

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|------------|-----------|
| `EXPO_PUBLIC_OPENAI_API_KEY` | Sim | Token da API OpenAI com acesso a Whisper, GPT-4O-mini e TTS |

## Troubleshooting

### "Permissão de microfone negada"
- Verifique as configurações de permissões do seu telefone
- Desinstale e reinstale o Expo Go
- Tente em outro dispositivo

### "Áudio não funciona"
- Verifique volume do dispositivo
- Teste com o speaker físico ativado
- Reinicie o app

### "Erro de API"
- Verifique se sua chave de API é válida
- Confirme que tem créditos disponíveis na OpenAI
- Verifique conexão de internet

### "App não inicia no Expo Go"
- Limpe o cache: `npx expo start -c`
- Reinstale o Expo Go
- Verifique compatibilidade de versões

## Performance

- Animações rodam a 60fps com React Native Reanimated
- Áudio é processado em cache temporário
- Máximo de 3 frases garante respostas rápidas

## Segurança

- Chave de API carregada apenas de variáveis de ambiente
- Áudio temporário é deletado automaticamente
- Sem dados persistidos localmente (por padrão)

## Roadmap Futuro

- [ ] Histórico de conversas
- [ ] Múltiplas vozes
- [ ] Comandos de sistema (ligar/desligar luz, etc)
- [ ] Suporte a outros idiomas
- [ ] Cache de respostas
- [ ] Integração com Supabase para histórico na nuvem

## Licença

MIT

## Suporte

Para reportar bugs ou sugerir funcionalidades, verifique os logs:

```bash
npm run dev
# Veja os logs no terminal
```

---

**Desenvolvido com ❤️ usando Expo + React Native**
