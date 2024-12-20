import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Grid, Box, Button } from '@mui/material';
import { TrendingUp, TaskAlt} from '@mui/icons-material';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
 
import { useNavigate } from 'react-router-dom';
 
const Home = () => {
    const navigate = useNavigate();
 
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
            <h1 style={{textWrap: 'nowrap', textAlign: 'center', marginTop: '40px'}}>
               
            Welcome to the Outlier Detection tool!</h1>
            <Grid container spacing={4} justifyContent="center" sx={{ marginBottom: '40px', marginTop: '40px' }}>
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
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',cursor: 'pointer' }}>
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
                        <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <TaskAlt sx={{ fontSize: 50, color: 'black', marginTop: '20px' }} />
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'blavk' }}>
                                    Run Vlidation Checks
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
           
                <Button
                    variant="contained"
                    onClick={handleNavigate}
                    sx={{
                        backgroundColor: "#003366",
                        color: "#fff",
                        width: "30%",
                        height: "60px",
                        padding: "20px",
                        fontSize: "1.2rem",
                        borderRadius: "8px",
                        border: "5px solid white",
                        textWrap: "nowrap",
                        textTransform: "none",
                    }}>
                    Import Data
                </Button>
           
        </Box>
    );
};
 
export default Home;