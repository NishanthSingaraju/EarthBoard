import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Dashboard from './Dashboard';
import MLView from "./MLView"

function App() {
    return (
      <MLView></MLView>
    );
  }
  
  export default App;