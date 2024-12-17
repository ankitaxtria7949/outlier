import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Grid, Box, Button } from '@mui/material';
import { TrendingUp, BarChart } from '@mui/icons-material';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/input-data');  // Change '/import-data' to your actual import data route
    };
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#ffffff',  // White background for the page
                padding: '20px',
            }}
        >
            <Grid container spacing={4} justifyContent="center">
                {/* Card 1 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        sx={{
                            width: '100%',
                            minHeight: 250,
                            background: '#f5f5f5',
                            color: 'black',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid black',
                            '&:hover': { boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)' },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between', // Space for content and button
                        }}
                    >
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ScatterPlotIcon sx={{ fontSize: 50, color: '#888888', marginTop: '20px' }} />
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                    Detect Outlier
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 'bold', color: 'text.secondary', textAlign: 'center', fontSize: '14px' }}
                                >
                                    A tool for flagging outliers on consolidated data, streamlining data analysis, and providing valuable insights.
                                </Typography>
                            </CardContent>
                        </CardActionArea>

                        {/* Button at the bottom of the card */}
                        <Button
                            onClick={handleNavigate}
                            sx={{
                                marginTop: 'auto',  // Push the button to the bottom
                                backgroundColor: '#1976d2',
                                color: 'white',
                                '&:hover': { backgroundColor: '#1565c0' },
                            }}
                        >
                            Import Data
                        </Button>
                    </Card>
                </Grid>

                {/* Card 2 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        sx={{
                            width: '100%',
                            minHeight: 250,  // Adjusted height
                            background: '#f5f5f5',  // Light grey background for the card
                            color: 'black',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',  // Light shadow for a soft effect
                            borderRadius: '8px',
                            border: '1px solid black',  // Black border to differentiate the card
                            '&:hover': { boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)' },
                        }}
                    >
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <TrendingUp sx={{ fontSize: 50, color: '#888888', marginTop: '20px' }} />
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                    Title Demo 2                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '14px' }}>
                                    Demo 2                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Card 3 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        sx={{
                            width: '100%',
                            minHeight: 250,  // Adjusted height
                            background: '#f5f5f5',  // Light grey background for the card
                            color: 'black',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',  // Light shadow for a soft effect
                            borderRadius: '8px',
                            border: '1px solid black',  // Black border to differentiate the card
                            '&:hover': { boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)' },
                        }}
                    >
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <BarChart sx={{ fontSize: 50, color: '#888888', marginTop: '20px' }} />
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                    Title demo 3                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '14px' }}>
                                    Demo3
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Home;
