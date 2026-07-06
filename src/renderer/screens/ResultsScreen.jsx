import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export default function ResultsScreen({ result, onContinue }) {
  const [openIndex, setOpenIndex] = useState(0);
  const passed = result.passed;

  return (
    <div className="animate-fade-in">
      <div className="mb-7 flex flex-col items-center text-center">
        {passed ? <CheckCircle2 className="mb-4 h-20 w-20 text-green-500" /> : <XCircle className="mb-4 h-20 w-20 text-red-500" />}
        <h1 className="text-4xl font-extrabold">{passed ? 'Тема пройдена' : 'Нужно повторить'}</h1>
        <p className="mt-3 text-3xl font-bold text-zinc-100">{result.score}/100</p>
        <p className="mt-3 max-w-2xl text-zinc-400">{result.encouragement}</p>
      </div>

      <Card className="max-h-[calc(100vh-360px)] overflow-y-auto">
        {result.review?.map((item, index) => (
          <div key={`${item.question}-${index}`} className="border-b border-zinc-800 last:border-b-0">
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-800/60"
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            >
              <span className="font-semibold text-zinc-100">{item.question}</span>
              <span className={item.is_correct ? 'text-green-400' : 'text-red-400'}>{item.is_correct ? 'Верно' : 'Ошибка'}</span>
            </button>
            {openIndex === index && (
              <div className="space-y-3 px-5 pb-5 text-sm leading-6 text-zinc-300">
                <p><span className="text-zinc-500">Твой ответ:</span> {String(item.user_answer ?? 'Нет ответа')}</p>
                <p><span className="text-zinc-500">Правильно:</span> {String(item.correct_answer ?? '')}</p>
                <p>{item.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </Card>

      <div className="mt-7 flex justify-center">
        <Button size="lg" variant={passed ? 'success' : 'primary'} onClick={onContinue}>
          Продолжить
        </Button>
      </div>
    </div>
  );
}
