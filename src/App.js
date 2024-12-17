import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SavedFilesProvider } from './Body/SavedFilesContext';



function App() {
  return (
    <SavedFilesProvider> {/* Wrap the app with SavedFilesProvider */}
    <Router>
      <Routes>
        {/* Home page */}
        <Route path="/" />
        {/* input page */}
        <Route path="/input-data" />
      </Routes>
    </Router>
    </SavedFilesProvider>

  );
}

export default App;
