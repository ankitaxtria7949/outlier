import React, { createContext, useState } from 'react';

// Create a context with a default value
const MyContext = createContext();



const MyProvider = ({ children }) => {
    const [selectedFile, setSelectedFile] = useState(null); // Holds the uploaded data file
    const [Outliers, setOutliers] = useState(null); // holds the results from fast-api
    const [DataFileName, setDataFileName] = useState(""); // Full path of uploaded file
    const [Summary, setSummary] =  useState(null); // holds the results from fast-api
    
    
  return (
    <MyContext.Provider value={{
        selectedFile, setSelectedFile,
        Outliers, setOutliers,
        DataFileName, setDataFileName,
        Summary, setSummary,
      
    }}>
      {children}
    </MyContext.Provider>
  );
};

export { MyProvider, MyContext };