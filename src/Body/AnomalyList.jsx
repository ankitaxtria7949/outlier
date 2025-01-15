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



export const AnomalyList = () => {
    const { Summary, Outliers } = useContext(MyContext);
    const navigate = useNavigate();
    const [showOnlyHighlighted, setShowOnlyHighlighted] = useState(false);
    const [filters, setFilters] = useState({});
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("");
    const [viewMode, setViewMode] = useState("all"); // 'all', 'outliers', 'withoutOutliers'
    const [checkCol, setCheckCol] = useState(false);
    const [dropdownCol, setDropdownCol] = useState("No");
    const [tutorialActive, setTutorialActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // Track the current step in the tutorial



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
            if (isMounted) {
                setTutorialActive(true);  // Start the tutorial
            }
        }, 1000); // Start after 1 seconds

        return () => {
            clearTimeout(timer);
            isMounted = false;
        }; // Cleanup the timer

    }, []); // Run only once
    const showTutorial2 = () => {
        const step = {
            index: 0,
            target: '.tutorial-btn',
            content: 'You can always see this tutorial by clicking on this button.',
            placement: 'left',
        };
        const targetElement = document.querySelector(step.target);
        const popup = document.createElement('div');
        popup.classList.add('tutorial-popup', step.placement);
        popup.textContent = step.content;
        targetElement.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.75)';
        targetElement.style.border = '3px solid navy';
        // Position the popup based on the target element and placement
        const rect = targetElement.getBoundingClientRect();
        let top, left;
        top = rect.top + rect.height / 2 - popup.offsetHeight / 2;
        left = rect.left - 350;
        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
        document.body.appendChild(popup);
        // Add a button to close the popup
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        closeButton.style.marginRight = '40px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.borderRadius = '5px';
        closeButton.addEventListener('click', () => {
            setTutorialActive(false);
            setCurrentStep(0);
            popup.remove();
            targetElement.style.border = '';
            targetElement.style.boxShadow = '';
        });
        popup.appendChild(closeButton);
    };

    const showTutorial = (step) => {
        const targetElement = document.querySelector(step.target);

        const popup = document.createElement('div');
        popup.classList.add('tutorial-popup', step.placement);
        popup.textContent = step.content;
        targetElement.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.75)';
        targetElement.style.border = '3px solid navy';

        // Position the popup based on the target element and placement
        const rect = targetElement.getBoundingClientRect();
        let top, left;

        if (step.placement === 'top') {
            top = rect.top - popup.offsetHeight;
            left = rect.left + rect.width / 2 - popup.offsetWidth / 2;
        } else if (step.placement === 'bottom') {
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2 - popup.offsetWidth / 2;
        } else if (step.placement === 'left') {
            top = rect.top + rect.height / 2 - popup.offsetHeight / 2;
            left = rect.left - 350;
        } else if (step.placement === 'right') {
            top = rect.top + rect.height / 2 - popup.offsetHeight / 2;
            left = rect.right + 10;
        }

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;

        document.body.appendChild(popup);

        // Add a button to close the popup
        const closeButton = document.createElement('button');
        closeButton.textContent = currentStep === (viewMode === 'outliers' ? steps2 : steps).length - 1 ? 'Finish' : 'Skip Tutorial';
        closeButton.style.marginRight = '40px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.borderRadius = '5px';

        closeButton.addEventListener('click', () => {
            popup.remove();
            setTutorialActive(false);

            targetElement.style.border = '';
            targetElement.style.boxShadow = '';
            showTutorial2();

        });
        console.log("tutorial state", tutorialActive)

        popup.appendChild(closeButton);

        const previousButton = document.createElement('button');
        previousButton.textContent = 'Previous';
        previousButton.style.padding = '5px 10px';
        previousButton.style.marginRight = '5px';
        previousButton.style.borderRadius = '5px';
        previousButton.disabled = currentStep === 0; // Disable if first step
        previousButton.style.backgroundColor = previousButton.disabled ? 'grey' : 'navy';
        previousButton.addEventListener('click', () => {
            popup.remove();

            setCurrentStep(currentStep - 1); // Move to previous step
            targetElement.style.border = '';
            targetElement.style.boxShadow = '';
        });

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.style.padding = '5px 10px';
        nextButton.style.borderRadius = '5px';
        nextButton.disabled = currentStep === (viewMode === 'outliers' ? steps2 : steps).length - 1; // Disable if last step
        nextButton.style.backgroundColor = nextButton.disabled ? 'grey' : 'green';
        nextButton.addEventListener('click', () => {
            popup.remove();

            setCurrentStep(currentStep + 1); // Move to next step
            targetElement.style.border = '';
            targetElement.style.boxShadow = '';
        });

        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.marginTop = '20px';
        buttons.style.justifyContent = 'space-between';
        buttons.style.width = '100%';
        buttons.appendChild(closeButton);

        const flexEndButtons = document.createElement('div');
        flexEndButtons.style.display = 'flex';
        flexEndButtons.appendChild(previousButton);
        flexEndButtons.appendChild(nextButton);
        buttons.appendChild(flexEndButtons);

        popup.appendChild(buttons); // Insert the buttons after the text
    };


    const handleStartTutorial = () => {
        setTutorialActive(true);
        setCurrentStep(0); // Start from the first step
    };

    useEffect(() => {
        if (viewMode === 'all' || viewMode === 'withoutOutliers') {
            if (tutorialActive && currentStep < steps.length) {
                showTutorial(steps[currentStep]); // Show the current step
            }
        }
        else {
            if (tutorialActive && currentStep < steps2.length) {
                showTutorial(steps2[currentStep]); // Show the current step
            }
        }
    }, [tutorialActive, currentStep]);

    const steps = [
        {
            index: 0,
            target: '.all-data-btn',
            content: 'Clicking here shows the entire data with highlighted Outliers!',
            placement: 'right',
        },
        {
            index: 1,
            target: '.only-outlier-btn',
            content: 'Click here to see only the outliers in your data.',
            placement: 'right',
        },
        {
            index: 2,
            target: '.without-outlier-btn',
            content: 'Click here to see the data with outliers removed',
            placement: 'right',
        },
        {
            index: 3,
            target: '.filter-table',
            content: 'Use these drop down filters to filter the table displayed below',
            placement: 'right',
        },
        {
            index: 4,
            target: '.sorting-icon',
            content: 'Use this to sort your data in ascending or descending order.',
            placement: 'right',
        },
        {
            index: 5,
            target: '.download-file-btn',
            content: 'Click to download the table displayed as a CSV file.',
            placement: 'left',
        },
        {
            index: 6,
            target: '.summary-btn',
            content: 'Click to view the summary page.',
            placement: 'left',
        },

    ];
    const steps2 = [
        {
            index: 0,
            target: '.all-data-btn',
            content: 'Clicking here shows the entire data with highlighted Outliers!',
            placement: 'right',
        },
        {
            index: 1,
            target: '.only-outlier-btn',
            content: 'Click here to see only the outliers in your data.',
            placement: 'right',
        },
        {
            index: 2,
            target: '.without-outlier-btn',
            content: 'Click here to see the data with outliers removed',
            placement: 'right',
        },
        {
            index: 3,
            target: '.filter-table',
            content: 'Use these drop down filters to filter the table displayed below',
            placement: 'right',
        },
        {
            index: 4,
            target: '.sorting-icon',
            content: 'Use this to sort your data in ascending or descending order.',
            placement: 'right',
        },
        {
            index: 5,
            target: '.tick-btn',
            content: 'click here to select/deselect table rows.',
            placement: 'right',
        },
        {
            index: 6,
            target: '.change-btn',
            content: 'Click here to set the revised market volume to the selected option.',
            placement: 'left',
        },
        {
            index: 7,
            target: '.download-file-btn',
            content: 'Click to download the table displayed as a CSV file.',
            placement: 'left',
        },
        {
            index: 8,
            target: '.summary-btn',
            content: 'Click to view the summary page.',
            placement: 'left',
        },

    ];

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
                    <Typography
                        className='tutorial-btn'
                        variant="body2"
                        sx={{ color: 'black', position: 'absolute', right: 0, cursor: 'pointer', mr : 4}}
                        onClick={() => handleStartTutorial()}
                    >
                        Show tutorial
                    </Typography>
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