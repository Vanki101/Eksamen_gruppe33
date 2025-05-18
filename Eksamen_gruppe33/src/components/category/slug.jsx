// Importerer nødvendige hooks og funksjoner fra React og react-router-dom
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
// Importerer sanity-klienten for å hente data fra backend
import client from "../../../sanityclient"

// Hovedkomponent som viser detaljer for en valgt kategori
export default function CategoryDetail() {
  // Henter 'slug' fra URL-parameterne
  const { slug } = useParams()
  // Definerer state-variabler for attraksjoner, events, venues, ønskeliste, søk og filtre
  const [attractions, setAttractions] = useState([])
  const [events, setEvents] = useState([])
  const [venues, setVenues] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    date: "",
    country: "",
    city: "",
  })

  // Henter API-nøkkelen fra miljøvariabler
  const API_KEY = import.meta.env.VITE_TM_API_KEY

  // useEffect brukes for å hente data når komponenten rendres eller når 'slug' eller 'search' endres
  useEffect(() => {
    // Definerer en asynkron funksjon for å hente data
    const fetchData = async () => {
      try {
        // Bruker enten søkefelt, slug eller fallback til 'music' som søkeord
        const query = search || slug || "music"
        // Henter forslag fra Ticketmaster API
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/suggest?apikey=${API_KEY}&keyword=${query}&locale=*`
        )
        const data = await response.json()
        // Oppdaterer state med data fra API-et
        setAttractions(data._embedded?.attractions || [])
        setEvents(data._embedded?.events || [])
        setVenues(data._embedded?.venues || [])

        // Sjekker om bruker er logget inn og henter ønskelisten fra Sanity hvis det er tilfelle
        const loggedInUser = JSON.parse(localStorage.getItem("user"))
        if (loggedInUser?._id) {
          const userRes = await client.fetch(
            `*[_type == "user" && _id == $id][0]`,
            { id: loggedInUser._id }
          )
          setWishlist(userRes?.wishlist || [])
        }
      } catch (err) {
        // Logger feil hvis noe går galt
        console.error("Failed to fetch data", err)
      }
    }

    // Kaller fetchData-funksjonen
    fetchData()
  }, [slug, search])

  // Funksjon for å legge til eller fjerne et event fra ønskelisten
  const toggleWishlist = async (eventId) => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user?._id) return alert("You must be logged in to add to wishlist")

    // Sjekker om eventet allerede er i ønskelisten
    const isInWishlist = wishlist.includes(eventId)
    // Oppdaterer ønskelisten basert på om eventet var der fra før eller ikke
    const updatedWishlist = isInWishlist
      ? wishlist.filter((id) => id !== eventId)
      : [...wishlist, eventId]

    try {
      // Oppdaterer ønskelisten i Sanity-databasen
      await client.patch(user._id).set({ wishlist: updatedWishlist }).commit()
      setWishlist(updatedWishlist)
    } catch (err) {
      // Logger feil hvis oppdateringen feiler
      console.error("Failed to update wishlist", err)
    }
  }

  // Funksjon for å filtrere data basert på valgte filtre
  const handleFilter = async () => {
    const { date, country, city } = filters
    let queryParams = []

    // Legger til relevante parametere i API-kallet
    if (slug) queryParams.push(`classificationName=${slug}`)
    if (country) queryParams.push(`countryCode=${country}`)
    if (city) queryParams.push(`city=${city}`)
    if (date) queryParams.push(`startDateTime=${new Date(date).toISOString()}`)

    // Begrens antall resultater for ytelse
    queryParams.push("size=5")
    const query = queryParams.join("&")

    try {
      // Henter events fra API med valgte filtre
      const eventsRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&${query}&locale=*`
      )
      const eventsData = await eventsRes.json()
      setEvents(eventsData._embedded?.events || [])

      // Henter venues fra API med valgte filtre
      const venuesRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/venues.json?apikey=${API_KEY}&${query}&locale=*`
      )
      const venuesData = await venuesRes.json()
      setVenues(venuesData._embedded?.venues || [])

      // Henter attraksjoner fra API med valgte filtre
      const attractionsRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&${query}&locale=*`
      )
      const attractionsData = await attractionsRes.json()
      setAttractions(attractionsData._embedded?.attractions || [])
    } catch (err) {
      // Logger feil hvis noe går galt med filtreringen
      console.error("Failed to fetch filtered data", err)
    }
  }

  // Returnerer JSX for hele kategorisiden
  return (
    <div className="category-page">
      {/* Viser tittelen for kategorien */}
      <h1 className="category-title">{slug.toUpperCase()}</h1>

      {/* Filterseksjon for å velge dato, land og by */}
      <div className="filter-container">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        >
          <option value="">Select Country</option>
          <option value="US">USA</option>
          <option value="NO">Norway</option>
        </select>
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          <option value="">Select City</option>
          <option value="Oslo">Oslo</option>
          <option value="New York">New York</option>
        </select>
        <button onClick={handleFilter}>Filter</button>
      </div>

      {/* Søkefelt for å søke etter events, attraksjoner eller venues */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Søk etter event, attraksjon eller spillested"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>Søk</button>
      </div>

      {/* Seksjoner for attraksjoner, events og venues */}
      <Section
        title="Attraksjoner"
        data={attractions}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
      <Section
        title="Events"
        data={events}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
      <Section
        title="Venues"
        data={venues}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    </div>
  )
}

// Egen komponent for å vise en seksjon (attraksjoner, events eller venues)
function Section({ title, data, wishlist, toggleWishlist }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      <div className="card-grid">
        {/* Mapper gjennom data og viser hvert element som et kort */}
        {data.map((item) => (
          <div key={item.id} className="card">
            <img
              src={item.images?.[0]?.url || "/placeholder.jpg"}
              alt={item.name}
              className="card-image"
            />
            <div className="card-details">
              <p className="card-title">{item.name}</p>
              {/* Viser dato og tid hvis det finnes */}
              {item.dates?.start && (
                <>
                  <p>{item.dates.start.localDate}</p>
                  <p>{item.dates.start.localTime}</p>
                </>
              )}
              {/* Viser stedinformasjon hvis det finnes */}
              {item._embedded?.venues?.[0] && (
                <>
                  <p>{item._embedded.venues[0].country?.name}</p>
                  <p>{item._embedded.venues[0].city?.name}</p>
                  <p>{item._embedded.venues[0].name}</p>
                </>
              )}
              {/* Hjerteikon for å legge til/fjerne fra ønskeliste */}
              <span
                className={`heart ${wishlist.includes(item.id) ? "saved" : ""}`}
                onClick={() => toggleWishlist(item.id)}
              >
                {wishlist.includes(item.id) ? "♥" : "♡"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
