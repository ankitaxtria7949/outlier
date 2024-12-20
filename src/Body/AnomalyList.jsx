import { useContext, React, useState } from "react";
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
    IconButton,
    Menu,
    MenuItem,
    Switch,
    FormControlLabel,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { MyContext } from "./Context";
import { useNavigate } from "react-router-dom";

export const AnomalyList = () => {
    const { Summary, setSummary } = useContext(MyContext);
    const { Outliers } = useContext(MyContext);
    const navigate = useNavigate();

    // State for filter menus
    const [anchorEl, setAnchorEl] = useState([null, null, null]);
    const [filters, setFilters] = useState(["", "", ""]);
    const [showOutliers, setShowOutliers] = useState(false); // Toggle state

    // Columns to display
    const displayedColumns = [
        "Product",
        "Country",
        "Forecast Scenario",
        "Months",
        "Market Volume",
    ];

    // Open menu for a specific column
    const handleMenuOpen = (index, event) => {
        const newAnchorEl = [...anchorEl];
        newAnchorEl[index] = event.currentTarget;
        setAnchorEl(newAnchorEl);
    };

    // Close menu for a specific column
    const handleMenuClose = (index) => {
        const newAnchorEl = [...anchorEl];
        newAnchorEl[index] = null;
        setAnchorEl(newAnchorEl);
    };

    // Apply filter selection
    const handleFilterSelect = (index, value) => {
        const newFilters = [...filters];
        newFilters[index] = value;
        setFilters(newFilters);
        handleMenuClose(index);
    };

    // Filtered rows based on selected filters
    const filteredRows = Summary
        ? Summary.filter((row) =>
            filters.every((filter, index) =>
                filter ? row[Object.keys(row)[index]].toString() === filter : true
            )
        )
        : [];

    // Filtered rows based on toggle
    const rowsToDisplay = showOutliers
        ? filteredRows.filter((row) =>
            Outliers.some((outlier) =>
                Object.entries(outlier).every(
                    ([key, value]) => row[key] === value
                )
            )
        )
        : filteredRows;

    // Helper function to check if a row is an outlier
    const isOutlier = (row) => {
        return Outliers.some((outlier) =>
            Object.entries(outlier).every(
                ([key, value]) => row[key] === value
            )
        );
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 2,
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => {
                        navigate("/summary");
                    }}
                >
                    Summary
                </Button>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <FormControlLabel
                    control={
                        <Switch
                            checked={showOutliers}
                            onChange={() => setShowOutliers(!showOutliers)}
                            color="primary"
                        />
                    }
                    label={showOutliers ? "Showing Outliers" : "Showing All Data"}
                />
            </Box>
            {showOutliers && (
                <Typography
                    sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 2 }}
                >
                    There are {Outliers.length} outliers in the dataset.
                </Typography>
            )}

            {!showOutliers && (
                <Typography
                    sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 2 }}
                >
                    This table shows the whole data set with the outliers highlighted.
                </Typography>
            )}
            {Summary && Summary.length > 0 ? (
                <TableContainer
                    component={Paper}
                    sx={{ maxHeight: "calc(100vh - 64px)", overflow: "auto" }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {displayedColumns.map((key, colIndex) => (
                                    <TableCell
                                        key={key}
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#f5f5f5",
                                            textTransform: "capitalize",
                                            position: "relative",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            {key}
                                            {colIndex < 3 && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(event) =>
                                                        handleMenuOpen(colIndex, event)
                                                    }
                                                    sx={{ marginLeft: 1 }}
                                                >
                                                    <FilterListIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                        {colIndex < 3 && (
                                            <Menu
                                                anchorEl={anchorEl[colIndex]}
                                                open={Boolean(anchorEl[colIndex])}
                                                onClose={() => handleMenuClose(colIndex)}
                                            >
                                                <MenuItem
                                                    onClick={() => handleFilterSelect(colIndex, "")}
                                                >
                                                    Clear Filter
                                                </MenuItem>
                                                {[...new Set(Summary.map((row) => row[key]))].map(
                                                    (value) => (
                                                        <MenuItem
                                                            key={value}
                                                            onClick={() =>
                                                                handleFilterSelect(colIndex, value)
                                                            }
                                                            selected={filters[colIndex] === value}
                                                            sx={{
                                                                color:
                                                                    filters[colIndex] === value
                                                                        ? "blue"
                                                                        : "black",
                                                                backgroundColor:
                                                                    filters[colIndex] === value
                                                                        ? "#e0e0e0"
                                                                        : "inherit",
                                                            }}
                                                        >
                                                            {value}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </Menu>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rowsToDisplay.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    hover
                                    sx={{
                                        backgroundColor:
                                            !showOutliers && isOutlier(row)
                                                ? "rgba(255, 0, 0, 0.2)" // Light red for outliers
                                                : "inherit", // No highlight in outlier mode
                                    }}
                                >
                                    {displayedColumns.map((col, colIndex) => (
                                        <TableCell key={colIndex}>
                                            {row[col] === -1 ? "" : row[col]}
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
