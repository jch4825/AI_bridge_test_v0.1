import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Home from './views/Home';
import Tutorial from './views/Tutorial';
import QuickTools from './views/QuickTools';
import { ViewType, Module } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('lesson') ? 'tutorial' : 'home';
  });
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ai-teachers-progress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'tutorial') setSelectedModule(null);
  };

  const toggleComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId];
      localStorage.setItem('ai-teachers-progress', JSON.stringify(next));
      return next;
    });
  };

  const markComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      localStorage.setItem('ai-teachers-progress', JSON.stringify(next));
      return next;
    });
  };

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
        return <QuickTools />;
      case 'tutorial':
        return <Tutorial
          selectedModule={selectedModule}
          onSelectModule={setSelectedModule}
          completedLessons={completedLessons}
          onToggleComplete={toggleComplete}
          onMarkComplete={markComplete}
        />;
      default:
        return <Home onViewChange={setCurrentView} />;
    }
  };

  if (currentView === 'tools') {
    return (
      <div className="min-h-screen bg-canva-bg font-sans text-canva-ink">
        <TopNav currentView={currentView} onViewChange={handleViewChange} />
        <AnimatePresence mode="wait">
          <motion.div
            key="tools"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QuickTools />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canva-bg font-sans text-canva-ink">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        selectedModule={selectedModule}
        onSelectModule={(mod) => {
          setCurrentView('tutorial');
          setSelectedModule(mod);
        }}
        completedLessons={completedLessons}
      />

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
