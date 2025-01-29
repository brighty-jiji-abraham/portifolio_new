import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/header/Header';
import Section from './components/section/Section';
import Footer from './components/footer/Footer';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Contact from './pages/Contact';

function App() {

  const getDynamicBasename = () => {
    // Get the full path where your app is hosted
    const pathname = window.location.pathname;
  
    // If using HashRouter, split at the hash
    const hashIndex = pathname.indexOf('#');
    const cleanPath = hashIndex > -1 ? pathname.substring(0, hashIndex) : pathname;
  
    // Remove trailing slashes and split
    const segments = cleanPath.replace(/\/+$/, '').split('/');
  
    // Rebuild the base path
    return segments.slice(0, segments.length - 1).join('/') || '';
  };
  
  return (
    <Router basename={getDynamicBasename()}>
      <Header />
      <section className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Section children={<About />} id="about" />} />
            <Route path="/skills" element={<Section children={<Skills />} id="skills" />} />
            <Route path="/projects" element={<Section children={<Projects />} id="projects" />} />
            <Route path="/contact" element={<Section children={<Contact />} id="contact" />} />
          </Routes>
        </div>
      </section>
      <Footer />
    </Router>
  );
}

export default App;
