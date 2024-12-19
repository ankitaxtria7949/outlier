import React, { useState, useRef, useContext } from "react";
import {
    Button,
    TextField,
    Box,
    Typography,
    Container,
    Snackbar,
    IconButton,
    Tooltip,
    Popover,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile"; // Upload file icon
import DeleteIcon from "@mui/icons-material/Delete"; // Delete file icon
import VisibilityIcon from "@mui/icons-material/Visibility"; // View file icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "./Context";
import axios from 'axios';


const InputData = () => {
    const navigate = useNavigate();
    const {DataFileName, setDataFileName} = useContext(MyContext); // Full path of uploaded file
    const {selectedFile, setSelectedFile} = useContext(MyContext); // Holds the uploaded data file
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Whether the snackbar is open or not
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Message to display in the snackbar
    const {Outliers, setOutliers} = useContext(MyContext);
    const {Summary, setSummary} = useContext(MyContext);


    const handleshowresults = async () => {
        const formData = new FormData();
        // Append necessary data to the form, including the selected file and parameters
        formData.append('file', selectedFile);

        try {
            // Post the formData to the backend API
            const response = await axios.post('http://127.0.0.1:8000/upload2', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setOutliers(response.data.outliers); // Update state with fetched outliers
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error uploading file:', error); // Log the error for debugging
        }
    };

    // Tutorial step references
    const FileUploadRef = useRef();
    const detectAnomaliesRef = useRef();
    
    // Handle file upload using upload icon (Data File)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setDataFileName(file.name); // Show full file name in the text field
        }
        setSnackbarMessage(`File uploaded: ${file.name}`);
        setSnackbarOpen(true);
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

    // Handle the popover


    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    p: 3,
                    mt: 5,
                    border: "1px solid lightgray",
                    borderRadius: "8px",
                    boxShadow: 2,
                    backgroundColor: "#fafafa",
                }}
            >
                {/* Import Button */}
                

                {/* Data File Input with Upload Icon */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }} >
                    <TextField
                        label="Data File Name"
                        variant="outlined"
                        fullWidth
                        value={DataFileName}
                        InputProps={{
                            readOnly: true, // Make input field non-editable
                        }}
                        placeholder="Upload file using the icon"
                        disabled={!selectedFile} // Disabled until a file is uploaded
                    />
                    <Tooltip title="Upload Data File">
                        <IconButton component="label" sx={{ ml: 1 }} id="file-upload" ref={FileUploadRef}>
                            <UploadFileIcon fontSize="large" />
                            {/* Hidden file input */}
                            <input
                                type="file"
                                hidden
                                onChange={handleFileUpload} // Upload handler
                            />
                        </IconButton>
                    </Tooltip>

                    {/* View File Button */}
                    {selectedFile && (
                        <Tooltip title="View Data File">
                            <IconButton onClick={handleViewFile} sx={{ ml: 1 }}>
                                <VisibilityIcon fontSize="large" color="info" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Remove File Button */}
                    {selectedFile && (
                        <Tooltip title="Remove Data File">
                            <IconButton onClick={handleRemoveDataFile} sx={{ ml: 1 }}>
                                <DeleteIcon fontSize="large" color="error" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                

                {/* Detect Anomalies Button */}
                <Box mt={3} textAlign="center" >
                    <Button
                        variant="contained"
                        id="detect-anomalies"
                        ref={detectAnomaliesRef}
                        onClick={() => { navigate('/anomaly-list'); handleshowresults(); }}
                        sx={{
                            backgroundColor: "#003366",
                            color: "#fff",
                            width: "25%",
                            height: "60px",
                            padding: "20px",
                            fontSize: "1.2rem",
                            borderRadius: "8px",
                            border: "5px solid white",
                            textWrap: "nowrap",
                            textTransform: "none",
                        }}
                    >
                        Detect Anomalies
                    </Button>
                </Box>

                
            </Box>
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
        </Container>
    );
};

export default InputData;
