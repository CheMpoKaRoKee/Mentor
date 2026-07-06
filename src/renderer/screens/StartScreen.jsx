import { BookOpen, Flame, RotateCcw, Settings } from 'lucide-react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function StatCard({ icon: Icon, label, value, tone = 'text-blue-400' }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-zinc-400">{label}</div>
    </Card>
  );
}

export default function StartScreen({ progress, loading, onStart, onOpenSettings }) {
  if (loading) return <LoadingSpinner label="Готовлю следующую тему..." />;

  return (
    <div className="animate-fade-in">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">AI fullstack path</p>
          <h1 className="text-5xl font-extrabold tracking-normal text-zinc-50">Learning Mentor</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Персональный ИИ-ментор выбирает тему, объясняет материал и принимает экзамен.
          </p>
        </div>
        <Button variant="ghost" onClick={onOpenSettings} className="shrink-0" title="Настройки">
          <Settings className="h-5 w-5" />
          Настройки
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={BookOpen} label="Пройдено тем" value={progress.completed.length} />
        <StatCard icon={RotateCcw} label="На повторении" value={progress.retry.length} tone="text-orange-400" />
        <StatCard icon={Flame} label="Streak дней" value={progress.streak} tone="text-green-400" />
      </div>

      <div className="mt-10">
        <Button size="lg" onClick={onStart} className="w-full max-w-sm text-lg">
          Хочу учить
        </Button>
      </div>
    </div>
  );
}
