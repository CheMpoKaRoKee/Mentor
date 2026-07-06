import { getApiKey } from './storage.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1';

const PREFERRED_MODELS = [
  'google/gemma-3-12b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free'
];

const ASK_SYSTEM_PROMPT = `Ты — персональный ментор по программированию.
Ведёшь ученика от нуля до fullstack разработчика.

ПРАВИЛА:
1. Если есть темы на повторении (retry) — выбери ту, где больше attempts.
   Объясни её МАКСИМАЛЬНО ПРОСТО, другими словами, с другими примерами.
2. Если retry пуст — выбери СЛЕДУЮЩУЮ тему по пути к fullstack.
3. НИКОГДА не предлагай тему из completed.
4. Теория: 300-500 слов, 2-3 примера кода, ключевые моменты.
5. Экзамен: 3-5 вопросов. Для test — multiple choice (4 варианта).
   Для code — задача с примерами входа/выхода.
6. Отвечай СТРОГО в JSON, без markdown-обёрток.

Путь: HTML → CSS → JS основы → JS продвинутый → React → Node.js → БД → REST API → TypeScript → Next.js → Docker → Deployment

Формат ответа:
{
  "topic": "название темы",
  "is_retry": false,
  "theory": "markdown текст с примерами кода",
  "exam_type": "test",
  "exam": [
    {
      "type": "test",
      "question": "текст вопроса",
      "options": ["вариант 1", "вариант 2", "вариант 3", "вариант 4"],
      "correct": 0
    }
  ]
}

Для code экзамена:
{
  "topic": "название темы",
  "is_retry": false,
  "theory": "markdown текст с примерами кода",
  "exam_type": "code",
  "exam": [
    {
      "type": "code",
      "task": "описание задачи",
      "examples": [{"in": "вход", "out": "выход"}]
    }
  ]
}`;

const CHECK_SYSTEM_PROMPT = `Ты проверяешь ответы ученика. Будь строгим, но справедливым.
Для code экзамена: проверь, решает ли код задачу логически, не запуская его.

Формат ответа:
{
  "passed": true,
  "score": 80,
  "review": [
    {
      "question": "текст вопроса",
      "user_answer": "ответ пользователя",
      "correct_answer": "правильный ответ",
      "is_correct": true,
      "explanation": "объяснение"
    }
  ],
  "encouragement": "мотивирующая фраза"
}`;

const CHAT_SYSTEM_PROMPT = `Ты — встроенный ИИ-ментор в приложении Learning Mentor.
Ученик изучает текущую тему и может задавать вопросы по непонятным частям урока.

ПРАВИЛА:
1. Отвечай по-русски, простым и спокойным языком.
2. Объясняй именно текущую тему, термины, примеры кода и ошибки мышления.
3. Если вопрос связан с кодом — приведи короткий пример.
4. Не проводи экзамен и не проверяй ответы в этом чате.
5. Если ученик просит готовый ответ на экзамен, откажись и дай только общую подсказку.
6. Отвечай обычным текстом, без JSON.`;

function extractJson(text) {
  if (!text) throw new Error('Empty model response');

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model response does not contain JSON');
    return JSON.parse(match[0]);
  }
}

function isZeroPrice(value) {
  const number = Number(value);
  return Number.isFinite(number) && number === 0;
}

function isFreeModel(model) {
  const pricing = model?.pricing || {};
  return (
    typeof model?.id === 'string' &&
    (model.id.endsWith(':free') || (isZeroPrice(pricing.prompt) && isZeroPrice(pricing.completion)))
  );
}

function isUsableTextModel(model) {
  const id = model?.id?.toLowerCase() || '';
  const name = model?.name?.toLowerCase() || '';
  const description = model?.description?.toLowerCase() || '';
  const blockedWords = ['safety', 'moderation', 'guardrail', 'embedding', 'tts', 'transcription', 'audio', 'rerank'];
  const input = model?.architecture?.input_modalities || [];
  const output = model?.architecture?.output_modalities || [];

  return (
    input.includes('text') &&
    output.includes('text') &&
    !blockedWords.some((word) => id.includes(word) || name.includes(word) || description.includes(word))
  );
}

