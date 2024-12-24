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
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    ButtonGroup,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { MyContext } from "./Context";
import { useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";

export const AnomalyList = () => {
    const { Summary, Outliers } = useContext(MyContext);
    const navigate = useNavigate();
    const [showOnlyHighlighted, setShowOnlyHighlighted] = useState(false);
    const [filters, setFilters] = useState({});
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("");
    const [viewMode, setViewMode] = useState("all"); // 'all', 'outliers', 'withoutOutliers'



    // Function to check if a row exists in Outliers
    const isOutlier = (row) => {
        return Outliers && Outliers.some((outlier) =>
            JSON.stringify(outlier) === JSON.stringify(row)
        );
    };

    // Filter rows based on toggle and active filters
    const applyFilters = (row) => {
        return Object.entries(filters).every(([key, value]) =>
            value ? row[key].toString() === value : true
        );
    };
    const filteredSummary = Summary.filter((row) => {
        if (viewMode === "outliers") return isOutlier(row);
        if (viewMode === "withoutOutliers") return !isOutlier(row);
        return true; // 'all'
    }).filter((row) =>
        Object.entries(filters).every(([key, value]) =>
            value ? row[key].toString() === value : true
        )
    );



        
    // Function to handle filter changes
    const handleFilterChange = (column, value) => {
        setFilters((prev) => ({
            ...prev,
            [column]: value,
        }));
    };

    // Function to get unique values for a column
    const getColumnValues = (column) => {
        if (!Summary) return [];
        const values = Summary.map((row) => row[column]).filter((value) => value !== -1);
        return [...new Set(values)]; // Unique values
    };

    // Function to handle sorting
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    // Sort rows by the selected column and order
    const sortedRows = [...filteredSummary].sort((a, b) => {
        if (orderBy) {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (aValue < bValue) {
                return order === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return order === "asc" ? 1 : -1;
            }
            return 0;
        }
        return 0;
    });

    // Function to download table data as CSV
    const downloadCSV = () => {
        if (!filteredSummary || filteredSummary.length === 0) return;

        const headers = Object.keys(filteredSummary[0])
            .slice(0, -1) // Exclude the last column
            .join(",");
        const rows = filteredSummary
            .map((row) =>
                Object.values(row)
                    .slice(0, -1) // Exclude the last column
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

    const findMaxOutlierCombination = () => {
        if (!Outliers || Outliers.length === 0) return;

        // Group data by combination
        const counts = Outliers.reduce((acc, outlier) => {
            // Use bracket notation for "Forecast Scenario"
            const key = `${outlier.Product}|${outlier.Country}|${outlier["Forecast Scenario"]}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        // Find the maximum combination
        let maxKey = null;
        let maxCount = 0;
        for (const [key, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxKey = key;
                maxCount = count;
            }
        }

        // Parse the key to extract Product, Country, and ForecastScenario
        const [Product, Country, ForecastScenario] = maxKey.split("|");
        return { Product, Country, ForecastScenario, count: maxCount };
    };
    const result = findMaxOutlierCombination();

    const totalMarketVolume = Summary.reduce((sum, item) => {
        return sum + (item['Market Volume'] || 0);
    }, 0);

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <ButtonGroup variant="contained" color="primary">
                    <Button
                        onClick={() => setViewMode("all")}
                        variant={viewMode === "all" ? "contained" : "outlined"}
                    >
                        All Data
                    </Button>
                    <Button
                        onClick={() => setViewMode("outliers")}
                        variant={viewMode === "outliers" ? "contained" : "outlined"}
                    >
                        Outliers Only
                    </Button>
                    <Button
                        onClick={() => setViewMode("withoutOutliers")}
                        variant={viewMode === "withoutOutliers" ? "contained" : "outlined"}
                    >
                        Without Outliers
                    </Button>
                </ButtonGroup>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", backgroundColor: "#f0f4f8", padding: 1, borderRadius: 1, ml: -15 }}>
                    <Typography variant="h5" sx={{ color: "black", fontWeight: "bold" }}>
                        {showOnlyHighlighted ? "✨ Outliers ✨" : "📊 Source Data 📊"}
                    </Typography>
                </Box>
                <Box>
                    <Button variant="contained" sx={{ mr: 2 }} onClick={downloadCSV}>
                        Download CSV
                    </Button>
                    <Button variant="contained" onClick={() => { navigate("/summary"); }}>
                        Summary
                    </Button>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f0f4f8",
                    padding: 2,
                    borderRadius: 1,
                    mb: 2,
                    boxShadow: 2, // Optional: Adds a subtle shadow for depth
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1, // Ensure columns are evenly spaced
                    }}
                >
                    <Typography variant="body1" sx={{ color: "black" }}>
                        Total Outliers:
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: "bold",
                            color: "#007BFF", // Optional: Highlight total count with a specific color
                        }}
                    >
                        {Outliers.length}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "black" }}>
                        out of <b>{Summary.length}</b>
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1, // Ensure columns are evenly spaced
                    }}
                >
                    <Typography variant="body1" sx={{ color: "black" }}>
                        Total Market Volume
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: "bold",
                            color: "#007BFF", // Optional: Highlight total count with a specific color
                        }}
                    >
                        {totalMarketVolume < 1000 ? totalMarketVolume :
                            totalMarketVolume < 100000 ?
                                (totalMarketVolume / 1000).toFixed(2) + 'k' :
                                (totalMarketVolume / 1000000).toFixed(2) + 'M'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "black" }}>
                        across the data
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1, // Ensure columns are evenly spaced
                    }}
                >
                    <Typography variant="body1" sx={{ color: "black" }}>
                        Max Outliers
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: "bold",
                            color: "#007BFF", // Optional: Highlight total count with a specific color
                        }}
                    >
                        {result.count}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "black" }}>
                        In <b>{result.Country}</b> for Product <b>{result.Product}</b> and  <b>{result.ForecastScenario}</b> Forecast Scenario
                    </Typography>
                </Box>
                




            </Box>

            {/* Filter Dropdowns for First Three Columns */}
            <Box sx={{
                display: "flex",
                flexWrap: "wrap",
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#f5f5f5',
                mb: 2
            }}>
                {["Product", "Country", "Forecast Scenario"].map((column, index) => (
                    <FormControl key={index} sx={{ m: 2, width: '20ch' }} size='small'>
                        <InputLabel>{column}</InputLabel>
                        <Select
                            value={filters[column] || ""}
                            onChange={(e) => handleFilterChange(column, e.target.value)}
                            label={column}
                            sx={{
                                height: '40px',
                                backgroundColor: '#f5f5f5',
                                '& .Mui-selected': {
                                    backgroundColor: 'darkblue !important',
                                    color: 'white !important',
                                },
                                '& .MuiSelect-icon': {
                                    color: 'darkblue', // Custom arrow color
                                },
                            }}
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            {getColumnValues(column).map((value, valueIndex) => (
                                <MenuItem key={valueIndex} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
            </Box>

            {/* Table */}
            {sortedRows && sortedRows.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 64px)", overflow: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {Object.keys(Summary[0]).slice(0, -1).map((key, index) => (
                                    <TableCell
                                        key={index}
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

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => handleRequestSort(key)}
                                        >
                                            {key}
                                            <Tooltip title="Sort" arrow>
                                                <FilterListIcon
                                                    sx={{
                                                        marginLeft: 1,
                                                        color:
                                                            orderBy === key
                                                                ? order === "asc"
                                                                    ? "blue"
                                                                    : "red"
                                                                : "gray",
                                                        transform:
                                                            orderBy === key && order === "asc"
                                                                ? "rotate(180deg)"
                                                                : "none",
                                                        transition: "transform 0.3s",
                                                    }}
                                                />
                                            </Tooltip>
                                            {orderBy === key && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        marginLeft: 1,
                                                        color:
                                                            order === "asc"
                                                                ? "blue"
                                                                : "red"

                                                    }}
                                                >
                                                    {order}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedRows.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    sx={{
                                        backgroundColor: rowIndex % 2 === 0
                                            ? isOutlier(row) ? "rgba(255, 0, 0, 0.1)" : "#f0f8ff"
                                            : isOutlier(row) ? "rgba(255, 0, 0, 0.2)" : "white",
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
                    {showOnlyHighlighted ? "No highlighted rows to display." : "No data available to display."}
                </Typography>
            )}
        </Box>
    );
};