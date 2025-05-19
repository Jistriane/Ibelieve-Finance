import React from 'react';
import './App.css';

interface AppProps {
  title?: string;
}

const App: React.FC<AppProps> = ({ title = 'Ibelieve Finance' }) => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{title}</h1>
        <nav className="app-nav">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">Sobre</a></li>
            <li><a href="#contact">Contato</a></li>
          </ul>
        </nav>
      </header>
      <main className="app-main">
        <section className="hero-section">
          <h2>Bem-vindo ao Ibelieve Finance</h2>
          <p>Uma plataforma inovadora para finanças descentralizadas</p>
        </section>
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 Ibelieve Finance. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App; 