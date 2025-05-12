import React, {useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import client from "../../../sanityclient"

export default function CategoryDetail() {
  const { slug } = useParams()
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

  const API_KEY = import.meta.env.VITE_TM_API_KEY

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = search || slug || "music"
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/suggest?apikey=${API_KEY}&keyword=${query}`
        )
        const data = await response.json()
        setAttractions(data._embedded?.attractions || [])
        setEvents(data._embedded?.events || [])
        setVenues(data._embedded?.venues || [])

        const loggedInUser = JSON.parse(localStorage.getItem("user"))
        if (loggedInUser?._id) {
          const userRes = await client.fetch(
            `*[_type == "user" && _id == $id][0]`,
            { id: loggedInUser._id }
          )
          setWishlist(userRes?.wishlist || [])
        }
      } catch (err) {
        console.error("Failed to fetch data", err)
      }
    }

    fetchData()
  }, [slug, search])

  const toggleWishlist = async (eventId) => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user?._id) return alert("You must be logged in to add to wishlist")

    const isInWishlist = wishlist.includes(eventId)
    const updatedWishlist = isInWishlist
      ? wishlist.filter((id) => id !== eventId)
      : [...wishlist, eventId]

    try {
      await client.patch(user._id).set({ wishlist: updatedWishlist }).commit()
      setWishlist(updatedWishlist)
    } catch (err) {
      console.error("Failed to update wishlist", err)
    }
  }

  const handleFilter = async () => {
    const { date, country, city } = filters
    let queryParams = []

    if (slug) queryParams.push(`keyword=${slug}`)
    if (country) queryParams.push(`countryCode=${country}`)
    if (city) queryParams.push(`city=${city}`)
    if (date) queryParams.push(`startDateTime=${new Date(date).toISOString()}`)

    queryParams.push("size=5")
    const query = queryParams.join("&")

    try {
      const eventsRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&${query}`
      )
      const eventsData = await eventsRes.json()
      setEvents(eventsData._embedded?.events || [])

      const venuesRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/venues.json?apikey=${API_KEY}&${query}`
      )
      const venuesData = await venuesRes.json()
      setVenues(venuesData._embedded?.venues || [])

      const attractionsRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&${query}`
      )
      const attractionsData = await attractionsRes.json()
      setAttractions(attractionsData._embedded?.attractions || [])
    } catch (err) {
      console.error("Failed to fetch filtered data", err)
    }
  }

  return (
    <div className="category-page">
      <h1 className="category-title">{slug.toUpperCase()}</h1>

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

      <div className="search-bar">
        <input
          type="text"
          placeholder="Søk etter event, attraksjon eller spillested"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>Søk</button>
      </div>

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

function Section({ title, data, wishlist, toggleWishlist }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      <div className="card-grid">
        {data.map((item) => (
          <div key={item.id} className="card">
            <img
              src={item.images?.[0]?.url || "/placeholder.jpg"}
              alt={item.name}
              className="card-image"
            />
            <div className="card-details">
              <p className="card-title">{item.name}</p>
              {item.dates?.start && (
                <>
                  <p>{item.dates.start.localDate}</p>
                  <p>{item.dates.start.localTime}</p>
                </>
              )}
              {item._embedded?.venues?.[0] && (
                <>
                  <p>{item._embedded.venues[0].country?.name}</p>
                  <p>{item._embedded.venues[0].city?.name}</p>
                  <p>{item._embedded.venues[0].name}</p>
                </>
              )}
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
