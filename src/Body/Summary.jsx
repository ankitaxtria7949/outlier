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
 
 
  const trendBreakData = filteredSummary.map((summary) =>
    summary['Trend Break Value'] === -1 ? null : summary['Trend Break Value']
  );
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
 
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
      <Box sx={{ mt: 1, padding: 2 }}>
        {/* Sidebar Filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            padding: 1,
            position: 'sticky',
            top: 0,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="subtitle2" gutterTop textAlign={'center'}>
            Filters
          </Typography>
 
          {/* Filters */}
          {['Product', 'Country', 'Forecast Scenario'].map((filter) => (
            <FormControl key={filter} sx={{ m: 2, width: '25ch' }}>
              <InputLabel id={filter} sx={{ textAlign: 'center' }}>{filter}</InputLabel>
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
                <MenuItem value="" sx={{ textAlign: 'center' }}>None</MenuItem>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2, padding: 1, width: 800, overflowY: 'auto' }}>
            {/* First Chart */}
            <Paper
              sx={{
                flex: 1,
 
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle1" gutterBottom align="center">
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
                      position: 'bottom',
                      labels: {
                        padding: 10, // Gap between x-axis and legend
                      },
                    },
                  },
                }}
              />
            </Paper>
 
            {/* Second Chart */}
            <Paper
              sx={{
                flex: 1,
                padding: 2,
                marginTop: 5,
                display: 'flex',
                flexDirection: 'column',
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
                    x: { display: true },
                    y: {
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
            </Paper>
          </Box>
        </Box>
      </Box>
 
      {/* Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 400, height: 600 }}>
        <Typography variant="subtitle1" gutterBottom textAlign={'center'}>
          Market Summary
        </Typography>
        <TableContainer>
          <Table sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <TableHead sx={{ position: 'sticky', top: 0 }}>
              <TableRow sx={{ bgcolor: '#007bff' }}>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', padding: 1.2, textAlign: 'center' }}>
                  Months
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', textAlign: 'center', padding: 1.2 }}>
                  Market Volume
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', padding: 1.2, textAlign: 'center' }}>
                  Month on Month %
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', padding: 1.2, textAlign: 'center' }}>
                  Quarter on Quarter %
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryWithPercentages.map((row, index) => {
                const ismyOutlier = filteredOutlier.some(outlier => outlier.Months === row.Months);
 
                // Check if this row is an outlier
               
 
                return (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: ismyOutlier ? 'rgba(255, 0, 0, 0.2)' : index % 2 === 0 ? '#f0f8ff' : 'white', // Highlight outlier rows with yellow
                    }}
                  >
                    <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', fontSize: '0.85rem', textAlign: 'center', padding: 1 }}>
                      {row.Months}
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)', fontSize: '0.85rem', textAlign: 'center', padding: 0.5 }}>
                      {row['Market Volume'].toFixed(2)}
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