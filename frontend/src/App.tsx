import { useState, useEffect } from 'react';
import Home from './components/HomeView';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import FatherRegistry from './components/pedigree/FatherRegistry';
import MotherRegistry from './components/pedigree/MotherRegistry';
import BreedingBatch from './components/pedigree/BreedingBatch';
import ChickRegistry from './components/pedigree/ChickRegistry';
import ChickenDetail from './components/pedigree/ChickenDetail';
import SubFarmManagement from './components/SubFarmManagement';
import ChickenList from './components/chickens/ChickenList';
import ChickenAdd from './components/chickens/ChickenAdd';
import ChickBanding from './components/pedigree/ChickBanding';
import Profile from './components/Profile';
import FarmStatistics from './components/FarmStatistics';
import VaccineDashboard from './components/vaccine/VaccineDashboard';
import { LanguageProvider } from './components/LanguageContext';
import AdminDashboard from './components/AdminDashboard';

type Page = 'home' | 'login' | 'register' | 'dashboard' | 'father-registry' | 'mother-registry' | 'breeding-batch' | 'chick-registry' | 'chicken-detail' | 'sub-farms' | 'chicken-list' | 'chicken-add' | 'chick-banding' | 'profile' | 'statistics' | 'vaccine' | 'admin-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedId, setSelectedId] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // Sync state with URL
  useEffect(() => {
    const syncWithUrl = () => {
      const path = window.location.pathname.slice(1);
      const parts = path.split('/');
      const page = parts[0] || 'home';
      const id = parts[1] ? decodeURIComponent(parts[1]) : '';
      const token = localStorage.getItem('token');

      const protectedPages = ['dashboard', 'father-registry', 'mother-registry', 'breeding-batch', 'chick-registry', 'sub-farms', 'chicken-list', 'chicken-add', 'chick-banding', 'profile', 'statistics', 'vaccine', 'admin-dashboard'];
      if (protectedPages.includes(page) && !token) {
        handleNavigate('login');
        return;
      }

      if ((page === 'home' || page === '') && token) {
        handleNavigate('dashboard');
        return;
      }

      setSelectedId(id);
      if (['home', 'login', 'register', ...protectedPages].includes(page)) {
        setCurrentPage(page as Page);
      }
    };

    window.addEventListener('popstate', syncWithUrl);
    syncWithUrl(); // Initial sync

    return () => window.removeEventListener('popstate', syncWithUrl);
  }, []);

  const handleNavigate = (page: Page, id?: string) => {
    setSelectedId(id || '');
    setCurrentPage(page);
    
    const url = page === 'home' ? '/' : `/${page}${id ? `/${encodeURIComponent(id)}` : ''}`;
    window.history.pushState({}, '', url);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    handleNavigate('login');
  };

  return (
    <LanguageProvider>
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'register' && <Register onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />}
      {currentPage === 'father-registry' && <FatherRegistry onNavigate={handleNavigate} />}
      {currentPage === 'mother-registry' && <MotherRegistry onNavigate={handleNavigate} />}
      {currentPage === 'breeding-batch' && <BreedingBatch onNavigate={handleNavigate} />}
      {currentPage === 'chick-registry' && <ChickRegistry selectedBatchCode={selectedId} onNavigate={handleNavigate} />}
      {currentPage === 'chicken-detail' && <ChickenDetail chickenId={selectedId} onNavigate={handleNavigate} />}
      {currentPage === 'sub-farms' && <SubFarmManagement onNavigate={handleNavigate} />}
      {currentPage === 'chicken-list' && <ChickenList onNavigate={handleNavigate} />}
      {currentPage === 'chicken-add' && <ChickenAdd onNavigate={handleNavigate} />}
      {currentPage === 'chick-banding' && <ChickBanding onNavigate={handleNavigate} />}
      {currentPage === 'profile' && <Profile onNavigate={handleNavigate} />}
      {currentPage === 'statistics' && <FarmStatistics onNavigate={handleNavigate} />}
      {currentPage === 'vaccine' && <VaccineDashboard onNavigate={handleNavigate} />}
      {currentPage === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
    </LanguageProvider>
  );
}

export default App;
