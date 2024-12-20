import React from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { Card, CardContent, Typography, CardActionArea, Grid, Box, Button } from '@mui/material';
import { TrendingUp, TaskAlt} from '@mui/icons-material';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from "@mui/icons-material/Delete"; // Delete file icon
import VisibilityIcon from "@mui/icons-material/Visibility"; // View file icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "./Context";
import axios from 'axios';
import {Snackbar} from '@mui/material';
 
const Home = () => {
    const navigate = useNavigate();
    const { ValData, setValData } = useContext(MyContext);
    const {DataFileName, setDataFileName} = useContext(MyContext); // Full path of uploaded file
    const {selectedFile, setSelectedFile} = useContext(MyContext); // Holds the uploaded data file
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Whether the snackbar is open or not
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Message to display in the snackbar
    const {Outliers, setOutliers} = useContext(MyContext);
    const {Summary, setSummary} = useContext(MyContext);
 
 
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
        console.log(flag);

        if (flag === "false") {
            const formData = new FormData();
            // Append necessary data to the form, including the selected file and parameters
            formData.append('file', selectedFile);
            formData.append('flag', flag);

            try {
                // Post the formData to the backend API
                const response = await axios.post('http://localhost:8000/upload2', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setOutliers(response.data.outliers); // Update state with fetched outliers
                setSummary(response.data.summary);
            } catch (error) {
                console.error('Error uploading file:', error); // Log the error for debugging
            }
        }
        else {
            const formData = new FormData();
            // Append necessary data to the form, including the selected file and parameters
            formData.append('file', selectedFile);
            formData.append('flag', flag);

            try {
                // Post the formData to the backend API
                const response = await axios.post('http://localhost:8000/upload2', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                const validationData = response.data.val_dt; // Use a local variable to avoid state timing issues
                setValData(validationData);

                if (validationData !== null && validationData.length === 0) {
                    alert('No Errors Found');
                } 
            } catch (error) {
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
 
    const handleNavigate = () => {
        navigate('/input-data'); // Change '/input-data' to your actual route
    };
 
    return (
       
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
            <h1 style={{textWrap: 'nowrap', textAlign: 'center', marginTop: '10px'}}>
               
            Welcome to the Outlier Detection tool!</h1>
            <Grid container spacing={4} justifyContent="center" sx={{ marginBottom: '40px', marginTop: '5px' }}>
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
                    >
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}  onClick={() => { navigate('/anomaly-list'); handleshowresults("false"); }}>
                            <ScatterPlotIcon sx={{ fontSize: 50, color: 'black', marginTop: '20px' }} />
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
                                    Detect Outlier
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
                                    A tool for flagging outliers on consolidated data, streamlining data analysis, and
                                    providing valuable insights.
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
                    >
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',cursor: 'pointer' }}  onClick={() => { navigate('/anomaly-list'); handleshowresults("false"); }}>
                            <TrendingUp sx={{ fontSize: 50, color: 'black', marginTop: '20px' }} />
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
                                   Track Trendbreaks
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '14px', mt: 2 }}
                                >
                                    A tool for detecting trend breaks in data, identifying significant deviations, and highlighting potential issues.
                                    critical changes to ensure timely and informed decision making.
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
                    >
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => { handleshowresults("true"); }}>
                            <TaskAlt sx={{ fontSize: 50, color: 'black', marginTop: '20px' }} />
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'blavk' }}>
                                    Run Validation Checks
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
                                    A tool for running validation checks to identify wrong data types, special characters
                                    and inapopropriate metric values, ensuring data integrirty and accuracy.  
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
           
 
            {/* Centered Button */}
           
                <input
                    type="file"
                    id="file"
                    name="file"
                    style={{display: 'none'}}
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
                        onClick={() => document.getElementById('file').click()}>
                        Import Data
                    </Button>
                </label>
 
                {selectedFile && (
                    <Box sx={{display: 'flex', alignItems: 'center', mt: 2}}>
                        <Typography variant="body2" sx={{color: 'text.secondary', mr: 2}}>
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
    );
};
 
export default Home;