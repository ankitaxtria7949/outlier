import React, { useState } from 'react';
import { Button, TextField, Box, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import ClearIcon from '@mui/icons-material/Clear';

const InputData = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [isUrlUpload, setIsUrlUpload] = useState(false);

  // Handle the file selection from file input
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setOpenDialog(false); // Close the dialog when a file is selected
  };

  // Handle the file URL input
  const handleUrlChange = () => {
    if (fileUrl) {
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const file = new File([blob], fileUrl.split('/').pop(), { type: blob.type });
          setSelectedFile(file);
          setOpenDialog(false); // Close the dialog after URL upload
        })
        .catch((error) => {
          alert('Error fetching file from URL.');
        });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileUrl(''); // Reset the URL field if the file is removed
  };

  const openUploadDialog = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Box sx={{
        padding: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        {/* File Upload Status */}
        <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '20px' }}>
          Upload your data here
        </Typography>
        {/* Box with upload button, file name display and clear button */}
        <Box sx={{ display: 'flex', gap: 2, marginTop: '10px', alignItems: 'center' }}>

          {/* Upload button with dialog opening */}
          <Button
            variant="contained"
            color="primary"
            onClick={openUploadDialog}
            sx={{
              borderRadius: 1,
              marginRight: '10px',
              marginBottom: '5px'
            }}
            startIcon={<UploadIcon />}
          >
            <Typography variant="caption" sx={{ fontSize: '0.78rem' }}>Upload file</Typography>
          </Button>

        </Box>
      </Box>

      {/* Dialog for file upload options */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select Upload Option</DialogTitle>
        <DialogContent>
          <Button
            variant="outlined"
            onClick={() => setIsUrlUpload(false)} // Local storage option
            sx={{ width: '100%', marginBottom: '10px' }}
          >
            Upload from Local Storage
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsUrlUpload(true)} // URL input option
            sx={{ width: '100%' }}
          >
            Upload from File URL
          </Button>

          {/* Conditional rendering based on selected upload option */}
          {isUrlUpload ? (
            <TextField
              label="File URL"
              variant="outlined"
              fullWidth
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              sx={{ marginTop: '10px' }}
            />
          ) : (
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ marginTop: '10px', display: 'block' }}
            />
          )}
          {/* Show file name and remove button if file is selected */}
          {selectedFile && (
            <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" component="span" fontWeight="bold">
                <span style={{ color: 'black' }}>Uploaded file: </span>
                <span style={{ color: 'red' }}>{selectedFile.name}</span>
              </Typography>
              <IconButton onClick={handleRemoveFile}>
                <ClearIcon />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={isUrlUpload ? handleUrlChange : () => {}} color="primary" disabled={isUrlUpload ? !fileUrl : false}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InputData;
