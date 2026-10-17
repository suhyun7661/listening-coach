import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PlaceholderPage from './components/PlaceholderPage';
import Library from './pages/Library';
import Practice from './pages/Practice';
import Review from './pages/Review';
import CompeteHome from './pages/CompeteHome';
import CompeteRoom from './pages/CompeteRoom';
import VocabQuiz from './pages/VocabQuiz';
import Notebook from './pages/Notebook';
import Admin from './pages/Admin';
import History from './pages/History';
import Login from './pages/Login';
import Account from './pages/Account';
import Progress from './pages/Progress';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Library />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:clipId" element={<Practice />} />
        <Route path="/review" element={<Review />} />
        <Route path="/review/:attemptId" element={<Review />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/compete" element={<CompeteHome />} />
        <Route path="/compete/:code" element={<CompeteRoom />} />
        <Route path="/vocab" element={<VocabQuiz />} />
        <Route path="/notebook" element={<Notebook />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<PlaceholderPage title="Page not found" lead="That page does not exist." />} />
      </Route>
    </Routes>
  );
}
