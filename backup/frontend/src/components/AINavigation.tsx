import React, { useState } from 'react';
import { AIAssistant } from './AIAssistant';
import { RiskAnalysisComponent } from './RiskAnalysis';
import { ZKPOptimizer } from './ZKPOptimizer';
import { FraudDetector } from './FraudDetector';

type AISection = 'chat' | 'risk' | 'zkp' | 'fraud';

export const AINavigation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AISection>('chat');

  const renderSection = () => {
    switch (activeSection) {
      case 'chat':
        return <AIAssistant />;
      case 'risk':
        return <RiskAnalysisComponent />;
      case 'zkp':
        return <ZKPOptimizer />;
      case 'fraud':
        return <FraudDetector />;
      default:
        return <AIAssistant />;
    }
  };

  return (
    <div className="ai-navigation">
      <div className="nav-container">
        <div className="nav-header">
          <h1 className="nav-title">IA Financeira</h1>
          <div className="nav-subtitle">Sistema Inteligente de Análise</div>
        </div>
        
        <div className="nav-buttons">
          <button
            onClick={() => setActiveSection('chat')}
            className={`nav-button ${activeSection === 'chat' ? 'active' : ''}`}
          >
            <div className="button-content">
              <span className="button-icon">💬</span>
              <span className="button-text">Chat</span>
            </div>
            <div className="button-glow"></div>
          </button>
          
          <button
            onClick={() => setActiveSection('risk')}
            className={`nav-button ${activeSection === 'risk' ? 'active' : ''}`}
          >
            <div className="button-content">
              <span className="button-icon">📊</span>
              <span className="button-text">Análise de Risco</span>
            </div>
            <div className="button-glow"></div>
          </button>
          
          <button
            onClick={() => setActiveSection('zkp')}
            className={`nav-button ${activeSection === 'zkp' ? 'active' : ''}`}
          >
            <div className="button-content">
              <span className="button-icon">🔒</span>
              <span className="button-text">Otimizador ZKP</span>
            </div>
            <div className="button-glow"></div>
          </button>
          
          <button
            onClick={() => setActiveSection('fraud')}
            className={`nav-button ${activeSection === 'fraud' ? 'active' : ''}`}
          >
            <div className="button-content">
              <span className="button-icon">🛡️</span>
              <span className="button-text">Detector de Fraudes</span>
            </div>
            <div className="button-glow"></div>
          </button>
        </div>
      </div>

      <div className="section-container">
        {renderSection()}
      </div>
    </div>
  );
}; 