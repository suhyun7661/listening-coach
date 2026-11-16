import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import StudyStep from './compete/StudyStep';
import QuizStep from './compete/QuizStep';
import QuizResults from './compete/QuizResults';

// Compete Mode: Study -> Quiz (15 questions, feedback after each) -> Results and leaderboard.
// You must be signed in: the result is saved to your account and compared with the fixed competitors.
export default function Compete() {
  const { user, loading, configured } = useAuth();
  const [step, setStep] = useState('study');
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState({});

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;

  if (!user) {
    return (
      <div className="page page--narrow">
        <h1 className="page__title">Compete Mode</h1>
        <p className="page__lead">
          {configured
            ? 'Log in to play. Your latest result is saved to your account and compared with five competitors.'
            : 'Compete Mode needs the account service, which is not set up on this computer.'}
        </p>
        {configured && <Link to="/login" className="btn btn--primary btn--lg"><span>Log in</span><span aria-hidden="true">→</span></Link>}
      </div>
    );
  }

  if (step === 'quiz') {
    return (
      <QuizStep
        key={round}
        onExit={() => setStep('study')}
        onFinish={(done) => { setAnswers(done); setStep('results'); }}
      />
    );
  }
  if (step === 'results') {
    return (
      <QuizResults
        key={round}
        answers={answers}
        onAgain={() => { setRound((r) => r + 1); setStep('quiz'); }}
        onStudy={() => { setRound((r) => r + 1); setStep('study'); }}
      />
    );
  }
  return <StudyStep onStart={() => setStep('quiz')} />;
}
