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
  return (
    <Router>
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
