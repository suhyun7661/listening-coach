import { useState } from 'react';
import { getClips } from '../lib/clipStore';
import { saveAttempt } from '../lib/attempts';
import { useAuth } from '../lib/AuthContext';
import WatchStep from './practice/WatchStep';
import LevelStep from './practice/LevelStep';
import DictationStep from './practice/DictationStep';
import ResultsStep from './practice/ResultsStep';

const AUDIO_SRC = '/audio/walk-with-me.mp3';

// Practice mode: Watch -> Level -> Dictation (audio only) -> Results.
// Nothing is remembered between visits: you watch and pick a level every time.
export default function Practice() {
  const clip = getClips()[0]; // the app has one clip: Walk With Me
  const { user } = useAuth();
  const [step, setStep] = useState('watch');
  const [watched, setWatched] = useState(false);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState({});

  async function finish({ results: done, replays }) {
    setResults(done);
    setSaved({});
    setStep('results');
    const result = await saveAttempt(user, { clipId: clip.id, title: clip.title, level, results: done, replays });
    setSaved({ id: result.id });
  }

  if (step === 'level') {
    return (
      <LevelStep
        onBack={() => setStep('watch')}
        onPick={(id) => { setLevel(id); setRound((r) => r + 1); setStep('dictation'); }}
      />
    );
  }
  if (step === 'dictation') {
    return <DictationStep key={round} clip={clip} level={level} audioSrc={AUDIO_SRC} onFinish={finish} onExit={() => setStep('level')} />;
  }
  if (step === 'results') {
    return <ResultsStep results={results} saved={saved} onAgain={() => setStep('level')} />;
  }
  return <WatchStep clip={clip} watched={watched} onWatched={() => setWatched(true)} onContinue={() => setStep('level')} />;
}
