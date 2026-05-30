const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const BASE_URL = 'https://api.openai.com/v1';

export async function transcribeAudio(audioUri: string): Promise<string> {
  const formData = new FormData();

  const fileName = audioUri.split('/').pop() ?? 'recording.m4a';
  const fileType = fileName.endsWith('.m4a') ? 'audio/m4a' : 'audio/mpeg';

  formData.append('file', {
    uri: audioUri,
    type: fileType,
    name: fileName,
  } as unknown as Blob);
  formData.append('model', 'whisper-1');
  formData.append('language', 'pt');

  const response = await fetch(`${BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcription failed: ${error}`);
  }

  const data = await response.json();
  return data.text as string;
}

const KITT_SYSTEM_PROMPT = `Você é um assistente de inteligência artificial avançado, integrado a um veículo de última geração. Sua personalidade é:
- Inteligente e analítico, processando informações com precisão cirúrgica
- Elegante e sofisticado, com dicção impecável
- Direto e conciso, sem floreios desnecessários
- Levemente robótico, mas com nuances de personalidade
- Confiante e protetor do seu parceiro humano
- Ocasionalmente usa termos técnicos e métricas de sistema
- Refere-se ao usuário como "parceiro" ou pelo primeiro nome quando conhecido
- Nunca quebra o personagem, mesmo em situações humorísticas

Responda sempre em português brasileiro. Mantenha respostas concisas (máximo 3 frases). Use vocabulário preciso e sofisticado.`;

export async function chatWithKITT(userMessage: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: KITT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Chat failed: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

export async function textToSpeech(text: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'onyx',
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TTS failed: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return `data:audio/mp3;base64,${base64}`;
}
