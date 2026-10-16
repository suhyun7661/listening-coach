import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PlaceholderPage from './components/PlaceholderPage';
import Library from './pages/Library';
import Practice from './pages/Practice';
import Review from './pages/Review';
import Compete from './pages/Compete';
import VocabQuiz from './pages/VocabQuiz';
import Notebook from './pages/Notebook';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Library />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:clipId" element={<Practice />} />
        <Route path="/review" element={<Review />} />
        <Route path="/compete" element={<Compete />} />
        <Route path="/vocab" element={<VocabQuiz />} />
        <Route path="/notebook" element={<Notebook />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<PlaceholderPage title="Page not found" lead="That page does not exist." />} />
      </Route>
    </Routes>
  );
}
