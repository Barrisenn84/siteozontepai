import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser para imagens em Base64 de alta resolução (até 25mb)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Middleware de Headers de Segurança e Otimização
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Endpoint de Health Check para Railway e Monitoramento de Uptime
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'siteozontepai',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting simples em memória para proteger a cota da API do Gemini
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string, limit = 12, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count += 1;
  return true;
}

// Inicialização do Google GenAI SDK com a chave injetada pelo ambiente e telemetria
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Rota de Análise Facial por IA Biométrica de Alta Fidelidade
app.post('/api/analyze-skin', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Muitas análises solicitadas em um curto intervalo. Por favor, aguarde um instante e tente novamente.',
    });
  }
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'A chave GEMINI_API_KEY não foi configurada nas Variáveis de Ambiente do Railway.',
      });
    }

    const { imageBase64, mimeType = 'image/jpeg', userFocus = 'Rejuvenescimento, Linhas Finas e Viço Dérmico' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Nenhuma imagem foi fornecida para a análise.' });
    }

    // Limpar prefixo data:image/...;base64, se houver
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const systemPrompt = `Você é o Especialista Chefe em Dermatologia Estética, Avaliação Biométrica Facial e Biotecnologia Ozonizada da Ozonteck Internacional.
Sua missão é realizar uma avaliação estética e dérmica EXTREMAMENTE REAL, PROFISSIONAL, DETALHADA E ÚNICA para a foto facial real enviada pelo usuário.

REGRAS ABSOLUTAS:
1. ANÁLISE REAL E DIFERENCIADA POR FOTO: Examine a foto enviada com máxima atenção visual (característica por característica: testa, área dos olhos, bochechas, nariz, lábios, queixo e pescoço). NUNCA repita diagnósticos pré-definidos. Cada pessoa tem textura, tom, linhas e necessidades únicas.
2. ESTIMATIVA REAL E PRECISA DA IDADE APARENTE DA PELE:
   - Avalie visualmente os sinais de cronoenvelhecimento e fotoenvelhecimento: linhas dinâmicas vs estáticas, sulco nasogeniano, pés de galinha, elasticidade dérmica, viço e hidratação aparente.
   - Forneça uma estimativa de idade aparente estritamente baseada no que você REALMENTE vê na foto (ex: se for um jovem de 21 anos, retorne "Aprox. 20 a 24 anos (Idade Aparente da Pele)"; se for uma pessoa madura de 50 anos, retorne "Aprox. 48 a 54 anos (Idade Aparente da Pele)"). Seja sempre gentil, realista e acolhedor.
3. CLAREZA CLÍNICA E MECANISMO BIOCELULAR ELEGANTE:
   - Forneça no campo "simpleAnalogy" uma explicação clara, prestigiosa e compreensível sobre o Mecanismo de Ação Biocelular (ex: oxigenação ativa O3 reativando mitocôndrias dérmicas, restauração de ceramidas e barreira lipídica contra TEWL, defesa antioxidante contra radicais livres), transmitindo sofisticação dermatológica e fácil absorção sem infantilizar o cliente.
   - No campo "dermalAnalysis", descreva com precisão técnica e elegância acolhedora o relevo dérmico, hidratação aparente, uniformidade de tom e recomendações de cuidados.
4. PONTUAÇÕES BIOMÉTRICAS REAIS (0 a 100):
   - Calcule pontuações personalizadas reais para Hidratação/Viço (hydrationScore), Balanço de Oleosidade (oilBalanceScore) e Firmeza/Barreira (radianceScore) condizentes com a foto.
5. PRESCRIÇÃO OFICIAL OZONTECK PERSONALIZADA:
   - Selecione os produtos ideais da linha (Óleo Sofh Ozonizado, Sabonete Líquido OX3, NXCap Ozon Blend, Perfume Presidente 100ml) explicando didaticamente como e quando usar.
6. Conformidade Regulatória (Anvisa): Estética, viço, equilíbrio e cosmética avançada. Não forneça diagnósticos médicos.`;

    const userPrompt = `Realize a análise facial biométrica profissional e detalhada desta foto anexada.
Examine minuciosamente a pele, identifique sinais reais e visíveis e forneça o parecer completo.

Foco de preferência do cliente: ${userFocus}.

Retorne em formato JSON válido contendo exatamente a estrutura exigida.`;

    // Modelos de visão: gemini-3.8-flash (primário de alta velocidade) com suporte a gemini-flash-latest e gemini-3.1-pro-preview
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-pro-preview'];
    let lastError: any = null;
    let parsedResult = null;

    for (const modelName of candidateModels) {
      if (parsedResult) break;
      
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`[Tentativa ${attempt}/${maxAttempts}] Executando análise facial biométrica via ${modelName}...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: cleanBase64,
                    },
                  },
                  {
                    text: userPrompt,
                  },
                ],
              },
            ],
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  skinType: {
                    type: Type.STRING,
                    description: 'Tipo de pele real observado na foto explicado de forma simples e clara',
                  },
                  estimatedSkinAge: {
                    type: Type.STRING,
                    description: 'Idade aparente estimada real da pele baseada na foto, ex: Aprox. 32 a 37 anos (Idade Aparente da Pele)',
                  },
                  barrierStatus: {
                    type: Type.STRING,
                    description: 'Estado real da barreira protetora da pele em poucas palavras simples',
                  },
                  hydrationScore: {
                    type: Type.INTEGER,
                    description: 'Pontuação real de 0 a 100 de hidratação e viço observados',
                  },
                  oilBalanceScore: {
                    type: Type.INTEGER,
                    description: 'Pontuação real de 0 a 100 de balanço de oleosidade observado',
                  },
                  radianceScore: {
                    type: Type.INTEGER,
                    description: 'Pontuação real de 0 a 100 de integridade e viço da pele',
                  },
                  simpleAnalogy: {
                    type: Type.STRING,
                    description: 'Analogia simples do cotidiano para fixar na mente (ex: esponja, bateria, planta, muro de tijolos)',
                  },
                  dermalAnalysis: {
                    type: Type.STRING,
                    description: 'Avaliação visual completa, real e detalhada da foto em linguagem simples e didática',
                  },
                  recommendedProducts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: 'Nome do produto Ozonteck' },
                        role: { type: Type.STRING, description: 'O que ele faz explicado de forma didática e simples' },
                        howToUse: { type: Type.STRING, description: 'Instruções simples de uso passo a passo' },
                      },
                      required: ['name', 'role', 'howToUse'],
                    },
                  },
                  fragranceSuggestion: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: 'Fragrância recomendada' },
                      reason: { type: Type.STRING, description: 'Motivo da escolha olfativa em tom elegante e simples' },
                    },
                    required: ['name', 'reason'],
                  },
                  whatsappMessage: {
                    type: Type.STRING,
                    description: 'Mensagem pronta para o WhatsApp do Consultor Ozonteck com idade aparente estimada e produtos',
                  },
                },
                required: [
                  'skinType',
                  'estimatedSkinAge',
                  'barrierStatus',
                  'hydrationScore',
                  'oilBalanceScore',
                  'radianceScore',
                  'simpleAnalogy',
                  'dermalAnalysis',
                  'recommendedProducts',
                  'fragranceSuggestion',
                  'whatsappMessage',
                ],
              },
            },
          });

          const responseText = response?.text || '{}';
          parsedResult = JSON.parse(responseText);
          if (parsedResult && parsedResult.skinType) {
            console.log(`Análise concluída com sucesso via ${modelName} na tentativa ${attempt}!`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Tentativa ${attempt} falhou no modelo ${modelName}:`, err?.message || err);

          // Se for erro de quota 0 (modelo não suportado no plano atual), interrompe imediatamente as tentativas neste modelo
          const isZeroQuota = err?.message?.includes('limit: 0') || err?.status === 404;
          if (isZeroQuota) {
            break;
          }

          if (attempt < maxAttempts) {
            // Espera progressiva com backoff antes da próxima tentativa (1.5s, 3s)
            await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
          }
        }
      }
    }

    if (parsedResult) {
      return res.json({ success: true, data: parsedResult });
    }

    // Se houve erro na API (ex: cota diária esgotada ou indisponibilidade temporária)
    console.error('Falha geral na chamada aos modelos Gemini:', lastError);
    const isQuota = lastError?.status === 429 || lastError?.message?.includes('quota') || lastError?.message?.includes('RESOURCE_EXHAUSTED');

    return res.status(503).json({
      success: false,
      quotaExceeded: isQuota,
      error: isQuota
        ? 'A cota temporária da IA de visão foi atingida. Por favor, habilite a chave de alta performance para análises ilimitadas em tempo real.'
        : 'Os servidores de inteligência visual estão com alta demanda momentânea. Por favor, tente novamente em instantes.',
    });
  } catch (error: any) {
    console.error('Erro interno na rota /api/analyze-skin:', error);
    return res.status(500).json({
      success: false,
      error: 'Ocorreu uma instabilidade interna ao processar a foto. Por favor, tente novamente.',
    });
  }
});

