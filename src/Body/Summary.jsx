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

  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [selectedForecastScenario, setSelectedForecastScenario] = useState([]);

  useEffect(() => {
    if (Array.isArray(Summary)) {
      const uniqueProducts = getUniqueValues('Product');
      const uniqueCountries = getUniqueValues('Country');
      const uniqueForecastScenarios = getUniqueValues('Forecast Scenario');
      
      setSelectedProduct(uniqueProducts.length > 0 ? [uniqueProducts[0]] : []);
      setSelectedCountry(uniqueCountries.length > 0 ? [uniqueCountries[0]] : []);
      setSelectedForecastScenario(uniqueForecastScenarios.length > 0 ? [uniqueForecastScenarios[0]] : []);
    }
  }, [Summary]);

  const toggleSelection = (setter, selectedValues, value) => {
    setter([value]); // Select only one option
  };

  if (!Array.isArray(Summary)) {
    return <Typography>Loading data...</Typography>;
  }

  const filteredSummary = Summary.filter((summary) => {
    const productMatch = selectedProduct.length
      ? selectedProduct.includes(summary.Product)
      : true;
    const countryMatch = selectedCountry.length
      ? selectedCountry.includes(summary.Country)
      : true;
    const forecastScenarioMatch = selectedForecastScenario.length
      ? selectedForecastScenario.includes(summary['Forecast Scenario'])
      : true;
    return productMatch && countryMatch && forecastScenarioMatch;
  });

  const filteredOutlier = Outliers.filter((Outliers) => {
    const productMatch = selectedProduct.length
      ? selectedProduct.includes(Outliers.Product)
      : true;
    const countryMatch = selectedCountry.length
      ? selectedCountry.includes(Outliers.Country)
      : true;
    const forecastScenarioMatch = selectedForecastScenario.length
      ? selectedForecastScenario.includes(Outliers['Forecast Scenario'])
      : true;
    return productMatch && countryMatch && forecastScenarioMatch;
  });

  const marketVolumeData = filteredSummary.map((summary) => summary['Market Volume']);
  const ZUCL = filteredSummary.map((summary) =>
    summary['ZUCL'] === -1 ? null : summary['ZUCL']
  );
  const ZLCL = filteredSummary.map((summary) =>
    summary['ZLCL'] === -1 ? null : summary['ZLCL']
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
        label: 'Upper Control Limit (ZUCL)',
        data: ZUCL,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        fill: false,
        borderDash: [5, 5],
      },
      {
        label: 'Lower Control Limit (ZLCL)',
        data: ZLCL,
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

  const handleMultiSelectChange = (setter, label) => (event) => {
    const {
      target: { value },
    } = event;
    // If 'All' is selected, select all unique values
    if (value.includes('All')) {
      setter(getUniqueValues(label));
    } else {
      setter(typeof value === 'string' ? value.split(',') : value);
    }
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

  // Toggle selection logic
  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      {/* Sidebar Filters */}
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1, width: 250 }}>
        <Typography variant="h6" gutterBottom textAlign={'center'}>
          Filters
        </Typography>

        {/* Product Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, boxShadow: 2, padding: 1 }}>
          <Typography variant="body1" sx={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
            Product
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {getUniqueValues('Product').map((item, index) => (
              <Button
                key={index}
                variant={selectedProduct.includes(item) ? 'contained' : 'outlined'}
                onClick={() => toggleSelection(setSelectedProduct, selectedProduct, item)}
                sx={{
                  width: '100%',
                  maxWidth: 'none',
                  fontSize: 10,
                  padding: 1,
                  minWidth: '120px',
                }}
              >
                {item}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Country Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, boxShadow: 2, padding: 1 }}>
          <Typography variant="body1" sx={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
            Country
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {getUniqueValues('Country').map((item, index) => (
              <Button
                key={index}
                variant={selectedCountry.includes(item) ? 'contained' : 'outlined'}
                onClick={() => toggleSelection(setSelectedCountry, selectedCountry, item)}
                sx={{
                  width: '100%',
                  maxWidth: 'none',
                  fontSize: 10,
                  padding: 1,
                  minWidth: '120px',
                }}
              >
                {item}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Forecast Scenario Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, boxShadow: 2, padding: 1 }}>
          <Typography variant="body1" sx={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
            Forecast Scenario
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {getUniqueValues('Forecast Scenario').map((item, index) => (
              <Button
                key={index}
                variant={selectedForecastScenario.includes(item) ? 'contained' : 'outlined'}
                onClick={() => toggleSelection(setSelectedForecastScenario, selectedForecastScenario, item)}
                sx={{
                  width: '100%',
                  maxWidth: 'none',
                  fontSize: 10,
                  padding: 1,
                  minWidth: '120px',
                }}
              >
                {item}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1, width: 800, height: 430 }}>
        {/* Chart */}
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
            Outliers
          </Typography>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              scales: { x: { display: true } },
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

      {/* Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1, width: 400, height: 500 }}>
        <Typography variant="h6" gutterBottom textAlign={'center'}>
          Market Summary
        </Typography>
        <TableContainer>
          <Table sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <TableHead sx={{ position: 'sticky', top: 0 }}>
              <TableRow sx={{ bgcolor: '#007bff' }}>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    padding: 1.2,
                    textAlign: 'center',
                  }}
                >
                  Months
                </TableCell>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    textAlign: 'center',
                    padding: 1.2,
                  }}
                >
                  Market Volume
                </TableCell>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    padding: 1.2,
                    textAlign: 'center',
                  }}
                >
                  MoM %
                </TableCell>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    padding: 1.2,
                    textAlign: 'center',
                  }}
                >
                  QoQ %
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryWithPercentages.map((row, index) => (
                <TableRow key={index}>
                  <TableCell
                    sx={{
                      borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      padding: 1,
                    }}
                  >
                    {row.Months}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      padding: 0.5,
                    }}
                  >
                    {row['Market Volume'].toFixed(2)}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      padding: 0.5,
                    }}
                  >
                    {row.MoM !== null ? `${row.MoM.toFixed(2)}%` : '-'}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      padding: 0.5,
                    }}
                  >
                    {row.QoQ !== null ? `${row.QoQ.toFixed(2)}%` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

