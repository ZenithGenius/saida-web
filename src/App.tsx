import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Map from './components/Map/Map';

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
      <Map />
    </ThemeProvider>
  );
};

export default App;
