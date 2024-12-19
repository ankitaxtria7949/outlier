import { React, useContext, useState, useEffect } from 'react';
import { MyContext } from './Context';
import { Line } from 'react-chartjs-2';
import { Box, MenuItem, Select, FormControl, InputLabel, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Summary = () => {
  const { Outliers } = useContext(MyContext);

  useEffect(() => {
    console.log(Outliers);
  }, [Outliers]);

  const { Summary } = useContext(MyContext);
  useEffect(() => {
    console.log(Summary);
  }, [Summary]);

  // State for filters, initially set to the first product, country, and forecast scenario in the data
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedForecastScenario, setSelectedForecastScenario] = useState('');

  // Get unique values for filters
  const getUniqueValues = (key) => {
    return Array.isArray(Summary) ? [...new Set(Summary.map((summary) => summary[key]))] : [];
  };

  // Set initial state for selectedProduct, selectedCountry, and selectedForecastScenario when the component mounts
  useEffect(() => {
    if (Array.isArray(Summary)) {
      const initialProduct = getUniqueValues('Product')[0] || '';
      const initialCountry = getUniqueValues('Country')[0] || '';
      const initialForecastScenario = getUniqueValues('Forecast Scenario')[0] || '';
      setSelectedProduct(initialProduct);
      setSelectedCountry(initialCountry);
      setSelectedForecastScenario(initialForecastScenario);
    }
  }, [Summary]);

  // If Summary is not available, return an empty view or handle the loading state
  if (!Array.isArray(Summary)) {
    return <Typography>Loading data...</Typography>;
  }

  // Filter data based on selected Product, Country, and Forecast Scenario
  const filteredSummary = Summary.filter((summary) => {
    const productMatch = selectedProduct ? summary.Product === selectedProduct : true;
    const countryMatch = selectedCountry ? summary.Country === selectedCountry : true;
    const forecastScenarioMatch = selectedForecastScenario ? summary['Forecast Scenario'] === selectedForecastScenario : true;
    return productMatch && countryMatch && forecastScenarioMatch;
  });

  const filteredOutlier = Outliers.filter((Outliers) => {
    const productMatch = selectedProduct ? Outliers.Product === selectedProduct : true;
    const countryMatch = selectedCountry ? Outliers.Country === selectedCountry : true;
    const forecastScenarioMatch = selectedForecastScenario ? Outliers['Forecast Scenario'] === selectedForecastScenario : true;
    return productMatch && countryMatch && forecastScenarioMatch;
  });

  // Prepare data for the chart
  const marketVolumeData = filteredSummary.map((summary) => summary['Market Volume']);
  const UCL = filteredSummary.map((summary) =>
    summary['UCL'] === -1 ? null : summary['UCL']
  );
  const LCL = filteredSummary.map((summary) =>
    summary['LCL'] === -1 ? null : summary['LCL']
  );
  const outlierData = filteredSummary.map((summary) => {
    const isOutlier = filteredOutlier.some(
      (outlier) => outlier.Months === summary.Months
    );
    return isOutlier ? summary['Market Volume'] : null;
  });

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
        data: UCL,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        fill: false,
        borderDash: [5, 5],
      },
      {
        label: 'Lower Control Limit (LCL)',
        data: LCL,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        fill: false,
        borderDash: [5, 5],
      },
      // Add dataset for outliers
      {
        label: 'Outliers',
        data: outlierData,
        borderColor: '#f44336',
        backgroundColor: '#f44336',
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 0,
        showLine: false, // Display points only
      },
    ],
  };

  // Handle filter changes
  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleForecastScenarioChange = (event) => {
    setSelectedForecastScenario(event.target.value);
  };

  // Calculate MoM and QoQ percentages
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
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Overview
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Product</InputLabel>
          <Select value={selectedProduct} onChange={handleProductChange} label="Product">
            {getUniqueValues('Product').map((product, index) => (
              <MenuItem key={index} value={product}>
                {product}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Country</InputLabel>
          <Select value={selectedCountry} onChange={handleCountryChange} label="Country">
            {getUniqueValues('Country').map((country, index) => (
              <MenuItem key={index} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Forecast Scenario</InputLabel>
          <Select value={selectedForecastScenario} onChange={handleForecastScenarioChange} label="Forecast Scenario">
            {getUniqueValues('Forecast Scenario').map((scenario, index) => (
              <MenuItem key={index} value={scenario}>
                {scenario}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 3, height: 400 }}>
          <Line data={chartData} options={{ responsive: true }} />
        </Box>

        <Box sx={{ flex: 2, maxHeight: 300, overflow: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>Months</TableCell>
                  <TableCell sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>Market Volume</TableCell>
                  <TableCell sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>MoM %</TableCell>
                  <TableCell sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>QoQ %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summaryWithPercentages.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.Months}</TableCell>
                    <TableCell>{row['Market Volume']}</TableCell>
                    <TableCell>{row.MoM !== null ? `${row.MoM.toFixed(2)}%` : '-'}</TableCell>
                    <TableCell>{row.QoQ !== null ? `${row.QoQ.toFixed(2)}%` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};
