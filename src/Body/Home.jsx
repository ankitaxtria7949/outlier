import { Card, CardContent, Typography, CardActionArea, Grid, Box, Button, Snackbar } from '@mui/material';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from "@mui/icons-material/Visibility";
import { TrendingUp, TaskAlt } from '@mui/icons-material';
import { useState, useEffect, useContext } from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "./Context";
import React from 'react';
import axios from 'axios';
import './Home.css';
import introJs from 'intro.js';


const Home = () => {
  const navigate = useNavigate();
  const { setValData, tutHome, setTutHome, setDataFileName, selectedFile, setSelectedFile, setOutliers, setSummary } = useContext(MyContext);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted && tutHome) {
        setTutHome(false);
        showTutorial();  // Start the tutorial
      }
    }, 1000); // Start after 1 second

    return () => {
      clearTimeout(timer);
      isMounted = false;
    }; // Cleanup the timer

  }, []);
  const showTutorial2 = () => {
    const end = introJs();
    end.setOptions({
      steps: [
        {
          element: '.start-tour-button',
          intro: 'You can click here to rewatch the tutorial.',
          position: 'left'
        },
      ],
      showProgress: false, // Disable progress bar
      showStepNumbers: false,
      showBullets: false,
      nextLabel: '', // Remove "Next" button label
      prevLabel: '', // Remove "Previous" button label    
      showButtons: false, // Disable default Next/Prev buttons
    });

    end.onafterchange(() => {
      const tooltipContainer = document.querySelector('.introjs-tooltipbuttons');
      const tooltip = document.querySelector('.introjs-tooltip');
      const crossIcon = document.querySelector('.introjs-skipbutton')

      if (crossIcon) {
        Object.assign(crossIcon.style, {
          color: "red",
          padding: "2px",
          marginBottom: '0px'
        })
      }
      // Remove any existing buttons in the tooltip
      if (tooltipContainer) {
        tooltipContainer.innerHTML = ''; // Clear all buttons
      }

      // Style the tooltip box
      if (tooltip) {
        Object.assign(tooltip.style, {
          backgroundColor: '#f9f9f9',
          color: '#333',
          whiteSpace: 'nowrap',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: "5px",
          maxWidth: '500px',
          fontSize: '14px',
          minWidth: '300px',
          textAlign: 'center',
        });
        tooltip.style.display = 'flex';
        tooltip.style.flexDirection = 'column';
        tooltip.style.justifyContent = 'space-between';
      }
    });


    end.start();
  };
  const showTutorial = () => {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          element: '.import-data-btn',
          intro: 'Click here to upload your data file!',
        },
        {
          element: '.outlier-detection-card',
          intro: 'Click here to detect outliers in your data.',
        },
        {
          element: '.trendbreak-card',
          intro: 'Click here to see disruptions or trends in your data.',
        },
        {
          element: '.validation-card',
          intro: 'Click here to perform data validation to ensure its accuracy.',
        },
        {
          element: '.view-file-btn',
          intro: 'Click to view the uploaded file.',
        },
      ],
      showProgress: false, // Disable progress bar
      showStepNumbers: false,
      showBullets: false,
      nextLabel: 'Next step',
      prevLabel: 'Previous step',
      doneLabel: 'Finished'
    });

    intro.onafterchange(() => {
      const tooltipContainer = document.querySelector('.introjs-tooltipbuttons');
      const nextButton = document.querySelector('.introjs-nextbutton');
      const prevButton = document.querySelector('.introjs-prevbutton');
      const tooltip = document.querySelector('.introjs-tooltip');
      const totalSteps = intro._options.steps.length; // Get total number of steps
      const currentStep = intro._currentStep; // Get current step index
      console.log(currentStep)
      console.log(totalSteps)

      // Remove default close button
      const crossIcon = document.querySelector('.introjs-skipbutton');
      if (crossIcon) {
        crossIcon.remove();
      }

      // Add a custom "Skip tutorial" button
      let customSkipButton = document.querySelector('.custom-skip-button');
      if (!customSkipButton) {
        customSkipButton = document.createElement('button');
        customSkipButton.className = 'custom-skip-button';
        Object.assign(customSkipButton.style, {
          backgroundColor: 'red',
          fontSize: '12px',
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: 'white',
          fontWeight: 'bold',
          textShadow: 'none',
          border: 'none',
          cursor: 'pointer',
          height: '20px',
          borderRadius: '5px',
        });

        customSkipButton.onclick = () => {
          intro.exit(); // End the current tour
          showTutorial2(); // Start the second tour
        };

        if (tooltipContainer && prevButton) {
          tooltipContainer.insertBefore(customSkipButton, prevButton.nextSibling);
        }
      }

      // Update the custom "Skip tutorial" button text dynamically
      if (currentStep === totalSteps - 1) {
        customSkipButton.textContent = 'Close'; // Change Skip button text to "Close"
      } else {
        customSkipButton.textContent = 'Skip tutorial'; // Reset Skip button text
      }

      if (nextButton) {
        if (currentStep === totalSteps - 1) {
          // Disable and style the Next button on the last step
          nextButton.disabled = true;
          Object.assign(nextButton.style, {
            position: 'absolute',
            bottom: '15px',
            right: '10px',
            backgroundColor: 'grey',
            color: 'white',
            cursor: 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: 'none',
            padding: '5px 10px',
            borderRadius: '5px',
            boxShadow: 'none',
          });
        } else {
          // Enable and style the Next button for other steps
          nextButton.disabled = false;
          Object.assign(nextButton.style, {
            position: 'absolute',
            bottom: '15px',
            right: '10px',
            backgroundColor: 'green',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: 'none',
            padding: '5px 10px',
            borderRadius: '5px',
            boxShadow: 'none',
          });
        }
      }

      // Style the Previous button
      if (prevButton) {
        if (currentStep === 0) {
          prevButton.disabled = true;
          Object.assign(prevButton.style, {
            backgroundColor: 'grey',
            fontSize: '12px',
            color: 'white',
            marginRight: '40px',
            fontWeight: 'bold',
            textShadow: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
          });
        }
        else {
          Object.assign(prevButton.style, {
            backgroundColor: 'navy',
            fontSize: '12px',
            color: 'white',
            marginRight: '40px',
            fontWeight: 'bold',
            textShadow: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
          })
        }
      }

      // Style the tooltip box
      if (tooltip) {
        Object.assign(tooltip.style, {
          backgroundColor: '#f9f9f9',
          color: '#333',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '5px',
          maxWidth: '500px',
          fontSize: '14px',
          minWidth: '300px',
          textAlign: 'center',
        });
      }
    });

    intro.start();
  };
  const handleStartTutorial = () => {
    showTutorial();
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDataFileName(file.name); // Show full file name in the text field
    }
    setSnackbarMessage(`File uploaded: ${file.name}`);
    setSnackbarOpen(true);
  };
  const handleshowresults = async (flag) => {

    if (flag === "outlier") {
      const formData = new FormData();
      // Append necessary data to the form, including the selected file and parameters
      formData.append('file', selectedFile);
      formData.append('flag', flag);

      try {
        setLoading(true); // Set loading state to true before the request
        // Post the formData to the backend API
        const response = await axios.post('https://fast-api-forecast.onrender.com/upload2', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setLoading(false);
        setOutliers(response.data.outliers); // Update state with fetched outliers
        setSummary(response.data.summary);
        navigate('/anomaly-list');
      } catch (error) {
        setLoading(false); // Set loading state to true before the request
        console.error('Error uploading file:', error); // Log the error for debugging
      }
    }
    else if (flag === "trendbreak") {

      const formData = new FormData();
      // Append necessary data to the form, including the selected file and parameters
      formData.append('file', selectedFile);
      formData.append('flag', flag);

      try {
        setLoading(true); // Set loading state to true before the request
        // Post the formData to the backend API
        const response = await axios.post('https://fast-api-forecast.onrender.com/upload2', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(flag);

        setLoading(false);
        setOutliers(response.data.outliers); // Update state with fetched outliers
        setSummary(response.data.summary);
        navigate('/summary');

      } catch (error) {
        setLoading(false); // Set loading state to true before the request
        console.error('Error uploading file:', error); // Log the error for debugging
      }
    }
    else {
      const formData = new FormData();
      // Append necessary data to the form, including the selected file and parameters
      formData.append('file', selectedFile);
      formData.append('flag', flag);

      try {
        setLoading(true); // Set loading state to true before the request
        // Post the formData to the backend API
        const response = await axios.post('https://fast-api-forecast.onrender.com/upload2', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setLoading(false);
        const validationData = response.data.val_dt; // Use a local variable to avoid state timing issues
        setValData(validationData);

        if (validationData !== null && validationData.length === 0) {
          alert('No Errors Found');
        }
        else {
          navigate('/errors');
        }
      } catch (error) {
        setLoading(false); // Set loading state to true before the request
        console.error('Error uploading file:', error); // Log the error for debugging
      }
    }
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleRemoveDataFile = () => {
    setSelectedFile(null);
    setDataFileName(""); // Clear the data file name

  };
  const handleViewFile = () => {
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      window.open(fileURL, "_blank");
    }
  };

  return (
    <>
      {Loading &&
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', marginTop: 2 }}>
              Please wait
            </Typography>
          </Box>
        </Box>
      }
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '20px',
        }}

      >
        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: '2px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '10px' }}>
            <h1 style={{ textWrap: 'nowrap' }}>Welcome to the Outlier Detection Tool!</h1>
          </Box>

          <Box sx={{ flex: 1, display: "flex", justifyContent: 'flex-end', alignItems: 'center', m: 'auto' }}>
            <Button
              className='start-tour-button'
              variant="contained"
              sx={{ backgroundColor: '#007BFF', color: 'white', position: 'absolute', right: 0, mr: 4 }}
              onClick={() => handleStartTutorial()}
            >
              Show Tutorial
            </Button>
          </Box>
        </Box>
        <Grid container spacing={4} justifyContent="center" sx={{ marginBottom: '20px' }}>
          {/* Card 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                width: '100%',
                minHeight: 250,

                background: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
                color: 'black',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #ddd',
                '&:hover': { boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)' },
              }}
              className="outlier-detection-card"
            >
              <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => { handleshowresults("outlier"); }}>
                <ScatterPlotIcon sx={{ fontSize: 50, color: 'black', marginTop: '20px' }} />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
                    Outlier Detection
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{

                      color: 'text.secondary',
                      textAlign: 'center',
                      fontSize: '14px',
                      mt: 2
                    }}
                  >
                    Identify and flag unusual data points that deviate significantly from the expected range or patterns, ensuring data accuracy and consistency.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {/* Card 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                width: '100%',
                minHeight: 250,
                background: 'linear-gradient(135deg, #a1ffce, #faffd1)',
                color: 'black',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #ddd',
                '&:hover': { boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)' },
              }}
              className='trendbreak-card'
            >
              <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => { handleshowresults("trendbreak"); }}>
                <TrendingUp sx={{ fontSize: 50, color: 'black', marginTop: '20px' }} />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
                    Trendbreak Analysis
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '14px', mt: 2 }}
                  >
                    Analyze disruptions or shifts in data trends over time to uncover insights and understand their impact on overall performance.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {/* Card 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                width: '100%',
                minHeight: 250,
                background: 'linear-gradient(135deg,rgb(243, 176, 104), #ffd7be)',
                color: 'black',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #ddd',
                '&:hover': { boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)' },

              }}
              className='validation-card'
            >
              <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => { handleshowresults("validation"); }}>
                <TaskAlt sx={{ fontSize: 50, color: 'black', marginTop: '20px' }} />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'blavk' }}>
                    Data Validation
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{

                      color: 'text.secondary',
                      textAlign: 'center',
                      fontSize: '14px',
                      mt: 2
                    }}
                  >
                    Ensure the accuracy and reliability of data by performing automated checks to identify incorrect data types, unexpected special characters, and invalid metric values.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
        {/* Centered Button */}
        <DialogTitle style={{ cursor: 'pointer' }}>
          <input
            type="file"
            id="file"
            name="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload} // Upload handler
          />
          <label htmlFor="file">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#003366",
                color: "#fff",
                width: "100%",
                height: "60px",
                padding: "20px",
                fontSize: "1.2rem",
                borderRadius: "8px",
                border: "5px solid white",
                textWrap: "nowrap",
                textTransform: "none",
              }}
              onClick={() => document.getElementById('file').click()}
              className='import-data-btn'>
              Import Data
            </Button>
          </label>
          <Typography variant="subtitle2" component="span" sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'blue', textDecoration: 'underline', display: 'block', marginTop: '10px', textAlign: 'center' }}
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/data.csv';
              link.setAttribute('download', 'data.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            onMouseOver={(e) => e.target.style.cursor = 'pointer'}
            className='view-file-btn'
          >
            See the demo file
          </Typography>
          {selectedFile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mr: 3 }}>
                {selectedFile.name}
              </Typography>
              <IconButton onClick={handleViewFile}>
                <VisibilityIcon />
              </IconButton>
              <IconButton onClick={handleRemoveDataFile}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </DialogTitle>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000} // 3 seconds
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          action={
            <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
              <CheckCircleIcon style={{ color: 'green' }} />
            </IconButton>
          }
        />
      </Box>
    </>
  );
};
export default Home;