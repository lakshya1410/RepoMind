
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function App() {
  const [view, setView] = useState('onboarding'); // 'onboarding' or 'app'
  const [loadUrl, setLoadUrl] = useState('');
  const [loadLoading, setLoadLoading] = useState(false);
  const [loadResult, setLoadResult] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [askRepo, setAskRepo] = useState('');
  const [askQuery, setAskQuery] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, askLoading]);

  const handleLoad = async (e) => {
    e.preventDefault();
    if (!loadUrl) return;

    setLoadLoading(true);
    setLoadError('');
    setLoadResult(null);
    setMessages([]);
    setAskQuery('');
    setAskRepo('');

    try {
      const response = await fetch(`${API_BASE}/load-repo?repo_url=${encodeURIComponent(loadUrl)}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to load repository.');
      const data = await response.json();
      setLoadResult(data);
      setAskRepo(data.repo_name);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoadLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!askRepo || !askQuery.trim()) return;
    
    const userQuery = askQuery.trim();
    setAskQuery('');
    
    const newMessages = [...messages, { role: 'user', content: userQuery }];
    setMessages(newMessages);
    setAskLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ask?query=${encodeURIComponent(userQuery)}&repo_name=${encodeURIComponent(askRepo)}`);
      if (!response.ok) throw new Error('Failed to fetch answer. Make sure the repo is loaded.');
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.message}`, isError: true }]);
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <>
      {view === 'onboarding' ? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ paddingTop: '20vh', paddingBottom: '10vh' }}>
            <header className="hero-section" style={{ width: '100%' }}>
              <div className="preview-badge">DEVELOPER PREVIEW V1.0.4</div>
              <h1 className="hero-title">Repo<span className="text-accent">Mind</span></h1>
              <p className="hero-subtitle">
                Instantly explore, analyze, and chat with your codebase.<br/>Knowledge extraction for the modern developer workspace.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
                <button className="btn" onClick={() => setView('app')}>Get Started</button>
                <button className="btn btn-outline">View Demo</button>
              </div>
            </header>
          </div>

          <section style={{ maxWidth: '1000px', margin: '0 auto 4rem', width: '100%' }}>
            <h3 className="section-heading">How it Works</h3>
            <div className="onboarding-grid-features">
              <div className="card step-card">
                <div className="feature-icon mb-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></div>
                <div className="step-label">Step 01</div>
                <h4>Link Repo</h4>
                <p>Connect your GitHub account securely. Select the repositories you want RepoMind to master.</p>
              </div>
              <div className="card step-card">
                <div className="feature-icon mb-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>
                <div className="step-label">Step 02</div>
                <h4>Index Code</h4>
                <p>Our engine parses your codebase, creating a semantic index of logic, dependencies, and architecture.</p>
              </div>
              <div className="card step-card">
                <div className="feature-icon mb-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></div>
                <div className="step-label">Step 03</div>
                <h4>Chat</h4>
                <p>Ask questions, debug issues, or refactor components using natural language informed by your actual code.</p>
              </div>
            </div>
            
            <div className="onboarding-grid-bottom">
               <div className="card feature-card-large col-span-2" style={{ position: 'relative' }}>
                 <div className="feature-icon" style={{ position: 'absolute', top: '2rem', right: '2rem', width: '48px', height: '48px', opacity: 0.5 }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
                 <h3>AI-Native Codebase Intelligence</h3>
                 <p style={{ maxWidth: '600px' }}>Deep integration with LLMs allows RepoMind to understand context that traditional search misses. Find architectural bottlenecks in seconds.</p>
               </div>
               
               <div className="card feature-card-accent col-span-1">
                 <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                 <div>
                   <h3>Blazing Fast Indexing</h3>
                   <p>Proprietary vectorization engine built for scale. Millions of lines of code processed in minutes.</p>
                 </div>
               </div>

               <div className="card col-span-1">
                 <div className="feature-icon mb-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                 <h4 style={{ fontSize: '1.25rem', marginTop: '1rem', color: 'var(--text-primary)' }}>Enterprise Security</h4>
                 <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>SOC2 compliant. Your code remains yours. We never train on your private repositories.</p>
               </div>

               <div className="card col-span-2">
                 <div className="feature-icon mb-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg></div>
                 <h4 style={{ fontSize: '1.25rem', marginTop: '1rem', color: 'var(--text-primary)' }}>Multi-Repo Analysis</h4>
                 <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Analyze relationships and dependencies across your entire organization's ecosystem.</p>
               </div>
            </div>
          </section>

          <footer className="cta-section" style={{ paddingTop: '2rem' }}>
            <div className="footer-bottom">
              <div className="footer-brand">
                <span className="footer-logo">RepoMind</span>
                <span className="footer-version">v1.0.4</span>
              </div>
              
              <div className="footer-links">
                <a href="#">Documentation</a>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Support</a>
              </div>
              
              <div className="footer-social">
                <a href="#">
                  <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </a>
                <a href="#">
                  <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>
                </a>
              </div>
            </div>

            <div className="footer-copyright">
              © 2024 RepoMind AI Inc. Built for developers by developers.
            </div>
          </footer>
        </div>
      ) : (
        <main className={`main-content ${loadResult ? 'split-layout' : ''}`}>
          {!loadResult && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>Index Repository</h1>
              <p className="hero-subtitle" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Connect your codebase to RepoMind's neural engine. We'll clone, analyze, and vectorize your repository for intelligent semantic search.</p>
            </div>
          )}
          <section className="card index-section" style={{ marginBottom: loadResult ? '0' : '0' }}>
          <div className="card-header">
            <h2 className="card-title">
              <svg className="icon" viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              Index Repository
            </h2>
            <p className="card-description">Provide a public GitHub URL to clone, chunk, and embed the codebase.</p>
          </div>
          
          <form onSubmit={handleLoad}>
            <div className="form-group">
              <label className="label">Repository URL</label>
              <input 
                type="url" 
                className="input" 
                placeholder="https://github.com/username/repository" 
                value={loadUrl}
                onChange={(e) => setLoadUrl(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn" disabled={loadLoading}>
              {loadLoading ? (
                <div className="loader-dots"><div></div><div></div><div></div></div>
              ) : (
                <>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Process & Index
                </>
              )}
            </button>

            {loadError && (
              <div className="alert alert-error">
                <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {loadError}
              </div>
            )}

            {loadResult && (
              <div className="alert alert-success">
                <div className="alert-message">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  {loadResult.message || 'Repository successfully indexed.'}
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Repository</span>
                    <span className="stat-value" title={loadResult.repo_name}>{loadResult.repo_name}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Files Analyzed</span>
                    <span className="stat-value">{loadResult.files_found}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Chunks Created</span>
                    <span className="stat-value">{loadResult.chunks_created}</span>
                  </div>
                </div>
              </div>
            )}
          </form>

          {!loadResult && !loadLoading && (
            <div className="grid-cols-2 mt-4" style={{ marginTop: '2rem' }}>
              <div className="feature-card">
                <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                <h4>Secure Isolation</h4>
                <p>Your code is indexed in a temporary sandboxed environment and encrypted at rest.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>
                <h4>Semantic Graph</h4>
                <p>We build a multidimensional map of your logic, dependencies, and docstrings.</p>
              </div>
            </div>
          )}
        </section>

        {loadResult && (
          <section className="card chat-container">
            <div className="card-header">
              <h2 className="card-title">
                <svg className="icon" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Chat with {askRepo}
              </h2>
            </div>

            <div className="chat-history" ref={chatHistoryRef}>
              {messages.length === 0 && (
                <div className="empty-chat">
                  Ask any question about the architecture, logic, or implementation of {askRepo}.
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="message-content">
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {askLoading && (
                <div className="chat-message assistant">
                  <div className="message-avatar">AI</div>
                  <div className="message-content">
                    <div className="loader-dots"><div></div><div></div><div></div></div>
                  </div>
                </div>
              )}
            </div>

            <form className="chat-input-form" onSubmit={handleAsk}>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Message RepoMind..." 
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                disabled={askLoading}
                required
              />
              <button type="submit" className="chat-send-btn" disabled={askLoading || !askQuery.trim()}>
                <svg className="icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
          </section>
        )}
      </main>
      )}
    </>
  );
}

