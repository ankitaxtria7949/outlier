import React, { useState } from "react";
import {
    Button,
    TextField,
    Box,
    Typography,
    Container,
    IconButton,
    Tooltip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile"; // Upload file icon
import DeleteIcon from "@mui/icons-material/Delete"; // Delete file icon
import VisibilityIcon from "@mui/icons-material/Visibility"; // View file icon

const InputData = () => {
    const [DataFileName, setDataFileName] = useState(""); // Full path of uploaded file
    const [CmdFileName, setCmdFileName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // Holds the uploaded data file
    const [selectedCmdFile, setSelectedCmdFile] = useState(null); // Holds the uploaded CMD file
    const [importedFile, setImportedFile] = useState(null); // Holds file after Import button is clicked

    // Handle file upload using upload icon (Data File)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setDataFileName(file.name); // Show full file name in the text field
        }
    };

    // Handle CMD file upload using upload icon (CMD File)
    const handleCmdFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedCmdFile(file);
            setCmdFileName(file.name); // Show full file name in the text field
        }
    };

    // Handle importing the file
    const handleImport = () => {
        if (selectedFile || selectedCmdFile) {
            setImportedFile(selectedFile || selectedCmdFile);
            alert(
                `File imported successfully!\nData File: ${selectedFile ? selectedFile.name : "None"}\nCMD File: ${selectedCmdFile ? selectedCmdFile.name : "None"}`
            );
        } else {
            alert("Please upload at least one file.");
        }
    };

     // Handle removing Data File
     const handleRemoveDataFile = () => {
        setSelectedFile(null);
        setDataFileName(""); // Clear the data file name
        if (importedFile === selectedFile) {
            setImportedFile(null); // Clear imported file status only if it is CMD file
        }
        
    };

    // Handle removing CMD File
    const handleRemoveCmdFile = () => {
        setSelectedCmdFile(null);
        setCmdFileName(""); // Clear the cmd file name
        if (importedFile === selectedCmdFile) {
            setImportedFile(null); // Clear imported file status only if it is CMD file
        }
    };

    

    // Open file for checking (only for supported types)
    const handleViewFile = () => {
        if (selectedFile) {
            const fileURL = URL.createObjectURL(selectedFile);
            window.open(fileURL, "_blank");
        } else if (selectedCmdFile) {
            const fileURL = URL.createObjectURL(selectedCmdFile);
            window.open(fileURL, "_blank");
        }
    };

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
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleImport}
                        size="large"
                    >
                        Import
                    </Button>
                </Box>

                {/* Data File Input with Upload Icon */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
                        <IconButton component="label" sx={{ ml: 1 }}>
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

                {/* CMD File Path */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TextField
                        label="Cmd File Path"
                        variant="outlined"
                        fullWidth
                        value={CmdFileName}
                        InputProps={{
                            readOnly: true, // Make input field non-editable
                        }}
                        placeholder="Upload file using the icon"
                        disabled={!selectedCmdFile} // Disabled until a file is uploaded
                    />
                    <Tooltip title="Upload CMD File">
                        <IconButton component="label" sx={{ ml: 1 }}>
                            <UploadFileIcon fontSize="large" />
                            {/* Hidden file input */}
                            <input
                                type="file"
                                hidden
                                onChange={handleCmdFileUpload} // Upload handler
                            />
                        </IconButton>
                    </Tooltip>

                    {/* View File Button */}
                    {selectedCmdFile && (
                        <Tooltip title="View CMD File">
                            <IconButton onClick={handleViewFile} sx={{ ml: 1 }}>
                                <VisibilityIcon fontSize="large" color="info" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Remove File Button */}
                    {selectedCmdFile && (
                        <Tooltip title="Remove CMD File">
                            <IconButton onClick={handleRemoveCmdFile} sx={{ ml: 1 }}>
                                <DeleteIcon fontSize="large" color="error" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Detect Anomalies Button */}
                <Box mt={3} textAlign="center">
                    <Button
                        variant="contained"
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

                {/* Tutorial Link */}
                <Box mt={2} textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                            Click here to watch Tutorial
                        </a>
                    </Typography>
                </Box>

                {/* Import Status */}
                {importedFile && (
                    <Box mt={2}>
                        <Typography variant="body2" color="success.main">
                            File imported successfully:{" "}
                            {selectedFile
                                ? selectedFile.name
                                : selectedCmdFile
                                ? selectedCmdFile.name
                                : importedFile?.name} {/* Use `.name` to display file name */}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default InputData;
