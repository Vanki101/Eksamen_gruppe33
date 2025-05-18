// Home-komponenten: Hovedsiden som viser utvalgte festivaler og arrangementer i ulike byer.
// Henter festival-arrangementer fra Ticketmaster API ved mount (useEffect).
// Viser en loader mens data lastes, ellers listes arrangementene med EventCard-komponenten.
// Nederst vises CityEventsSection for å utforske flere byer. 
// Bruker miljøvariabel for API-nøkkel og har støtte for å utvide festival-søk med flere navn.

import React, {useEffect, useState } from "react"
import { Link } from "react-router-dom"
import EventCard from "./eventcard"
import CityEventsSection from "./cityeventsection"

export default function Home() {
  const [events, setEvents] = useState([])
  const API_KEY = import.meta.env.VITE_TM_API_KEY
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  useEffect(() => {
    const fetchEvents = async () => {
      const festivalNames = [
        "Findings",
        "Neon",
        "Skeikampenfestivalen",
        "Tons of Rock",
      ]

      try {
        const allEvents = []

        for (const name of festivalNames) {
          const response = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(
              name
            )}&apikey=${API_KEY}&locale=*&size=1`
          )
          if (!response.ok) continue

          const data = await response.json()
          const event = data._embedded?.events?.[0]
          if (event) {
            allEvents.push(event)
          }
          await sleep(500)
        }

        setEvents(allEvents)
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
