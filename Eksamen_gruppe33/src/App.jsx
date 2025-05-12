import { useState, useEffect } from "react"
import reactLogo from "./assets/react.svg"
import "./App.css"
import Navbar from "./components/navbar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./components/home"
import Dashboard from "./components/dashbord"
import EventDetail from "./components/event/[id]"
import SanityEventDetail from "./components/sanity-event/[id]"
import CategoryDetail from "./components/category/slug"
import "./styles/home.css"
import "./styles/dashboard.css"
import "./styles/eventdetail.css"
import "./styles/cityeventsection.css"
import "./styles/category.css"

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