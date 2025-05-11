// components/EventCard.jsx
import React from "react"
import { Link } from "react-router-dom"

export default function EventCard({ event, sanityevent = false }) {
  return (
    <article className="event-card">
      <figure>
        <img
          src={event.images?.[0]?.url}
          alt={event.name}
          className="event-image"
        />
        <figcaption className="event-name">{event.name}</figcaption>
      </figure>
      <Link
        to={/${sanityevent ? "sanity-event" : "event"}/${event.id}}
        className="event-button"
        aria-label={View details for ${event.name}}
      >
        Les mer om {event.name}
      </Link>
    </article>
  )
}