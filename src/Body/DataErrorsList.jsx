import { useContext } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    Button,
} from "@mui/material";
import { MyContext } from "./Context";
import { useNavigate } from "react-router-dom";

export const ErrorsList = () => {
    const { ValData } = useContext(MyContext);
    const navigate = useNavigate();

    return (
        <Box sx={{ padding: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        textAlign: "center",
                        backgroundColor: "#e3f2fd", // Light blue background
                        padding: 1,
                        borderRadius: 1,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            color: "black",
                            fontWeight: "bold",
                        }}
                    >
                        {"Errors"}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ position: "absolute", right: "16px" }}
                    onClick={() => navigate("/")}
                >
                    Go to Home
                </Button>
            </Box>
            {ValData && ValData.length > 0 ? (
                <TableContainer
                    component={Paper}
                    sx={{ maxHeight: "calc(100vh - 64px)", overflow: "auto" }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {Object.keys(ValData[0]).map((key) => (
                                    <TableCell
                                        key={key}
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#f5f5f5",
                                            textTransform: "capitalize",
                                            textAlign: "center",
                                            maxWidth: 150,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {key}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ValData.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    sx={{
                                        backgroundColor:
                                            rowIndex % 2 === 0 ? "#f0f8ff" : "white",
                                    }}
                                >
                                    {Object.values(row).map((value, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            sx={{
                                                maxWidth: 150,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                textAlign: "center",
                                            }}
                                        >
                                            {value === -1 ? "" : value}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography
                    variant="body1"
                    sx={{ textAlign: "center", marginTop: 2 }}
                >
                    No data available to display.
                </Typography>
            )}
        </Box>
    );
};