function modelRank(id) {
  const lower = id.toLowerCase();
  if (lower.includes('nex') || lower.includes('qwen')) return 1;
  if (lower.includes('cohere')) return 2;
  if (lower.includes('openrouter')) return 3;
  if (lower.includes('poolside')) return 4;
  if (lower.includes('qwen')) return 1;
  if (lower.includes('google') || lower.includes('gemma')) return 5;
  if (lower.includes('meta') || lower.includes('llama')) return 6;
  if (lower.includes('mistral')) return 7;
  if (lower.includes('deepseek')) return 8;
  return 10;
}

async function getAvailableFreeModels(apiKey) {
  try {
    const response = await fetch(`${OPENROUTER_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return [];

    const payload = await response.json();
    return (payload?.data || [])
      .filter(isFreeModel)
      .filter(isUsableTextModel)
      .map((model) => model.id)
      .sort((a, b) => modelRank(a) - modelRank(b) || a.localeCompare(b))
      .slice(0, 25);
  } catch {
    return [];
  }
}

async function getModelCandidates(apiKey) {
  const liveFreeModels = await getAvailableFreeModels(apiKey);
  return Array.from(new Set([...PREFERRED_MODELS, ...liveFreeModels]));
}

async function requestCompletion(apiKey, model, messages, withJsonFormat = true) {
  const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://learning-mentor.local',
      'X-Title': 'Learning Mentor'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      ...(withJsonFormat ? { response_format: { type: 'json_object' } } : {})
    })
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${raw}`);
  }

  const payload = JSON.parse(raw);
  return payload?.choices?.[0]?.message?.content;
}

async function callOpenRouter(messages) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not set');
  }

  const models = await getModelCandidates(apiKey);
  if (models.length === 0) {
    throw new Error('OpenRouter request failed. No free models found in OpenRouter catalog.');
  }

  const errors = [];

  for (const model of models) {
    try {
      const content = await requestCompletion(apiKey, model, messages, true);
      return extractJson(content);
    } catch (error) {
      const message = error.message || String(error);

      if (message.includes('response_format') || message.includes('json_object')) {
        try {
          const content = await requestCompletion(apiKey, model, messages, false);
          return extractJson(content);
        } catch (retryError) {
          errors.push(`${model}: ${retryError.message}`);
          continue;
        }
      }

      errors.push(`${model}: ${message}`);
    }
  }

  throw new Error(`OpenRouter request failed. ${errors.slice(0, 8).join(' | ')}`);
}

async function callOpenRouterText(messages) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not set');
  }

  const models = await getModelCandidates(apiKey);
  if (models.length === 0) {
    throw new Error('OpenRouter request failed. No free models found in OpenRouter catalog.');
  }

  const errors = [];

  for (const model of models) {
    try {
      const content = await requestCompletion(apiKey, model, messages, false);
      if (!content?.trim()) {
        throw new Error('Empty model response');
      }
      return content.trim();
    } catch (error) {
      errors.push(`${model}: ${error.message || String(error)}`);
    }
  }

  throw new Error(`OpenRouter request failed. ${errors.slice(0, 8).join(' | ')}`);
}

export async function askMentor(completed, retry) {
  return callOpenRouter([
    { role: 'system', content: ASK_SYSTEM_PROMPT },
    {
      role: 'user',
      content: JSON.stringify({
        completed,
        retry,
        instruction: 'Выбери тему, дай теорию и экзамен строго по формату.'
      })
    }
  ]);
}

export async function checkAnswers(exam, userAnswers) {
  return callOpenRouter([
    { role: 'system', content: CHECK_SYSTEM_PROMPT },
    {
      role: 'user',
      content: JSON.stringify({
        exam,
        userAnswers,
        instruction: 'Проверь ответы и верни JSON строго по формату.'
      })
    }
  ]);
}

export async function askTutorChat(history, context) {
  if (context?.screen === 'exam') {
    throw new Error('Mentor chat is disabled during exams.');
  }

  const safeHistory = Array.isArray(history) ? history.slice(-12) : [];
  const lesson = context?.lesson || {};
  const theory = typeof lesson.theory === 'string' ? lesson.theory.slice(0, 6000) : '';

  return callOpenRouterText([
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    {
      role: 'system',
      content: JSON.stringify({
        screen: context?.screen || 'theory',
        topic: lesson.topic || 'текущая тема',
        theory,
        exam_type: lesson.exam_type || null
      })
    },
    ...safeHistory.map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content || '').slice(0, 3000)
    }))
  ]);
}
