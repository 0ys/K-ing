import { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';

import Router from './Router';
import { initFirebase } from './service/initFirebase';
import GlobalStyle from './styles/GlobalStyle';
import theme from './styles/theme';

const App = () => {
  useEffect(() => {
    initFirebase();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router />
    </ThemeProvider>
  );
};

export default App;
