import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Fusion from './Components/Fusion';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/Components/Fusion.js</code> and save to reload.
        </p>
      </header>
        <Fusion/>
    </div>
  );
}

export default App;
