import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './views/Home';
import Tutorial from './views/Tutorial';
import { ViewType } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onViewChange={setCurrentView} />;
      case 'resources':
        return (
          <div className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">자료실</h2>
            <p className="text-gray-500">준비 중인 페이지입니다.</p>
          </div>
        );
      case 'tools':
        return (
          <div className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Quick Tools</h2>
            <p className="text-gray-500">준비 중인 페이지입니다.</p>
          </div>
        );
      case 'tutorial':
        return <Tutorial />;
      default:
        return <Home onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-canva-bg font-sans text-canva-ink">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="pl-64 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
