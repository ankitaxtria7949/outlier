import { useContext, useState } from "react";
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
    Switch,
    FormControlLabel,
    Menu,
    MenuItem,
    IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { MyContext } from "./Context";
import { useNavigate } from "react-router-dom";

export const AnomalyList = () => {
    const { Summary } = useContext(MyContext);
    const { Outliers } = useContext(MyContext);
    const navigate = useNavigate();
    const [showOnlyHighlighted, setShowOnlyHighlighted] = useState(false);
    const [filters, setFilters] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [filterColumn, setFilterColumn] = useState("");

    // Calculate the total number of outliers

    // Group by Country, Product, and Forecast Scenario
    const groupedOutliers = Outliers.reduce((groups, outlier) => {
        const key = `${outlier.Country}, ${outlier.Product}, ${outlier["Forecast Scenario"]}`;
        groups[key] = (groups[key] || 0) + 1;
        return groups;
    }, {});


    // Function to check if a row exists in Outliers
    const isOutlier = (row) => {
        return Outliers.some((outlier) =>
            JSON.stringify(outlier) === JSON.stringify(row)
        );
    };

    // Filter rows based on toggle and active filters
    const applyFilters = (row) => {
        return Object.entries(filters).every(([key, value]) =>
            value ? row[key].toString() === value : true
        );
    };

    const filteredSummary = showOnlyHighlighted
        ? Summary.filter((row) => isOutlier(row) && applyFilters(row))
        : Summary.filter(applyFilters);

    // Function to handle filter changes
    const handleFilterChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            [filterColumn]: value,
        }));
        setAnchorEl(null);
    };

    const openFilterMenu = (event, column) => {
        setFilterColumn(column);
        setAnchorEl(event.currentTarget);
    };

    const closeFilterMenu = () => {
        setAnchorEl(null);
    };

    // Function to get unique values for a column
    const getColumnValues = (column) => {
        const values = Summary.map((row) => row[column]).filter((value) => value !== -1);
        return [...new Set(values)]; // Unique values
    };

    // Function to download table data as CSV
    const downloadCSV = () => {
        if (!filteredSummary || filteredSummary.length === 0) return;

        const headers = Object.keys(filteredSummary[0]).join(",");
        const rows = filteredSummary
            .map((row) =>
                Object.values(row)
                    .map((value) => (value === -1 ? "" : value)) // Handle -1 as empty
                    .join(",")
            )
            .join("\n");

        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "table_data.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // The issue was that the template literal was not properly defined.

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showOnlyHighlighted}
                            onChange={(e) => setShowOnlyHighlighted(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Show only Outliers"
                />
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        backgroundColor: '#f0f4f8',
                        padding: 1,
                        borderRadius: 1
                    }}
                >
                    <Typography variant="h5" sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
                        {showOnlyHighlighted ? "✨ Outliers ✨" : "📊 Source Data 📊"}
                    </Typography>
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        sx={{ mr: 2 }}
                        onClick={downloadCSV}
                    >
                        Download CSV
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            navigate("/summary");
                        }}
                    >
                        Summary
                    </Button>
                </Box>
            </Box>

            {filteredSummary && filteredSummary.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 64px)", overflow: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {Object.keys(Summary[0]).slice(0, -1).map((key, index) => (
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
                                        {index < 2 && ( // Only add filter to the first two columns
                                            <IconButton
                                                size="small"
                                                onClick={(event) => openFilterMenu(event, key)}
                                                sx={{ ml: 1 }}
                                            >
                                                <FilterListIcon sx={{ color: filters[key] ? "red" : "inherit" }} />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSummary.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    hover
                                    sx={{
                                        backgroundColor: isOutlier(row)
                                            ? "rgba(255, 0, 0, 0.2)"
                                            : rowIndex % 2 === 0
                                            ? "#f0f8ff"
                                            : "white",
                                        "&:hover": {
                                            backgroundColor: isOutlier(row)
                                                ? "rgba(255, 0, 0, 0.3)"
                                                : "#e6f7ff",
                                        },
                                    }}
                                >
                                    {Object.values(row).slice(0, -1).map((value, colIndex) => (
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
                <Typography variant="body1" sx={{ textAlign: "center", marginTop: 2 }}>
                    {showOnlyHighlighted
                        ? "No highlighted rows to display."
                        : "No data available to display."}
                </Typography>
            )}


            {/* Filter Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={closeFilterMenu}
            >
                <MenuItem onClick={() => handleFilterChange("")}>Clear Filter</MenuItem>
                {getColumnValues(filterColumn).map((value, index) => (
                    <MenuItem key={index} onClick={() => handleFilterChange(value)}>
                        {value}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};