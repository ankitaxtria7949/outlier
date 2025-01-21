import React, { createContext, useState } from 'react';

// Create a context with a default value
const MyContext = createContext();



const MyProvider = ({ children }) => {
    const [selectedFile, setSelectedFile] = useState(null); // Holds the uploaded data file
    const [Outliers, setOutliers] = useState(null); // holds the results from fast-api
    const [DataFileName, setDataFileName] = useState(""); // Full path of uploaded file
    const [Summary, setSummary] =  useState(null); // holds the results from fast-api
    const [ValData, setValData] = useState(null);
    const [tutHome, setTutHome] = useState(true);
    const [tutList, setTutList] = useState(true);
  return (
    <MyContext.Provider value={{
        selectedFile, setSelectedFile,
        Outliers, setOutliers,
        DataFileName, setDataFileName,
        Summary, setSummary,
        ValData, setValData,
        tutHome, setTutHome,
        tutList, setTutList,
    }}>
      {children}
    </MyContext.Provider>
  );
};

export { MyProvider, MyContext };