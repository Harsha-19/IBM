import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LecturesPage } from './pages/LecturesPage';
import { NewLecturePage } from './pages/NewLecturePage';
import { LectureDetailPage } from './pages/LectureDetailPage';
import { LectureConceptsPage } from './pages/LectureConceptsPage';
import { LectureQuizCreatePage } from './pages/LectureQuizCreatePage';
import { QuizPage } from './pages/QuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { ProgressPage } from './pages/ProgressPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminQuestionsPage } from './pages/AdminQuestionsPage';
import { AdminValidationPage } from './pages/AdminValidationPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'lectures',
        element: <LecturesPage />,
      },
      {
        path: 'lectures/new',
        element: <NewLecturePage />,
      },
      {
        path: 'lectures/:id',
        element: <LectureDetailPage />,
      },
      {
        path: 'lectures/:id/concepts',
        element: <LectureConceptsPage />,
      },
      {
        path: 'lectures/:id/quiz',
        element: <LectureQuizCreatePage />,
      },
      {
        path: 'quiz/:id',
        element: <QuizPage />,
      },
      {
        path: 'quiz/:id/result',
        element: <QuizResultPage />,
      },
      {
        path: 'progress',
        element: <ProgressPage />,
      },
      {
        path: 'recommendations',
        element: <RecommendationsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: 'admin/questions',
        element: <AdminQuestionsPage />,
      },
      {
        path: 'admin/validation',
        element: <AdminValidationPage />,
      },
    ],
  },
]);
