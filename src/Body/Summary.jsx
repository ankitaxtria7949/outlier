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

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedForecastScenario, setSelectedForecastScenario] = useState(null);

  useEffect(() => {
    if (Array.isArray(Summary)) {
      setSelectedProduct(getUniqueValues('Product')[0] || null);
      setSelectedCountry(getUniqueValues('Country')[0] || null);
      setSelectedForecastScenario(getUniqueValues('Forecast Scenario')[0] || null);
    }
  }, [Summary]);

  if (!Array.isArray(Summary)) {
    return <Typography>Loading data...</Typography>;
  }

  const filteredSummary = Summary.filter((summary) => {
    const productMatch = selectedProduct ? selectedProduct === summary.Product : true;
    const countryMatch = selectedCountry ? selectedCountry === summary.Country : true;
    const forecastScenarioMatch = selectedForecastScenario
      ? selectedForecastScenario === summary['Forecast Scenario']
      : true;
    return productMatch && countryMatch && forecastScenarioMatch;
  });

  const filteredOutlier = Outliers.filter((outlier) => {
    const productMatch = selectedProduct ? selectedProduct === outlier.Product : true;
    const countryMatch = selectedCountry ? selectedCountry === outlier.Country : true;
    const forecastScenarioMatch = selectedForecastScenario
      ? selectedForecastScenario === outlier['Forecast Scenario']
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
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      {/* Sidebar Filters */}
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1, width: 250, position: 'sticky', top: 0 }}>
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
                variant={selectedProduct === item ? 'contained' : 'outlined'}
                onClick={() => handleSelectChange(setSelectedProduct, item)}
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
                variant={selectedCountry === item ? 'contained' : 'outlined'}
                onClick={() => handleSelectChange(setSelectedCountry, item)}
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
                variant={selectedForecastScenario === item ? 'contained' : 'outlined'}
                onClick={() => handleSelectChange(setSelectedForecastScenario, item)}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1, width: 1000, height: 430, overflowY: 'auto' }}>
        {/* First Chart */}
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
