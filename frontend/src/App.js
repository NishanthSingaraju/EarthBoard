import React from 'react';
import { render } from 'react-dom';
import { Routes, Route, Outlet, Link } from "react-router-dom";

import Dashboard from './Dashboard';
import MLView from "./MLView"

function App() {
    return (
       <Routes>
         <Route path="/" element={<Dashboard/>}></Route>
         <Route path="ml" element={<MLView/>}> </Route>
       </Routes>
    );
  }
  
  export default App;