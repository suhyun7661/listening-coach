import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Library, Practice, Review, Compete, VocabQuiz, Notebook, Admin, NotFound } from './pages/Pages';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Library />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/review" element={<Review />} />
        <Route path="/compete" element={<Compete />} />
        <Route path="/vocab" element={<VocabQuiz />} />
        <Route path="/notebook" element={<Notebook />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
