// import React from "react";
// import { render } from "react-dom";
// import { App } from "./App";
// render(<App />, document.getElementById("root"));
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
