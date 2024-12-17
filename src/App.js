import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SavedFilesProvider } from './Body/SavedFilesContext';
import InputData from './Body/InputData';
import Home from './Body/Home';
import { Header } from './Header/Header';


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
        </Routes>
      </Router>
    </SavedFilesProvider>

  );
}

export default App;
