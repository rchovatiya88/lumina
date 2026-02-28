import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MoodboardStudio from './components/MoodboardStudio';
import RoomDesign from './pages/RoomDesign';
import ProductDiscovery from './pages/ProductDiscovery';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import AIStyleQuiz from './pages/AIStyleQuiz';
import Journal from './pages/Journal';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studio" element={<ProductDiscovery />} />
          <Route path="/design" element={<RoomDesign />} />
          <Route path="/services" element={<Services />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/style-quiz" element={<AIStyleQuiz />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;