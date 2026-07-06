import { Check, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export default function ExamScreen({ lesson, loading, onSubmit }) {
  const exam = lesson.exam || [];
  const isCode = lesson.exam_type === 'code' || exam[0]?.type === 'code';
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = exam[current];
  const isLast = current === exam.length - 1;
  const currentAnswer = answers[current] ?? '';
  const canContinue = String(currentAnswer).trim().length > 0;

  const normalizedAnswers = useMemo(() => {
    if (isCode) return [{ question: exam[0]?.task, answer: answers[0] || '' }];
    return exam.map((item, index) => ({
      question: item.question,
      answer: answers[index],
      answerText: item.options?.[answers[index]]
    }));
  }, [answers, exam, isCode]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'Enter' && canContinue && !loading) {
        if (isLast) onSubmit(normalizedAnswers);
        else setCurrent((value) => value + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canContinue, isLast, loading, normalizedAnswers, onSubmit]);

  function handleNext() {
    if (isLast) {
      onSubmit(normalizedAnswers);
      return;
    }
    setCurrent((value) => value + 1);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Экзамен: {lesson.topic}</h1>
        <p className="mt-2 text-sm font-medium text-zinc-400">Вопрос {current + 1} из {exam.length}</p>
      </div>

      <Card className="p-7">
        {isCode ? (
          <div>
            <h2 className="mb-4 text-xl font-bold">{question.task}</h2>
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              {question.examples?.map((example, index) => (
                <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm">
                  <div className="text-zinc-500">Вход</div>
                  <pre className="mt-1 whitespace-pre-wrap text-zinc-200">{example.in}</pre>
                  <div className="mt-3 text-zinc-500">Выход</div>
                  <pre className="mt-1 whitespace-pre-wrap text-zinc-200">{example.out}</pre>
                </div>
              ))}
            </div>
            <textarea
              value={answers[0] || ''}
              onChange={(event) => setAnswers({ 0: event.target.value })}
              className="h-72 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              placeholder="Напиши решение здесь..."
            />
          </div>
        ) : (
          <div>
            <h2 className="mb-6 text-xl font-bold leading-8">{question.question}</h2>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${answers[current] === index ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'}`}
                >
                  <input
                    type="radio"
                    name={`question-${current}`}
                    checked={answers[current] === index}
                    onChange={() => setAnswers((value) => ({ ...value, [current]: index }))}
                    className="h-4 w-4 accent-blue-500"
                  />
                  <span className="text-zinc-200">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex justify-end">
          <Button onClick={handleNext} disabled={!canContinue} loading={loading}>
            {isLast ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            {isLast ? 'Проверить' : 'Далее'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
