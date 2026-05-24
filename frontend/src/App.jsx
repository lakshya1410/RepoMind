
import { useState } from 'react';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function App() {
  const [loadUrl, setLoadUrl] = useState('');
  const [loadLoading, setLoadLoading] = useState(false);
  const [loadResult, setLoadResult] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [askRepo, setAskRepo] = useState('');
  const [askQuery, setAskQuery] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askResult, setAskResult] = useState(null);
  const [askError, setAskError] = useState('');

  const handleLoad = async (e) => {
    e.preventDefault();
    if (!loadUrl) return;

    setLoadLoading(true);
    setLoadError('');
    setLoadResult(null);
    setAskResult(null);
    setAskError('');
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
    if (!askRepo || !askQuery) return;
    
    setAskLoading(true);
    setAskError('');
    setAskResult(null);

    try {
      const response = await fetch(`${API_BASE}/ask?query=${encodeURIComponent(askQuery)}&repo_name=${encodeURIComponent(askRepo)}`);
      if (!response.ok) throw new Error('Failed to fetch answer. Make sure the repo is loaded.');
      const data = await response.json();
      setAskResult(data);
    } catch (err) {
      setAskError(err.message);
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <>
      <header className="hero-section">
        <h1 className="hero-title">RepoMind</h1>
        <p className="hero-subtitle">
          Instantly explore, analyze, and chat with your GitHub repositories using natural language and semantic search.
        </p>
      </header>

      <main>
        <section className="card" style={{ marginBottom: loadResult ? '2rem' : '0' }}>
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
        </section>

        {loadResult && (
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg className="icon" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Query Codebase
              </h2>
              <p className="card-description">Ask any question about the architecture, logic, or implementation.</p>
            </div>

            <form onSubmit={handleAsk}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="label">Target Repository</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={askRepo}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="label">Your Question</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="E.g., How does the auth middleware work?" 
                    value={askQuery}
                    onChange={(e) => setAskQuery(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn" disabled={askLoading}>
                {askLoading ? (
                  <div className="loader-dots"><div></div><div></div><div></div></div>
                ) : (
                  <>
                    <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Analyze & Retrieve
                  </>
                )}
              </button>

              {askError && (
                <div className="alert alert-error">
                  <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {askError}
                </div>
              )}

              {askResult && (
                <div className="answer-box">
                  {askResult.answer}
                </div>
              )}
            </form>
          </section>
        )}
      </main>
    </>
  );
}

