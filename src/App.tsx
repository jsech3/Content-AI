import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ScriptGenerator } from './components/ScriptGenerator';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';
import { Settings } from './components/Settings';
import { 
  LayoutDashboard, 
  PenSquare, 
  LineChart, 
  Settings as SettingsIcon 
} from 'lucide-react';

type Tab = 'dashboard' | 'generator' | 'analysis' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
    { name: 'Script Generator', icon: PenSquare, tab: 'generator' },
    { name: 'Competitor Analysis', icon: LineChart, tab: 'analysis' },
    { name: 'Settings', icon: SettingsIcon, tab: 'settings' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'generator':
        return <ScriptGenerator />;
      case 'analysis':
        return <CompetitorAnalysis />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      navigation={navigation} 
      activeTab={activeTab} 
      onTabChange={(tab) => setActiveTab(tab as Tab)}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;