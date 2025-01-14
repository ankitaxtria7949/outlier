import React from 'react';
import { useState, useEffect } from 'react';

import { useContext } from 'react';
import { Card, CardContent, Typography, CardActionArea, Grid, Box, Button } from '@mui/material';
import { TrendingUp, TaskAlt } from '@mui/icons-material';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from "@mui/icons-material/Delete"; // Delete file icon
import VisibilityIcon from "@mui/icons-material/Visibility"; // View file icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "./Context";
import axios from 'axios';
import { Snackbar } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import DialogTitle from '@mui/material/DialogTitle';

import './Home.css';


const Home = () => {
    const navigate = useNavigate();
    const { ValData, setValData } = useContext(MyContext);
    const { DataFileName, setDataFileName } = useContext(MyContext); // Full path of uploaded file
    const { selectedFile, setSelectedFile } = useContext(MyContext); // Holds the uploaded data file
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Whether the snackbar is open or not
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Message to display in the snackbar
    const { Outliers, setOutliers } = useContext(MyContext);
    const { Summary, setSummary } = useContext(MyContext);
    const [Loading, setLoading] = useState(false);
    const [tutorialActive, setTutorialActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // Track the current step in the tutorial



    // Start the tutorial after 1 seconds automatically
    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                setTutorialActive(true);  // Start the tutorial
            }
        }, 1000); // Start after 1 seconds

        return () => {
            clearTimeout(timer);
            isMounted = false;
        }; // Cleanup the timer

    }, []); // Run only once

    const showTutorial = (step) => {
        const targetElement = document.querySelector(step.target);
        const popup = document.createElement('div');
        popup.classList.add('tutorial-popup', step.placement);
        popup.textContent = step.content;

        // Position the popup based on the target element and placement
        const rect = targetElement.getBoundingClientRect();
        let top, left;

        if (step.placement === 'top') {
            top = rect.top - popup.offsetHeight;
            left = rect.left + rect.width / 2 - popup.offsetWidth / 2;
        } else if (step.placement === 'bottom') {
            top = rect.bottom + 30;
            left = rect.left + rect.width / 2 - popup.offsetWidth / 2;
        } else if (step.placement === 'left') {
            top = rect.top + rect.height / 2 - popup.offsetHeight / 2;
            left = rect.left - popup.offsetWidth;
        } else if (step.placement === 'right') {
            top = rect.top + rect.height / 2 - popup.offsetHeight / 2;
            left = rect.right + 10;
        }

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;

        document.body.appendChild(popup);

        // Create the spotlight overlay
        const overlay = document.createElement('div');
        overlay.classList.add('spotlight-overlay');
        document.body.appendChild(overlay);

        // Create the spotlight hole and position it over the target element
        const spotlightHole = document.createElement('div');
        spotlightHole.classList.add('spotlight-hole');
        spotlightHole.style.width = `${rect.width}px`;
        spotlightHole.style.height = `${rect.height}px`;
        spotlightHole.style.top = `${rect.top}px`;
        spotlightHole.style.left = `${rect.left}px`;
        document.body.appendChild(spotlightHole);

        // Add the target highlight effect
        targetElement.classList.add('target-highlight');

        // Add a button to close the popup
        const closeButton = document.createElement('button');
        closeButton.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Skip Tutorial';
        closeButton.style.marginRight = '40px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.borderRadius = '5px';

        closeButton.addEventListener('click', () => {
            setTutorialActive(false);
            popup.remove();
            overlay.remove();
            spotlightHole.remove();
            targetElement.classList.remove('target-highlight');

        });

        popup.appendChild(closeButton);

        const previousButton = document.createElement('button');
        previousButton.textContent = 'Previous';
        previousButton.style.padding = '5px 10px';
        previousButton.style.marginRight = '5px';
        previousButton.style.borderRadius = '5px';
        previousButton.disabled = currentStep === 0; // Disable if first step
        previousButton.style.backgroundColor = previousButton.disabled ? 'grey' : 'navy';
        previousButton.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
            spotlightHole.remove();
            targetElement.classList.remove('target-highlight');
            setCurrentStep(currentStep - 1); // Move to previous step
        });

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.style.padding = '5px 10px';
        nextButton.style.borderRadius = '5px';
        nextButton.disabled = currentStep === steps.length - 1; // Disable if last step
        nextButton.style.backgroundColor = nextButton.disabled ? 'grey' : 'green';
        nextButton.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
            spotlightHole.remove();
            targetElement.classList.remove('target-highlight');
            setCurrentStep(currentStep + 1); // Move to next step
        });



        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.marginTop = '20px';
        buttons.style.justifyContent = 'space-between';
        buttons.style.width = '100%';
        buttons.appendChild(closeButton);

        const flexEndButtons = document.createElement('div');
        flexEndButtons.style.display = 'flex';
        flexEndButtons.appendChild(previousButton);
        flexEndButtons.appendChild(nextButton);
        buttons.appendChild(flexEndButtons);

        popup.appendChild(buttons); // Insert the buttons after the text
    };


    const handleStartTutorial = () => {
        setTutorialActive(true);
        setCurrentStep(0); // Start from the first step
    };

    useEffect(() => {
        if (tutorialActive && currentStep < steps.length) {
            showTutorial(steps[currentStep]); // Show the current step
        }
    }, [tutorialActive, currentStep]);

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


    // Handle removing Data File
    const handleRemoveDataFile = () => {
        setSelectedFile(null);
        setDataFileName(""); // Clear the data file name

    };



    // Open file for checking (only for supported types)
    const handleViewFile = () => {
        if (selectedFile) {
            const fileURL = URL.createObjectURL(selectedFile);
            window.open(fileURL, "_blank");
        }
    };

    const steps = [
        {
            index: 0,
            target: '.import-data-btn',
            content: 'Click here to upload your data file!',
            placement: 'right',
        },
        {
            index: 1,
            target: '.outlier-detection-card',
            content: 'Click here to detect outliers in your data.',
            placement: 'bottom',
        },
        {
            index: 2,
            target: '.trendbreak-card',
            content: 'Click here to see disruptions or trends in your data.',
            placement: 'bottom',
        },
        {
            index: 3,
            target: '.validation-card',
            content: 'Click here to perform data validation to ensure its accuracy.',
            placement: 'bottom',
        },
        {
            index: 4,
            target: '.view-file-btn',
            content: 'Click to view the uploaded file.',
            placement: 'right',
        },

    ];

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
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap:'2px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '10px' }}>
                        <h1 style={{ textWrap: 'nowrap' }}>Welcome to the Outlier Detection Tool!</h1>
                    </Box>                  
                    
                        <IconButton
                            onClick={handleStartTutorial}
                            sx={{
                                color: 'black', mr: 2,
                            '&:hover': {
                                backgroundColor: 'transparent',
                            },
                            }}
                            title='Start Tutorial'
                        >
                            <HelpOutlineIcon  />
                        </IconButton>                  
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