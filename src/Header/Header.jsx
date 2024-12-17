import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axtriaImage from '../assets/axtria-logo.png';



export const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#87CEEB' }}> {/* Light Blue Strip */}
      <Toolbar>
        {/* Left Side Logo */}
        <Box
          component="img"
          src={axtriaImage} // Replace with your logo URL
          alt="Logo"
          sx={{ height: 40, marginRight: 2 }}
        />

        {/* Center Text */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1, // Push other items to the sides
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#ffffff',
          }}
        >
          Axtria Outlier Tool
        </Typography>

        {/* Right Side Help Button */}
        <IconButton color="inherit">
          <HelpOutlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Header;