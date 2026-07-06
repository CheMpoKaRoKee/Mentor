import ReactMarkdown from 'react-markdown';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import CodeBlock from '../components/CodeBlock.jsx';

export default function TheoryScreen({ lesson, retryAttempts = 0, onReady }) {
  const isRetry = lesson?.is_retry;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{lesson.topic}</h1>
          <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${isRetry ? 'bg-orange-500/15 text-orange-300' : 'bg-blue-500/15 text-blue-300'}`}>
            {isRetry ? `Повторение (попытка ${retryAttempts || 1})` : 'Новая тема'}
          </div>
        </div>
        <Button onClick={onReady}>Я готов к экзамену</Button>
      </div>

      <Card className="max-h-[calc(100vh-230px)] overflow-y-auto p-7">
        <article className="prose prose-invert max-w-none prose-headings:text-zinc-50 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-li:text-zinc-300 prose-code:text-blue-200">
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline) {
                  return <CodeBlock language={match?.[1] || 'javascript'} value={String(children)} />;
                }
                return <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm" {...props}>{children}</code>;
              }
            }}
          >
            {lesson.theory}
          </ReactMarkdown>
        </article>
      </Card>
    </div>
  );
}
