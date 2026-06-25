import './BackgroundCanvas.css';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <HelmetProvider>
    <Router>
      {/* Main Wrapper: 
          - Overflow-x-hidden taake horizontal scroll na aaye.
          - bg-[#020617] base color jo pure network ke liye standard hai.
      */}
      <div className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden text-slate-200">
        
        {/* Background Layer (The "Vibe" Layer):
            - Fixed position taake scroll karne par background move na ho.
            - z-0 taake ye hamesha sab se niche rahe.
        */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="et-mesh-bg h-full w-full">
              {/* Glow spots ko mazeed subtle (halka) rakhna hy taake gaming app na lage */}
              <div className="et-glow-spot opacity-40"></div>
           </div>
        </div>
        
        {/* Content Layer: 
            - z-10 taake ye background mesh se upar ho.
            - relative takay iske andar ke absolute elements sahi jagah bethen.
        */}
        <div className="relative z-10 w-full flex flex-col min-h-screen">
           <AppRoutes />
        </div>
      </div>
    </Router>
    </HelmetProvider>
  );
}

export default App;