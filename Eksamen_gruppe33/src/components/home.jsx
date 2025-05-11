// Home-komponenten: Hovedsiden som viser utvalgte festivaler og arrangementer i ulike byer.
// Henter festival-arrangementer fra Ticketmaster API ved mount (useEffect).
// Viser en loader mens data lastes, ellers listes arrangementene med EventCard-komponenten.
// Nederst vises CityEventsSection for å utforske flere byer. 
// Bruker miljøvariabel for API-nøkkel og har støtte for å utvide festival-søk med flere navn.

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import EventCard from "./eventcard"
import CityEventsSection from "./cityeventsection"

export default function Home() {
  const [events, setEvents] = useState([])
  const API_KEY = import.meta.env.VITE_TM_API_KEY
  const festivalNames = ["music"]

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const keywordQuery = festivalNames.join("")
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${keywordQuery}&apikey=${API_KEY}&size=4`
        )
        const data = await response.json()
        console.log(data)
        const fetchedEvents = data._embedded?.events || []
        setEvents(fetchedEvents)
      } catch (err) {
        console.error("Failed to fetch events", err)
      }
    }

    fetchEvents()
  }, [])

  return (
    <main className="home-container">
      <header>
        <h1 className="heading">Utvalgte Festivaler</h1>
      </header>

      {events.length === 0 ? (
        <p className="loading">Laster inn...</p>
      ) : (
        <section className="card-grid" aria-label="Festival events">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
      <CityEventsSection />
    </main>
  )
}
