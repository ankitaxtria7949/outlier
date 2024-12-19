import { useContext, React, useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Button,
    Typography,
} from "@mui/material";
import { MyContext } from "./Context";
import { useNavigate } from "react-router-dom";

export const AnomalyList = () => {
    const { Outliers, setOutliers } = useContext(MyContext);
    const navigate = useNavigate();
    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" onClick={() => {
                    navigate('/summary');
                }}>
                    Summary
                </Button>
            </Box>
            {Outliers && Outliers.length > 0 ? (


                <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>


                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {Object.keys(Outliers[0]).map((key) => (
                                    <TableCell
                                        key={key}
                                        sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', textTransform: 'capitalize' }}
                                    >
                                        {key}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Outliers.map((row, rowIndex) => (
                                <TableRow key={rowIndex} hover>
                                    {Object.values(row).map((value, colIndex) => (
                                        <TableCell key={colIndex}>{value === -1 ? '' : value}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', marginTop: 2 }}>
                    No data available to display.
                </Typography>
            )}
        </Box>
    );
};
