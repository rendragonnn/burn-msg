'use client';

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          maxWidth: '480px',
          margin: '120px auto',
          padding: '40px',
          textAlign: 'center',
          color: '#fafafa',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            width: '48px', height: '48px', margin: '0 auto 24px',
            borderRadius: '50%', background: 'rgba(220,38,38,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: '24px', fontSize: '0.875rem' }}>
            An unexpected error occurred. Please refresh the page.
          </p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: '1px solid #27272a',
              background: '#18181b', color: '#fafafa', cursor: 'pointer',
              fontSize: '0.875rem', fontFamily: "'Inter', sans-serif"
            }}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
