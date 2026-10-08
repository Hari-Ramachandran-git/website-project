import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, HashRouter } from 'react-router-dom';
const Router=window.location.protocol==='file:'?HashRouter:BrowserRouter;
import './styles.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><Router><App /></Router></React.StrictMode>);
