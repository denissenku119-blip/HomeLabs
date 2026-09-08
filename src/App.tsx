import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider, useI18n } from '@/i18n/I18nContext';
import { LanguageOnboarding } from '@/pages/LanguageOnboarding';
import { LandingPage } from '@/pages/LandingPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { AboutPage } from '@/pages/AboutPage';
import { DashboardPage } from '@/pages/app/DashboardPage';
import { NewProjectPage } from '@/pages/app/NewProjectPage';
import { ProjectsPage } from '@/pages/app/ProjectsPage';
import { ProjectWorkspacePage } from '@/pages/app/ProjectWorkspacePage';
import { ReportPage } from '@/pages/app/ReportPage';
import { SettingsPage } from '@/pages/app/SettingsPage';

function AppRoutes() {
  const { hasOnboarded } = useI18n();

  if (!hasOnboarded) {
    return <LanguageOnboarding />;
  }

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
        <Route path="/app/project/:id/report" element={<ReportPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppRoutes />
    </I18nProvider>
  );
}

export default App;
