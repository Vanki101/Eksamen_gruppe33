// Navbar-komponenten: Ansvarlig for navigasjonsfeltet øverst på siden.
// Viser logo, dynamiske lenker til kategorier, og en login/my account-lenke basert på innloggingsstatus.
// Har en state for å åpne/lukke menyen (for mobilvennlighet).
// Props: isLoggedIn og setIsLoggedIn for å kunne tilpasse login-knappen.
// Enkel toggling av menyen med hamburger-ikon.

import React, { useState, useEffect} from "react"

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navData = {
    logo: "BillettLyst",
    links: [
      { label: "Music", href: "/category/Music" },
      { label: "Sports", href: "/category/Sports" },
      { label: "Theater/Show", href: "/category/Theater" },
    ],
    login: {
      label: isLoggedIn ? "My Account" : "Log in",
      href: "/dashboard",
    },
  }

  return (
    <header className="navbar">
      <a href="/" className="navbar-logo">
        {navData.logo}
      </a>

      <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {navData.links.map((item, index) => (
          <a key={index} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="navbar-login">
        <a href={navData.login.href}>{navData.login.label}</a>
      </div>

      <div className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </header>
  )
}
