// Importerer nødvendige hooks og komponenter fra React og react-router-dom
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
// Importerer ArtistCard-komponenten for å vise artister tilknyttet eventet
import ArtistCard from "../artistcard"

// Hovedkomponent for å vise detaljer om et event hentet fra Ticketmaster (eller Sanity)
export default function SanityEventDetail() {
  // Henter event-ID fra URL-parameterne
  const { id } = useParams()
  // State for å lagre event-data og loading-status
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  // Henter API-nøkkel fra miljøvariabler
  const API_KEY = import.meta.env.VITE_TM_API_KEY

  // useEffect brukes for å hente event-data når komponenten rendres eller når id endres
  useEffect(() => {
    // Definerer en asynkron funksjon for å hente event-data fra Ticketmaster API
    const fetchEvent = async () => {
      try {
        // Henter detaljer om eventet basert på ID fra API-et
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}`
        )
        const data = await response.json()
        setEvent(data) // Oppdaterer state med event-data
      } catch (err) {
        // Logger feil hvis noe går galt under henting av data
        console.error("Failed to fetch event details", err)
      } finally {
        setLoading(false) // Setter loading til false uansett utfall
      }
    }

    // Kaller funksjonen for å hente data
    fetchEvent()
  }, [id])

  // Logger eventet til konsollen for debugging og utvikling
  console.log(event)

  // Returnerer JSX for å vise event-detaljer
  return (
    <main className="event-container">
      {/* Viser en loading-tekst mens data lastes inn */}
      {loading ? (
        <p className="loading">Laster inn...</p>
      ) : event ? (
        <>
          {/* Viser eventets navn som tittel */}
          <h1 className="event-title">{event.name}</h1>

          {/* Seksjon for å vise sjanger/genre */}
          <section className="genre-section">
            <h2 className="section-heading">Sjanger:</h2>
            <div className="genre-tags">
              {/* Mapper gjennom alle klassifiseringer og viser sjanger */}
              {(event.classifications || []).map((c, i) => (
                <span key={i} className="genre-badge">
                  {c.genre?.name || "Undefined"}
                </span>
              ))}
            </div>
          </section>

          {/* Tekst for å oppfordre til å følge på sosiale medier */}
          <p className="social-text">Følg oss på sosiale medier:</p>

          {/* Seksjon for billettinformasjon og kjøpsmuligheter */}
          <section className="ticket-section">
            <h2 className="section-heading">Festivalpass:</h2>
            <div className="ticket-card">
              {/* Viser bilde for eventet */}
              <img
                src={event.images?.[0]?.url}
                alt={event.name}
                className="ticket-image"
              />
              {/* Viser navn på eventet */}
              <h3 className="ticket-name">{event.name}</h3>
              {/* Viser navn på venue */}
              <p className="ticket-info">
                <strong>Name:</strong>{" "}
                {event._embedded?.venues?.[0]?.name || "Ukjent"}
              </p>
              {/* Viser dato for eventet */}
              <p className="ticket-info">
                <strong>Date:</strong> {event.dates?.start?.localDate || "TBA"}
              </p>
              {/* Viser sted (by og land) */}
              <p className="ticket-info">
                <strong>Location:</strong>{" "}
                {event._embedded?.venues?.[0]?.city?.name || "New York"},{" "}
                {event._embedded?.venues?.[0]?.country?.name || "USA"}
              </p>
              {/* Knapper for kjøp og ønskeliste */}
              <div className="button-group">
                <button className="buy-btn">Kjøp</button>
                <button className="wishlist-btn">Legg til i ønskeliste</button>
              </div>
            </div>
          </section>

          {/* Seksjon for å vise artister hvis det finnes noen tilknyttet eventet */}
          {event._embedded?.attractions?.length > 0 && (
            <section className="artist-section">
              <h2 className="section-heading">Artister:</h2>
              <div className="artist-grid">
                {/* Mapper gjennom alle artister og viser ArtistCard for hver */}
                {event._embedded.attractions.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        // Hvis eventet ikke finnes, vis feilmelding
        <p className="loading">Fant ikke arrangementet.</p>
      )}
    </main>
  )
}