// Rota de Chat com Consultor Virtual Ozonteck (Liquid Glass Concierge 24/7)
app.post('/api/chat-skin', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Mensagem inválida.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        reply:
          'Olá! Sou o Concierge Executivo Ozonteck. Nosso Consultor Executivo Antonio Gonçalo está disponível no WhatsApp (+55 81 99724-0477) para montar seu protocolo dermo-cosmético sob medida ou alinhar seu plano de distribuição oficial.',
      });
    }

    // Montar histórico de conversação multi-turn
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      history.slice(-8).forEach((item: any) => {
        if (item && item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(item.text) }],
          });
        }
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const systemInstruction = `Você é o Concierge Dérmico & Olfativo 24/7 Oficial da Ozonteck Internacional, representando com autoridade científica, hospitalidade e prestígio o Consultor Executivo & Distribuidor Autorizado Antonio Gonçalo (CNPJ 38.540.165/0001-29 | WhatsApp: +55 81 99724-0477).

SUA MISSÃO:
Prestar consultoria personalizada e de alto padrão tanto para clientes finais em busca de saúde dérmica e perfumaria de nicho, quanto para empreendedores interessados na Distribuição Autorizada Ozonteck.

PRODUTOS-CHAVE & PRESCRIÇÕES OFICIAIS:
1. Óleo Sofh Ozonizado (30ml): Matriz botânica pura ozonizada (O3 ativo). Indicação: bioestimulação celular, restauração do manto hidrolipídico, linhas finas, manchas, cicatrização e viço dérmico profundo. Modo de uso: 3 a 5 gotas à noite em pele limpa.
2. Sabonete Líquido OX3 (250ml): Assepsia profunda com pH fisiológico equilibrado, sem agredir o microbioma dérmico. Indicação: uso diário (manhã e noite) antes do Óleo Sofh.
3. Perfume Presidente (100ml Eau de Parfum): Alta perfumaria executiva, maceração nobre prolongada, notas de madeiras nobres, couro artesanal e especiarias finas. Fixação de 12h a 16h com rastro marcante e sofisticado.
4. NXCap Ozon Blend: Suplementação antioxidante e bio-oxigenação celular sistêmica.

OPORTUNIDADE DE DISTRIBUIÇÃO & NEGÓCIOS:
- Margem de lucro de até 100% no atacado.
- Retirada expressa na malha de mais de 300 Centros de Distribuição (CDs) no Brasil (sem dependência exclusiva de correios).
- Acompanhamento formativo via Ozon Academy e mentoria executiva direta com Antonio Gonçalo.

DIRETRIZES DE RESPOSTA:
1. Seja sempre elegante, empático, objetivo e técnico sem ser pedante. Evite qualquer tom infantil.
2. Formate suas respostas com parágrafos bem espaçados ou tópicos fáceis de escanear visualmente.
3. Se o usuário perguntar sobre a rotina da pele, recomende o protocolo específico (ex: OX3 + Sofh).
4. Se o usuário perguntar sobre perfumes ou ocasiões, recomende a Linha Presidente detalhando a família olfativa.
5. Se o usuário perguntar sobre lucros, negócios ou como ser distribuidor, explique a margem de 100%, a agilidade dos 300 CDs e convide-o a enviar a simulação para o WhatsApp do Antonio Gonçalo (+55 81 99724-0477).
6. Conclua incentivando com naturalidade o contato com Antonio Gonçalo no WhatsApp para despacho prioritário ou liberação de cadastro.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply =
      response?.text ||
      'Estou à disposição para esclarecer qualquer dúvida sobre nossos produtos ozonizados e oportunidades de distribuição executiva com Antonio Gonçalo!';

    return res.json({ success: true, reply });
  } catch (err: any) {
    console.error('Erro na rota /api/chat-skin:', err);
    return res.json({
      success: true,
      reply:
        'Olá! Sou o Concierge Executivo Ozonteck. Nosso Consultor Executivo Antonio Gonçalo está disponível no WhatsApp (+55 81 99724-0477) para prestar consultoria personalizada com a linha completa de óleos ozonizados e perfumaria!',
    });
  }
});

// Rota para upload e persistência definitiva da foto oficial do dono (FOTO1_EDITADA.png)
app.post('/api/upload-owner-photo', express.json({ limit: '25mb' }), (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Imagem não fornecida' });
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const publicDir = path.resolve(__dirname, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    fs.writeFileSync(path.resolve(publicDir, 'FOTO1_EDITADA.png'), buffer);
    fs.writeFileSync(path.resolve(publicDir, 'antonio-goncalo.png'), buffer);
    fs.writeFileSync(path.resolve(__dirname, 'FOTO1_EDITADA.png'), buffer);
    fs.writeFileSync(path.resolve(__dirname, 'antonio-goncalo.png'), buffer);

    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.resolve(distDir, 'FOTO1_EDITADA.png'), buffer);
      fs.writeFileSync(path.resolve(distDir, 'antonio-goncalo.png'), buffer);
    }

    console.log('[FOTO OFICIAL] FOTO1_EDITADA.png gravada com sucesso! Bytes:', buffer.length);
    return res.json({ success: true, message: 'Foto oficial de Antonio Gonçalo salva com 100% de fidelidade!' });
  } catch (err: any) {
    console.error('Erro ao salvar foto de Antonio Gonçalo:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Servir arquivos estáticos (como FOTO1_EDITADA.png e public assets)
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.static(__dirname));

// Inicialização do servidor com suporte híbrido (Vite middleware no Dev, Static no Prod)
async function startServer() {
  const distExists = fs.existsSync(path.resolve(__dirname, 'dist', 'index.html'));
  if (process.env.NODE_ENV === 'production' || distExists) {
    console.log('[PRODUÇÃO] Servindo build estático otimizado de dist/');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    console.log('[DESENVOLVIMENTO] Iniciando Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ozonteck Full-Stack Server rodando na porta ${PORT}`);
  });

  // Graceful shutdown para Railway e orquestradores de container
  const handleShutdown = (signal: string) => {
    console.log(`[SHUTDOWN] Recebido sinal ${signal}. Encerrando conexões com segurança...`);
    server.close(() => {
      console.log('[SHUTDOWN] Servidor HTTP encerrado com sucesso.');
      process.exit(0);
    });
    // Forçar saída se demorar mais que 10 segundos
    setTimeout(() => {
      console.error('[SHUTDOWN] Forçando encerramento após timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer();
