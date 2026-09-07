import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { AboutPage } from '@/pages/AboutPage';
import { DashboardPage } from '@/pages/app/DashboardPage';
import { NewProjectPage } from '@/pages/app/NewProjectPage';
import { ProjectsPage } from '@/pages/app/ProjectsPage';
import { ProjectWorkspacePage } from '@/pages/app/ProjectWorkspacePage';
import { SettingsPage } from '@/pages/app/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Application */}
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/new" element={<NewProjectPage />} />
        <Route path="/app/projects" element={<ProjectsPage />} />
        <Route path="/app/project/:id" element={<ProjectWorkspacePage />} />
        <Route path="/app/settings" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
