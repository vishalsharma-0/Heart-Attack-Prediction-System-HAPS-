import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Predict from './pages/Predict';
import History from './pages/History';
import ModelInsights from './pages/ModelInsights';
import Reminders from './pages/Reminders';
import DeviceCompanion from './pages/DeviceCompanion';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/assessment" element={<Predict />} />
            <Route path="/result" element={<Navigate to="/predict" replace />} />
            <Route path="/history" element={<History />} />
            <Route path="/insights" element={<ModelInsights />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/device" element={<DeviceCompanion />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
