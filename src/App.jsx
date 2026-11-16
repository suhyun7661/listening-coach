import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PlaceholderPage from './components/PlaceholderPage';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Review from './pages/Review';
import Compete from './pages/Compete';
import ReviewScript from './pages/ReviewScript';
import DiagnosisReport from './pages/DiagnosisReport';
import Login from './pages/Login';
import Account from './pages/Account';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/review" element={<Review />} />
        <Route path="/review/:attemptId" element={<Review />} />
        <Route path="/review/:attemptId/script" element={<ReviewScript />} />
        <Route path="/review/:attemptId/diagnosis" element={<DiagnosisReport />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/compete" element={<Compete />} />
        <Route path="*" element={<PlaceholderPage title="Page not found" lead="That page does not exist." />} />
      </Route>
    </Routes>
  );
}
