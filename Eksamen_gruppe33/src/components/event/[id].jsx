import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ArtistCard from "../artistcard"

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const API_KEY = import.meta.env.VITE_TM_API_KEY

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}`
        )
        const data = await response.json()
        setEvent(data)
      } catch (err) {
        console.error("Failed to fetch event details", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  console.log(event)

  return (
    <main className="event-container">
      {loading ? (
        <p className="loading">Laster inn...</p>
      ) : event ? (
        <>
          <h1 className="event-title">{event.name}</h1>

          <section className="genre-section">
            <h2 className="section-heading">Sjanger:</h2>
            <div className="genre-tags">
              {(event.classifications || []).map((c, i) => (
                <span key={i} className="genre-badge">
                  {c.genre?.name || "Undefined"}
                </span>
              ))}
            </div>
          </section>

          <p className="social-text">Følg oss på sosiale medier:</p>

          <section className="ticket-section">
            <h2 className="section-heading">Festivalpass:</h2>
            <div className="ticket-card">
              <img
                src={event.images?.[0]?.url}
                alt={event.name}
                className="ticket-image"
              />
              <h3 className="ticket-name">{event.name}</h3>
              <p className="ticket-info">
                <strong>Name:</strong>{" "}
                {event._embedded?.venues?.[0]?.name || "Ukjent"}
              </p>
              <p className="ticket-info">
                <strong>Date:</strong> {event.dates?.start?.localDate || "TBA"}
              </p>
              <p className="ticket-info">
                <strong>Location:</strong>{" "}
                {event._embedded?.venues?.[0]?.city?.name || "New York"},{" "}
                {event._embedded?.venues?.[0]?.country?.name || "USA"}
              </p>
              <div className="button-group">
                <button className="buy-btn">Kjøp</button>
                <button className="wishlist-btn">Legg til i ønskeliste</button>
              </div>
            </div>
          </section>

          {event._embedded?.attractions?.length > 0 && (
            <section className="artist-section">
              <h2 className="section-heading">Artister:</h2>
              <div className="artist-grid">
                {event._embedded.attractions.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <p className="loading">Fant ikke arrangementet.</p>
      )}
    </main>
  )
}
