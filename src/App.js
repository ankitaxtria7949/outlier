import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SavedFilesProvider } from './Body/SavedFilesContext';
import InputData from './Body/InputData';
import Home from './Body/Home';
import { AnomalyList } from './Body/AnomalyList';
import { Header } from './Header/Header';
import { Summary } from './Body/Summary';

function App() {
  return (
    <SavedFilesProvider> {/* Wrap the app with SavedFilesProvider */}
      <Router>
        <Header />
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />
          {/* input page */}
          <Route path="/input-data" element=  {<InputData />} />
          <Route path="/anomaly-list" element=  {<AnomalyList />} />
          <Route path="/summary" element=  {<Summary />} />

        </Routes>
      </Router>
    </SavedFilesProvider>

  );
}

export default App;
