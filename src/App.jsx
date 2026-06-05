import { HashRouter, Routes, Route } from 'react-router-dom';
import SubjectOverview from './pages/SubjectOverview';
import SubjectDetail from './pages/SubjectDetail';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"           element={<SubjectOverview />} />
        <Route path="/:subjectId" element={<SubjectDetail />} />
      </Routes>
    </HashRouter>
  );
}
