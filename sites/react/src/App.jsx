import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Project from './pages/Project.jsx';
import data from '../../../data.json';

export default function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#/">Lee <span className="muted">/ 作品集</span></a>
        <nav>
          <a href="/">静态版</a>
          <a href="/resume/resume-tech.html" target="_blank" rel="noopener">简历·技术版</a>
          <a href="/resume/resume-biz.html" target="_blank" rel="noopener">简历·业务版</a>
          <a href="https://github.com/Lee0317-ai" target="_blank" rel="noopener">GitHub</a>
          <ThemeToggle />
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home data={data} />} />
          <Route path="/project/:name" element={<Project data={data} />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>Lee · <a href="https://github.com/Lee0317-ai" target="_blank" rel="noopener">github.com/Lee0317-ai</a></p>
      </footer>
    </>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || '');
  useEffect(() => { try { localStorage.setItem('theme', theme); } catch (e) {} }, [theme]);
  return (
    <button className="theme-toggle" aria-label="切换主题"
      onClick={() => {
        const r = document.documentElement;
        const next = (theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark' ? 'light' : 'dark';
        r.dataset.theme = next; setTheme(next);
      }}>◐</button>
  );
}
