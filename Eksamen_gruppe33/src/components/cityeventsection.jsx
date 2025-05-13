// CityEventsSection-komponenten: Henter og viser arrangementer for valgte byer.
// Bruker Ticketmaster API og lar brukeren velge mellom flere byer.
// Når by endres, hentes nye arrangementer og vises i et grid. 
// Bruker useEffect for å hente data når 'city'-staten endres, og håndterer API-nøkkel via miljøvariabel.

import React, { useEffect, useState } from "react"

export default function CityEventsSection() {
  const API_KEY = import.meta.env.VITE_TM_API_KEY
  const [city, setCity] = useState("Oslo")
  const [events, setEvents] = useState([])

  const cities = ["Oslo", "Stockholm", "Berlin", "London", "Paris"]

  useEffect(() => {
    const fetchCityEvents = async () => {
      try {
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&size=10&apikey=${API_KEY}&locale=*`
        )
        const data = await response.json()
        const cityEvents = data._embedded?.events || []
        setEvents(cityEvents)
      } catch (err) {
        console.error("Failed to fetch city events", err)
      }
    }

    fetchCityEvents()
  }, [city])

  return (
    <section className="city-events-section">
      <h2 className="heading">Hva skjer i {city}</h2>
      <div className="city-buttons">
        {cities.map((c) => (
          <button
            key={c}
            className={`city-button ${city === c ? "active" : ""}`}
            onClick={() => setCity(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <img
              src={event.images?.[0]?.url}
              alt={event.name}
              className="event-image"
            />
            <h3 className="event-name">{event.name}</h3>
            <p className="event-location">
              {event.dates?.start?.localDate} <br />
              {event._embedded?.venues?.[0]?.country?.name},{" "}
              {event._embedded?.venues?.[0]?.city?.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
