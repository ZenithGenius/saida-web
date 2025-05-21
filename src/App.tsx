import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Map from './components/Map/Map';
import { ResponsiveProvider } from './utils/ResponsiveContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ResponsiveProvider>
        <Map />
      </ResponsiveProvider>
    </ThemeProvider>
  );
};

export default App;
