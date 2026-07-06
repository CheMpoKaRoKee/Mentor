import confetti from 'canvas-confetti';
import { useEffect, useMemo, useState } from 'react';
import MentorChat from './components/MentorChat.jsx';
import Toast from './components/Toast.jsx';
import ExamScreen from './screens/ExamScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import SettingsModal from './screens/SettingsModal.jsx';
import StartScreen from './screens/StartScreen.jsx';
import TheoryScreen from './screens/TheoryScreen.jsx';

const emptyProgress = {
  completed: [],
  retry: [],
  streak: 1,
  lastVisit: null
};

export default function App() {
  const [screen, setScreen] = useState('start');
  const [progress, setProgress] = useState(emptyProgress);
  const [apiKey, setApiKey] = useState('');
  const [lesson, setLesson] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const retryAttempts = useMemo(() => {
    const topic = lesson?.topic;
    return progress.retry.find((item) => item.topic === topic)?.attempts || 0;
  }, [lesson, progress.retry]);

  useEffect(() => {
    async function bootstrap() {
      try {
        if (!window.api) {
          throw new Error('Electron preload API is not available. Restart the app after rebuild.');
        }

        const [loadedProgress, key] = await Promise.all([
          window.api.getProgress(),
          window.api.getApiKey()
        ]);
        setProgress(loadedProgress);
        setApiKey(key || '');
      } catch (error) {
        showToast(error.message, 'error');
      }
    }

    bootstrap();
  }, []);

  function showToast(message, type = 'info') {
    setToast({ message, type });
  }

  async function handleStart() {
    if (!apiKey) {
      setSettingsOpen(true);
      showToast('API key not set', 'error');
      return;
    }

    setLoading(true);
    try {
      const nextLesson = await window.api.askMentor(progress.completed, progress.retry);
      setLesson(nextLesson);
      setScreen('theory');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveKey(key) {
    try {
      await window.api.setApiKey(key);
      setApiKey(key);
      setSettingsOpen(false);
      showToast('API ключ сохранён', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function handleSubmitAnswers(userAnswers) {
    setLoading(true);
    try {
      const check = await window.api.checkAnswers(lesson.exam, userAnswers);
      setResult(check);
      setScreen('results');

      if (check.passed) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.7 }
        });
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    const topic = lesson.topic;
    let nextProgress;

    if (result.passed) {
      nextProgress = {
        ...progress,
        completed: Array.from(new Set([...progress.completed, topic])),
        retry: progress.retry.filter((item) => item.topic !== topic)
      };
    } else {
      const exists = progress.retry.find((item) => item.topic === topic);
      nextProgress = {
        ...progress,
        retry: exists
          ? progress.retry.map((item) => (item.topic === topic ? { ...item, attempts: item.attempts + 1 } : item))
          : [...progress.retry, { topic, attempts: 1 }]
      };
    }

    try {
      await window.api.saveProgress(nextProgress);
      setProgress(nextProgress);
      setLesson(null);
      setResult(null);
      setScreen('start');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex h-screen max-w-6xl flex-col px-8 py-8">
        <div className="min-h-0 flex-1">
          {screen === 'start' && (
            <StartScreen
              progress={progress}
              loading={loading}
              onStart={handleStart}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}

          {screen === 'theory' && lesson && (
            <TheoryScreen
              lesson={lesson}
              retryAttempts={retryAttempts}
              onReady={() => setScreen('exam')}
            />
          )}

          {screen === 'exam' && lesson && (
            <ExamScreen
              lesson={lesson}
              loading={loading}
              onSubmit={handleSubmitAnswers}
            />
          )}

          {screen === 'results' && result && (
            <ResultsScreen result={result} onContinue={handleContinue} />
          )}
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        initialKey={apiKey}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveKey}
      />

      {screen === 'theory' && lesson && (
        <MentorChat
          lesson={lesson}
          screen={screen}
          onError={(message) => showToast(message, 'error')}
        />
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
