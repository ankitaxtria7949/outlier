import { useContext, useState, useEffect } from "react";
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
import IconButton from "@mui/material/IconButton";

import Tooltip from "@mui/material/Tooltip";
import { MyContext } from "./Context";
import { useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import Checkbox from "@mui/material/Checkbox";
import { Checkroom } from "@mui/icons-material";
import NativeSelect from '@mui/material/NativeSelect';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import "./AnomalyList.css";
import introJs from 'intro.js';




export const AnomalyList = () => {
    const { Summary, Outliers, tutList, setTutList } = useContext(MyContext);
    const navigate = useNavigate();
    const [showOnlyHighlighted, setShowOnlyHighlighted] = useState(false);
    const [filters, setFilters] = useState({});
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("");
    const [viewMode, setViewMode] = useState("all"); // 'all', 'outliers', 'withoutOutliers'
    const [checkCol, setCheckCol] = useState(false);
    const [dropdownCol, setDropdownCol] = useState("No");


    // Function to check if a row exists in Outliers
    const isOutlier = (row) => {
        return Outliers && Outliers.some((outlier) =>
            JSON.stringify(outlier) === JSON.stringify(row)
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

        let headers = Object.keys(filteredSummary[0])
            .slice(0, -1) // Exclude the last column
            .join(",");
        let rows = filteredSummary
            .map((row) =>
                Object.values(row)
                    .slice(0, -1) // Exclude the last column
                    .map((value) => (value === -1 ? "" : value)) // Handle -1 as empty
                    .join(",")
            )
            .join("\n");

        if (viewMode === "outliers") {
            headers += ",RevisedVolume";
            rows = rows
                .split("\n")
                .map((row) => {
                    const rowArray = row.split(",");
                    const ky = rowArray.slice(0, 4).join("|");
                    rowArray.push(revisedVolume[ky]);
                    return rowArray.join(",");
                })
                .join("\n");
            headers += ",Changed To";
            rows = rows
                .split("\n")
                .map((row) => {
                    const rowArray = row.split(",");
                    const ky = rowArray.slice(0, 4).join("|");
                    rowArray.push(dropdownRow[ky]);
                    return rowArray.join(",");
                })
                .join("\n");
        }

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

    const totalMarketVolume = filteredSummary.reduce((sum, item) => {
        return sum + (item['Market Volume'] || 0);
    }, 0);

    const temppp = sortedRows;
    const [checkRow, setCheckRow] = useState(
        temppp.reduce((acc, item) => {
            acc[`${item.Product}|${item.Country}|${item["Forecast Scenario"]}|${item.Months}`] = false;
            return acc;
        }, {})
    );
    const [dropdownRow, setDropdownRow] = useState(
        temppp.reduce((acc, item) => {
            acc[`${item.Product}|${item.Country}|${item["Forecast Scenario"]}|${item.Months}`] = "No";
            return acc;
        }, {})
    );
    const [revisedVolume, setRevisedVolume] = useState(
        temppp.reduce((acc, item) => {
            acc[`${item.Product}|${item.Country}|${item["Forecast Scenario"]}|${item.Months}`] =
                item["Market Volume"] || 0;
            return acc;
        }, {})
    );



    const handleCheckCol = () => {
        setCheckCol(!checkCol);
        Object.keys(checkRow).forEach(key => {
            if (sortedRows.some(row =>
                `${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}` === key)) {
                setCheckRow(prevState => ({
                    ...prevState,
                    [key]: checkCol ? false : true
                }));
            }
        });
    }
    const handleDropDownCol = (evt) => {
        Object.keys(dropdownRow).forEach(key => {
            if (sortedRows.some(row =>
                `${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}` === key)) {
                if (checkRow[key]) {
                    setDropdownRow(prevState => ({
                        ...prevState,
                        [key]: evt
                    }));
                }
            }
        });
        Object.keys(revisedVolume).forEach(key => {
            const row = sortedRows.find(row =>
                `${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}` === key);
            if (row && checkRow[key]) {
                setRevisedVolume(prevState => ({
                    ...prevState,
                    [key]: evt === 'No' ? row['Market Volume'] : evt === 'LCL' ? row.LCL : evt === 'UCL' ? row.UCL : evt === 'Nearest' ? (Math.abs(row.UCL - row["Market Volume"]) > Math.abs(row.LCL - row["Market Volume"]) ? row.LCL : row.UCL) : 0
                }));
            }
        });
        setDropdownCol(evt);
    }
    const handleDropDown = (row, evt) => {
        setDropdownRow({ ...dropdownRow, [`${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}`]: evt });
        setRevisedVolume({ ...revisedVolume, [`${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}`]: evt === 'No' ? row['Market Volume'] : evt === 'LCL' ? row.LCL : evt === 'UCL' ? row.UCL : evt === 'Nearest' ? (Math.abs(row.UCL - row["Market Volume"]) > Math.abs(row.LCL - row["Market Volume"]) ? row.LCL : row.UCL) : 0 });

    }
    const handleCheckRow = (row) => {
        const key = `${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}`;
        setCheckRow((prevCheckRow) => {
            const updatedCheckRow = { ...prevCheckRow, [key]: !prevCheckRow[key] };
            const hasUncheckedRow = Object.keys(updatedCheckRow).some((rowKey) => {
                return (
                    sortedRows.some(
                        (sortedRow) =>
                            `${sortedRow.Product}|${sortedRow.Country}|${sortedRow["Forecast Scenario"]}|${sortedRow.Months}` === rowKey
                    ) && !updatedCheckRow[rowKey]
                );
            });
            setCheckCol(!hasUncheckedRow);
            return updatedCheckRow;
        });
    };
    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted && tutList) {
                setTutList(false);
                showTutorial();  // Start the tutorial
            }
        }, 1000); // Start after 1 second

        return () => {
            clearTimeout(timer);
            isMounted = false;
        }; // Cleanup the timer

    }, []);
    const showTutorial2 = () => {
        const end = introJs();
        end.setOptions({
            steps: [
                {
                    element: '.start-tour-button',
                    intro: 'You can click here to rewatch the tutorial.',
                    position: 'left'
                },
            ],
            showProgress: false, // Disable progress bar
            showStepNumbers: false,
            showBullets: false,
            nextLabel: '', // Remove "Next" button label
            prevLabel: '', // Remove "Previous" button label    
            showButtons: false, // Disable default Next/Prev buttons
        });

        end.onafterchange(() => {
            const tooltipContainer = document.querySelector('.introjs-tooltipbuttons');
            const tooltip = document.querySelector('.introjs-tooltip');
            const crossIcon = document.querySelector('.introjs-skipbutton')

            if (crossIcon) {
                Object.assign(crossIcon.style, {
                    color: "red",
                    padding: "2px",
                    marginBottom: '0px'
                })
            }
            // Remove any existing buttons in the tooltip
            if (tooltipContainer) {
                tooltipContainer.innerHTML = ''; // Clear all buttons
            }

            // Style the tooltip box
            if (tooltip) {
                Object.assign(tooltip.style, {
                    backgroundColor: '#f9f9f9',
                    color: '#333',
                    whiteSpace: 'nowrap',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: "5px",
                    maxWidth: '500px',
                    fontSize: '14px',
                    minWidth: '300px',
                    textAlign: 'center',
                });
                tooltip.style.display = 'flex';
                tooltip.style.flexDirection = 'column';
                tooltip.style.justifyContent = 'space-between';
            }
        });


        end.start();
    };
    const showTutorial = () => {
        const intro = introJs();
        const tempsteps = [
            {
                element: '.all-data-btn',
                intro: 'Clicking here shows the entire data with highlighted Outliers!',
            },
            {
                element: '.only-outlier-btn',
                intro: 'Click here to see only the outliers in your data.',
            },
            {
                element: '.without-outlier-btn',
                intro: 'Click here to see the data with outliers removed',
            },
            {
                element: '.filter-table',
                intro: 'Use these drop down filters to filter the table displayed below',
            },
            {
                element: '.sorting-icon',
                intro: 'Use this to sort your data in ascending or descending order.',
            },
            {
                element: '.download-file-btn',
                intro: 'Click to download the table displayed as a CSV file.',
            },
            {
                element: '.summary-btn',
                intro: 'Click to view the summary page.',
            },

        ];
        const tempsteps2 = [
            {
                element: '.all-data-btn',
                intro: 'Clicking here shows the entire data with highlighted Outliers!',
            },
            {
                element: '.only-outlier-btn',
                intro: 'Click here to see only the outliers in your data.',
            },
            {
                element: '.without-outlier-btn',
                intro: 'Click here to see the data with outliers removed',
            },
            {
                element: '.filter-table',
                intro: 'Use these drop down filters to filter the table displayed below',
            },
            {
                element: '.sorting-icon',
                intro: 'Use this to sort your data in ascending or descending order.',
            },
            {
                element: '.tick-btn',
                intro: 'click here to select/deselect table rows.',
            },
            {
                element: '.change-btn',
                intro: 'Click here to set the revised market volume to the selected option.',
            },
            {
                element: '.download-file-btn',
                intro: 'Click to download the table displayed as a CSV file.',
            },
            {
                element: '.summary-btn',
                intro: 'Click to view the summary page.',
            },
        ];
        intro.setOptions({
            steps: viewMode === 'outliers' ? tempsteps2 : tempsteps,
            showProgress: false, // Disable progress bar
            showStepNumbers: false,
            showBullets: false,
            nextLabel: 'Next step',
            prevLabel: 'Previous step',
            doneLabel: 'Finished'
        });

        intro.onafterchange(() => {
            const tooltipContainer = document.querySelector('.introjs-tooltipbuttons');
            const nextButton = document.querySelector('.introjs-nextbutton');
            const prevButton = document.querySelector('.introjs-prevbutton');
            const tooltip = document.querySelector('.introjs-tooltip');
            const totalSteps = intro._options.steps.length; // Get total number of steps
            const currentStep = intro._currentStep; // Get current step index
            console.log(currentStep)
            console.log(totalSteps)

            // Remove default close button
            const crossIcon = document.querySelector('.introjs-skipbutton');
            if (crossIcon) {
                crossIcon.remove();
            }

            // Add a custom "Skip tutorial" button
            let customSkipButton = document.querySelector('.custom-skip-button');
            if (!customSkipButton) {
                customSkipButton = document.createElement('button');
                customSkipButton.className = 'custom-skip-button';
                Object.assign(customSkipButton.style, {
                    backgroundColor: 'red',
                    fontSize: '12px',
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    height: '20px',
                    borderRadius: '5px',
                });

                customSkipButton.onclick = () => {
                    intro.exit(); // End the current tour
                    showTutorial2(); // Start the second tour
                };

                if (tooltipContainer && prevButton) {
                    tooltipContainer.insertBefore(customSkipButton, prevButton.nextSibling);
                }
            }

            // Update the custom "Skip tutorial" button text dynamically
            if (currentStep === totalSteps - 1) {
                customSkipButton.textContent = 'Close'; // Change Skip button text to "Close"
            } else {
                customSkipButton.textContent = 'Skip tutorial'; // Reset Skip button text
            }

            if (nextButton) {
                if (currentStep === totalSteps - 1) {
                    // Disable and style the Next button on the last step
                    nextButton.disabled = true;
                    Object.assign(nextButton.style, {
                        position: 'absolute',
                        bottom: '15px',
                        right: '10px',
                        backgroundColor: 'grey',
                        color: 'white',
                        cursor: 'not-allowed',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textShadow: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        boxShadow: 'none',
                    });
                } else {
                    // Enable and style the Next button for other steps
                    nextButton.disabled = false;
                    Object.assign(nextButton.style, {
                        position: 'absolute',
                        bottom: '15px',
                        right: '10px',
                        backgroundColor: 'green',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textShadow: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        boxShadow: 'none',
                    });
                }
            }

            // Style the Previous button
            if (prevButton) {
                if (currentStep === 0) {
                    prevButton.disabled = true;
                    Object.assign(prevButton.style, {
                        backgroundColor: 'grey',
                        fontSize: '12px',
                        color: 'white',
                        marginRight: '40px',
                        fontWeight: 'bold',
                        textShadow: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                    });
                }
                else {
                    Object.assign(prevButton.style, {
                        backgroundColor: 'navy',
                        fontSize: '12px',
                        color: 'white',
                        marginRight: '40px',
                        fontWeight: 'bold',
                        textShadow: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                    })
                }
            }

            // Style the tooltip box
            if (tooltip) {
                Object.assign(tooltip.style, {
                    backgroundColor: '#f9f9f9',
                    color: '#333',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: '5px',
                    maxWidth: '500px',
                    fontSize: '14px',
                    minWidth: '300px',
                    textAlign: 'center',
                });
            }
        });

        intro.start();
    };
    const handleStartTutorial = () => {
        showTutorial();
    };



    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <ButtonGroup variant="contained" color="primary">
                    <Button
                        onClick={() => setViewMode("all")}
                        variant={viewMode === "all" ? "contained" : "outlined"}
                        className="all-data-btn"
                    >
                        All Data
                    </Button>
                    <Button
                        onClick={() => setViewMode("outliers")}
                        variant={viewMode === "outliers" ? "contained" : "outlined"}
                        className="only-outlier-btn"
                    >
                        Outliers Only
                    </Button>
                    <Button
                        onClick={() => setViewMode("withoutOutliers")}
                        variant={viewMode === "withoutOutliers" ? "contained" : "outlined"}
                        className="without-outlier-btn"
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
                    <Button variant="contained" sx={{ mr: 2 }} onClick={downloadCSV} className="download-file-btn">
                        Download CSV
                    </Button>
                    <Button variant="contained" onClick={() => { navigate("/summary"); }} className="summary-btn">
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
                        {viewMode === "outliers" ? " across the Outliers data" : viewMode === "withoutOutliers" ? "across the Without Outliers data " : "across the data"}
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
            }}

            >

                {["Product", "Country", "Forecast Scenario"].map((column, index) => (
                    <FormControl key={index} sx={{ m: 2, width: '20ch' }} size='small' className="filter-table" >
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
                <Box sx={{ flex: 1, display: "flex", justifyContent: 'flex-end', alignItems: 'center', m: 'auto' }}>
                    <Button
                        className='start-tour-button'
                        variant="contained"
                        sx={{ backgroundColor: '#007BFF', color: 'white', position: 'absolute', right: 0, mr: 4 }}
                        onClick={() => handleStartTutorial()}
                    >
                        Show Tutorial
                    </Button>
                </Box>
            </Box>

            {/* Table */}
            {sortedRows && sortedRows.length > 0 ? (

                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 64px)", overflow: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {/* Add Checkbox column header if viewMode is "Outliers" */}
                                {viewMode === "outliers" && (
                                    <TableCell
                                        className="tick-btn"
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#f5f5f5",
                                            textAlign: "center",
                                            maxWidth: 150,
                                        }}
                                    >
                                        <Checkbox
                                            checked={checkCol}
                                            onChange={handleCheckCol}
                                        />

                                    </TableCell>
                                )}
                                {/* Render column headers */}
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
                                                    className="sorting-icon"

                                                />
                                            </Tooltip>
                                            {orderBy === key && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        marginLeft: 1,
                                                        color: order === "asc" ? "blue" : "red",
                                                    }}
                                                >
                                                    {order}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                                {viewMode === "outliers" && (
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#f5f5f5",
                                            textAlign: "center",
                                            maxWidth: 150,
                                        }}
                                    >
                                        Revised Market Volume
                                    </TableCell>
                                )}
                                {viewMode === "outliers" && (
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#f5f5f5",
                                            textAlign: "center",
                                            maxWidth: 150,
                                        }}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                                Change Market Volume To
                                            </InputLabel>
                                            <NativeSelect
                                                className="change-btn"
                                                sx={{ fontSize: '0.75rem' }}
                                                value={dropdownCol}
                                                onChange={(e) => {
                                                    handleDropDownCol(e.target.value);
                                                }}

                                            >
                                                <option value={"LCL"}>Change To LCL</option>
                                                <option value={"UCL"}>Change to UCL</option>
                                                <option value={"Nearest"}>Change To Nearest</option>
                                                <option value={"No"}>No Change</option>
                                            </NativeSelect>
                                        </FormControl>
                                    </TableCell>
                                )}
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
                                    {/* Add Checkbox column if viewMode is "Outliers" */}
                                    {viewMode === "outliers" && (
                                        <TableCell

                                            sx={{
                                                textAlign: "center",
                                            }}
                                        >
                                            <Checkbox
                                                checked={checkRow[`${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}`]}
                                                onChange={() => handleCheckRow(row)}
                                            />
                                        </TableCell>
                                    )}
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
                                    {viewMode === "outliers" && (
                                        <TableCell
                                            sx={{
                                                fontWeight: "bold",
                                                textAlign: "center",
                                                maxWidth: 150,
                                            }}
                                        >
                                            {revisedVolume[`${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}`]}
                                        </TableCell>
                                    )}
                                    {viewMode === "outliers" && (
                                        <TableCell
                                            sx={{
                                                fontWeight: "bold",
                                                textAlign: "center",
                                                maxWidth: 150,
                                            }}
                                        >
                                            <FormControl fullWidth>
                                                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                                    Change To
                                                </InputLabel>
                                                <NativeSelect
                                                    sx={{ fontSize: '0.775rem' }}
                                                    value={dropdownRow[`${row.Product}|${row.Country}|${row["Forecast Scenario"]}|${row.Months}`]}
                                                    onChange={(e) => handleDropDown(row, e.target.value)}
                                                >
                                                    <option value={"LCL"}>Change To LCL</option>
                                                    <option value={"UCL"}>Change to UCL</option>
                                                    <option value={"Nearest"}>Change To Nearest</option>
                                                    <option value={"No"}>No Change</option>
                                                </NativeSelect>
                                            </FormControl>
                                        </TableCell>
                                    )}
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