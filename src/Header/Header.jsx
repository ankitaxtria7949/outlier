import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axtriaImage from '../assets/axtria-logo.png';
import HomeIcon from '@mui/icons-material/Home';
 
 
 
 
export const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#87CEEB', padding: '10px' }}> {/* Light Blue Strip */}
      <Toolbar>
        {/* Left Side Logo */}
        <Box
          component="img"
          src={axtriaImage} // Replace with your logo URL
          alt="Logo"
          style={{ width: '120px', height: 'auto' }}
        />
 
        <Box sx={{ flexGrow: 1, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 'bold', color: 'black', fontSize: '2rem', cursor: 'pointer' }}
             
            >
              Axtria Outlier Tool
            </Typography>
          </Box>
 
        {/* Right Side Help Button */}
          <HelpOutlineIcon sx={{ color: 'black' ,mr: 2 }} />
       
          <HomeIcon sx={{ color: 'black' }} onClick={() => { window.location.href = "/" }} />
       
      </Toolbar>
    </AppBar>
  )
}
 
export default Header;