import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from './Context';
import { Line } from 'react-chartjs-2';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Summary = () => {
  const { Outliers, Summary } = useContext(MyContext);

  const [selectedProduct, setSelectedProduct] = useState(""); // Default to None
  const [selectedCountry, setSelectedCountry] = useState(""); // Default to None
  const [selectedForecastScenario, setSelectedForecastScenario] = useState(""); // Default to None
  const [appliedFilters, setAppliedFilters] = useState({
    product: "",
    country: "",
    forecastScenario: "",
  });

  useEffect(() => {
    if (Array.isArray(Summary) && Summary.length > 0) {
      // Set default filter values to the first available values from the data
      setSelectedProduct(Summary[0].Product);
      setSelectedCountry(Summary[0].Country);
      setSelectedForecastScenario(Summary[0]['Forecast Scenario']);
    }
  }, [Summary]);

  useEffect(() => {
    if (selectedProduct && selectedCountry && selectedForecastScenario) {
      applyFilters();
    }
  }, [selectedProduct, selectedCountry, selectedForecastScenario]);

  const applyFilters = () => {
    setAppliedFilters({
      product: selectedProduct,
      country: selectedCountry,
      forecastScenario: selectedForecastScenario,
    });
  };

  if (!Array.isArray(Summary)) {
    return <Typography>Loading data...</Typography>;
  }


  // Function to download table data as CSV


  const filteredSummary = Summary.filter((summary) => {
    const productMatch = appliedFilters.product ? appliedFilters.product === summary.Product : true;
    const countryMatch = appliedFilters.country ? appliedFilters.country === summary.Country : true;
    const forecastScenarioMatch = appliedFilters.forecastScenario
      ? appliedFilters.forecastScenario === summary['Forecast Scenario']
      : true;
    return productMatch && countryMatch && forecastScenarioMatch;
  });

  const filteredOutlier = Outliers.filter((outlier) => {
    const productMatch = appliedFilters.product ? appliedFilters.product === outlier.Product : true;
    const countryMatch = appliedFilters.country ? appliedFilters.country === outlier.Country : true;
    const forecastScenarioMatch = appliedFilters.forecastScenario
      ? appliedFilters.forecastScenario === outlier['Forecast Scenario']
      : true;
    return productMatch && countryMatch && forecastScenarioMatch;
  });

  const marketVolumeData = filteredSummary.map((summary) => summary['Market Volume']);
  const IQRUCL = filteredSummary.map((summary) =>
    summary['UCL'] === -1 ? null : summary['UCL']
  );
  const IQRLCL = filteredSummary.map((summary) =>
    summary['LCL'] === -1 ? null : summary['LCL']
  );
  const outlierData = filteredSummary.map((summary) => {
    const isOutlier = filteredOutlier.some(
      (outlier) => outlier.Months === summary.Months
    );
    return isOutlier ? summary['Market Volume'] : null;
  });

  const outlierCount = outlierData.filter((value) => value !== null).length;



  const trendBreakData = filteredSummary.map((summary) =>
    summary['Trend Break Value'] === -1 ? null : summary['Trend Break Value']
  );
  const outlierTB = trendBreakData.filter((value) => value !== null).length;

  const chartData = {
    labels: filteredSummary.map((summary) => summary.Months),
    datasets: [
      {
        label: 'Market Volume',
        data: marketVolumeData,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(0, 255, 8, 0.2)',
        fill: true,
      },
      {
        label: 'Upper Control Limit (UCL)',
        data: IQRUCL,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        fill: false,
        borderDash: [5, 5],
      },
      {
        label: 'Lower Control Limit (LCL)',
        data: IQRLCL,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        fill: false,
        borderDash: [5, 5],
      },
      {
        label: 'Outliers',
        data: outlierData,
        borderColor: '#f44336',
        backgroundColor: '#f44336',
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 0,
        showLine: false,
      },
    ],
  };

  const chartData2 = {
    labels: filteredSummary.map((summary) => summary.Months),
    datasets: [
      {
        label: 'Market Volume',
        data: marketVolumeData,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(0, 255, 8, 0.2)',
        fill: true,
      },
      {
        label: 'Trend Break',
        data: trendBreakData,
        borderColor: '#f44336',
        backgroundColor: 'rgba(236, 16, 0, 0.2)',
        fill: true,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
        showLine: false,
      },
    ],
  };

  const handleSelectChange = (setter, value) => {
    setter(value);
  };

  const getUniqueValues = (key) => {
    return Array.isArray(Summary) ? [...new Set(Summary.map((summary) => summary[key]))] : [];
  };

  const calculatePercentages = (data) => {
    return data.map((item, index) => {
      const prevMonth = data[index - 1];
      const prevQuarter = data[index - 3];

      const MoM = prevMonth
        ? ((item['Market Volume'] - prevMonth['Market Volume']) / prevMonth['Market Volume']) * 100
        : null;

      const QoQ = prevQuarter
        ? ((item['Market Volume'] - prevQuarter['Market Volume']) / prevQuarter['Market Volume']) * 100
        : null;

      return { ...item, MoM, QoQ };
    });
  };

  const summaryWithPercentages = calculatePercentages(filteredSummary);

  const downloadCSV = () => {
    if (!summaryWithPercentages || summaryWithPercentages.length === 0) return;

    const temp = summaryWithPercentages.map((row) => ({
      Months: row.Months,
      "Market Volume": row["Market Volume"],
      MoM: row.MoM,
      QoQ: row.QoQ,
    }));
    const headers = Object.keys(temp[0]).join(",");
    const rows = temp
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
    link.download = `${selectedProduct}_${selectedCountry}_${selectedForecastScenario}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
      <Box sx={{ mt: 1, padding: 2 }}>
        {/* Sidebar Filters */}
        <Box
          sx={{
            width: '900px',
            marginTop: 1,
            display: 'flex',
            flexDirection: 'row',
            padding: 1,
            position: 'sticky',
            top: 0,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f5f5f5',
            alignItems: 'center', // Ensure alignment with the box content
          }}
        >
          {/* Filters Title */}
          <Typography
            variant="subtitle2"
            sx={{
              position: 'absolute', // Position the text independently
              top: '-12px', // Move it upward to overlap the box
              left: '16px', // Adjust the horizontal position if needed
              backgroundColor: '#f5f5f5', // Match the box color
              padding: '0 8px', // Add padding for better spacing
              transform: 'translateY(-50%)', // Fine-tune vertical alignment
            }}
          >
            Filters
          </Typography>

          {/* Filters */}
          {['Product', 'Country', 'Forecast Scenario'].map((filter) => (
            <FormControl key={filter} sx={{ m: 2, width: '25ch' }}>
              <InputLabel id={filter} sx={{ textAlign: 'center' }}>
                {filter}
              </InputLabel>
              <Select
                labelId={filter}
                value={
                  filter === 'Product'
                    ? selectedProduct
                    : filter === 'Country'
                      ? selectedCountry
                      : selectedForecastScenario
                }
                label={filter}
                onChange={(event) =>
                  filter === 'Product'
                    ? handleSelectChange(setSelectedProduct, event.target.value)
                    : filter === 'Country'
                      ? handleSelectChange(setSelectedCountry, event.target.value)
                      : handleSelectChange(setSelectedForecastScenario, event.target.value)
                }
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
                <MenuItem value="" sx={{ textAlign: 'center' }}>
                  None
                </MenuItem>
                {getUniqueValues(filter).map((item, index) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          {/* Apply Button */}
          <Button
            sx={{
              m: 2,
              width: '20ch',
              height: '40px',
              backgroundColor: 'darkblue',
              color: 'white',
              '&:hover': {
                backgroundColor: '#0056b3',
              },
            }}
            onClick={applyFilters}
          >
            Apply
          </Button>
        </Box>



        {/* Content Area */}
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2, height: 500, width: 900, overflowY: 'auto' }}>
            {/* First Chart */}
            <Paper
              sx={{
                flex: 1,
                marginTop: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative', // To position text over the chart
              }}
            >
              <Typography variant="h6" gutterBottom align="center">
                Outliers
              </Typography>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                    x: { display: true },
                    y: {
                      title: {
                        display: true,
                        text: 'Market Volume',
                      },
                      ticks: {
                        callback: function (value) {
                          const max = Math.max(...chartData.datasets[0].data);
                          let format = '';
                          if (max >= 1_000 && max < 999_000) {
                            format = 'K';
                          } else if (max >= 999_000) {
                            format = 'M';
                          }
                          return `${(value / (format === 'K' ? 1_000 : (format === 'M' ? 1_000_000 : 1))).toFixed(2)}${format}`;
                        },
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        padding: 10, // Gap between x-axis and legend
                      },
                    },
                    annotation: {
                      annotations: {
                        line1: {
                          type: 'line',
                          yMin: 100,
                          yMax: 100,
                          borderColor: 'rgb(255, 99, 132)',
                          borderWidth: 2,
                          label: {
                            enabled: true,
                            content: 'Random line',
                            position: 'start',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                          },
                        },
                      },
                    },
                  },
                }}
              />
              {/* Custom text box over the chart */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  backgroundColor: 'rgba(255, 255, 255, 0)',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                Total Outliers: {outlierCount}
              </Box>
            </Paper>

            {/* Second Chart */}
            <Paper
              sx={{
                flex: 1,
                marginTop: 5,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative', // To position text over the chart
              }}
            >
              <Typography variant="h6" gutterBottom align="center">
                Trend Break
              </Typography>
              <Line
                data={chartData2}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                    x: { display: true,
                      grid: {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderDash: [5, 5], // Dotted lines for the grid
                      },
                     },
                    y: {
                      title: {
                        display: true,
                        text: 'Market Volume',
                      },
                      ticks: {
                        callback: function (value) {
                          const max = Math.max(...chartData2.datasets[0].data);
                          let format = '';
                          if (max >= 1_000 && max < 999_000) {
                            format = 'K';
                          } else if (max >= 999_000) {
                            format = 'M';
                          }
                          return `${(value / (format === 'K' ? 1_000 : (format === 'M' ? 1_000_000 : 1))).toFixed(2)}${format}`;
                        },
                      },
                      grid: {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderDash: [5, 5], // Dotted lines for the grid
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 10, // Gap between x-axis and legend
                      },
                    },
                  },
                }}
              />
              {/* Custom text box over the chart */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  backgroundColor: 'rgba(255, 255, 255, 0)',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
               Total Trend Breaks: {outlierTB}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>


      {/* Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 400, height: 600 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="subtitle1" gutterBottom textAlign={'center'}>
            Market Summary
          </Typography>
          <IconButton onClick={downloadCSV} sx={{ marginLeft: 1 }}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <TableContainer>
          <Table sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <TableHead sx={{ position: 'sticky', top: 0 }}>
              <TableRow sx={{ bgcolor: '#007bff' }}>
                <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#f5f5f5', fontWeight: 'bold', padding: 1.2, textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  Months
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#f5f5f5', fontWeight: 'bold', textAlign: 'center', padding: 1.2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  Market Volume
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#f5f5f5', fontWeight: 'bold', padding: 1.2, textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  Month on Month %
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#f5f5f5', fontWeight: 'bold', padding: 1.2, textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  Quarter on Quarter %
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryWithPercentages.map((row, index) => {
                const ismyOutlier = filteredOutlier.some(outlier => outlier.Months === row.Months);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: ismyOutlier ? 'rgba(255, 0, 0, 0.2)' : index % 2 === 0 ? '#f0f8ff' : 'white',
                    }}
                  >
                    <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', fontSize: '0.85rem', textAlign: 'center', padding: 1 }}>
                      {row.Months}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', fontSize: '0.85rem', textAlign: 'center', padding: 0.5 }}>
                      {row['Market Volume'].toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', fontSize: '0.85rem', textAlign: 'center', padding: 0.5 }}>
                      {row.MoM !== null ? `${row.MoM.toFixed(2)}%` : '-'}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', fontSize: '0.85rem', textAlign: 'center', padding: 0.5 }}>
                      {row.QoQ !== null ? `${row.QoQ.toFixed(2)}%` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};