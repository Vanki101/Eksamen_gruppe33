import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import EventCard from "./eventcard"
import CityEventsSection from "./cityeventssection"

export default function Home() {
  const [events, setEvents] = useState([])
  const API_KEY = import.meta.env.VITE_TM_API_KEY
  const festivalNames = ["music"]

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const keywordQuery = festivalNames.join("")
        const response = await fetch(
          https://app.ticketmaster.com/discovery/v2/events.json?keyword=${keywordQuery}&apikey=${API_KEY}&size=4
        )
        const data = await response.json()
        console.log(data)
        const fetchedEvents = data._embedded?.events || []
        setEvents(fetchedEvents)
        console.error("Failed to fetch events", err)
      } catch (err) {
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