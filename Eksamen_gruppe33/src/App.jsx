import { useState, useEffect } from "react"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import Navbar from "./components/navbar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./components/home"
import Dashboard from "./components/dashboard"
import "./styles/home.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)
  }, [])

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/sanity-event/:id" element={<SanityEventDetail />} />
          <Route path="/category/:slug" element={<CategoryDetail />} />
        </Routes>
      </Router>
    </>
  )
}

export default App