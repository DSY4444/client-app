import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from "@mui/material/styles";
import theme from './assets/theme';


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
     <ThemeProvider theme={theme}> 
    <App />
    </ThemeProvider>          
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);


reportWebVitals();