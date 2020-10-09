import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import OtherPage from './OtherPage'
import Fib from './Fib'
import './App.css'

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <Link to="/">Home</Link>
                    <Link to="/other">OtherPage</Link>
                </header>
                <div>
                    <Route exact path="/" component={Fib} />
                    <Route path="/other" component={OtherPage} />
                </div>
            </div>
        </Router>
    )
}

export default App
