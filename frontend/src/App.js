import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'

function App() {
  const [getMessage, setGetMessage] = useState({})

  useEffect(()=>{
    axios.get('http://localhost:5000/time').then(response => {
      console.log("SUCCESS", response)
      setGetMessage(response)
    }).catch(error => {
      console.log(error)
    })

  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>The current time is {getMessage.data.time}.</p>
      </header>
    </div>
  );
}

export default App;