import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SavedFilesProvider } from './Body/SavedFilesContext';
import Home from './Body/Home';
import { AnomalyList } from './Body/AnomalyList';
import { Header } from './Header/Header';
import { Summary } from './Body/Summary';
import { ErrorsList } from './Body/DataErrorsList';
function App() {
  return (
    <SavedFilesProvider> {/* Wrap the app with SavedFilesProvider */}
      <Router>
        <Header />
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />
          {/* input page */}
          <Route path="/anomaly-list" element=  {<AnomalyList />} />
          <Route path="/summary" element=  {<Summary />} />
          <Route path="/errors" element=  {<ErrorsList />} />


        </Routes>
      </Router>
    </SavedFilesProvider>

  );
}

export default App;
