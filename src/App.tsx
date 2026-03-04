import React from 'react';
import Game from './components/Game';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <ErrorBoundary>
        <Game />
      </ErrorBoundary>
    </div>
  );
}

export default App;
