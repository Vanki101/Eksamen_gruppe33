// Importerer nødvendige hooks og komponenter fra React
import React, { useState, useEffect } from "react"
// Importerer Sanity-klienten for å hente data fra backend
import sanityClient from "../../sanityclient"
// Importerer EventCard-komponenten for å vise arrangementer
import EventCard from "./eventcard"

// Dashboard-komponenten viser brukerens profil, ønskeliste, kjøpte billetter, venner og utvalgte arrangementer
const Dashboard = ({ isLoggedIn, setIsLoggedIn }) => {
  // State for innlogging, brukerdata og diverse lister
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userData, setUserData] = useState(null)
  const [wishlistEvents, setWishlistEvents] = useState([])
  const [purchasedEvents, setPurchasedEvents] = useState([])
  const [friends, setFriends] = useState([])
  const [friendCommonEvents, setFriendCommonEvents] = useState([])
  const [featuredEvents, setFeaturedEvents] = useState([])

  // Hjelpefunksjon for å pause mellom API-kall (for å unngå rate limits)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // Henter Ticketmaster API-nøkkel fra miljøvariabler
  const API_KEY = import.meta.env.VITE_TM_API_KEY

  // useEffect kjører når komponenten monteres
  useEffect(() => {
    // Sjekker om bruker allerede er logget inn (lagret i localStorage)
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      setIsLoggedIn(true)
      setUserData(parsedUser)
      fetchEventDetails(parsedUser)
      fetchFriends(parsedUser)
      fetchFeaturedEvents()
    }
  }, [])

  // Henter detaljer om events fra ønskelisten og tidligere kjøp
  const fetchEventDetails = async (user) => {
    console.log(user)
    try {
      const wishlistResponses = []
      // Går gjennom alle event-IDer i ønskelisten og henter detaljer fra Ticketmaster
      for (const id of user.wishlist?.filter(Boolean) || []) {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}&local=*`
          )
          if (!res.ok) continue
          const data = await res.json()
          wishlistResponses.push(data)
          await sleep(450) // Pause for å unngå å spamme API-et
        } catch {}
      }
      setWishlistEvents(wishlistResponses)

      const purchaseResponses = []
      // Går gjennom alle event-IDer i tidligere kjøp og henter detaljer
      for (const id of user.previousPurchases?.filter(Boolean) || []) {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}&local=*`
          )
          if (!res.ok) continue
          const data = await res.json()
          purchaseResponses.push(data)
        } catch {}
      }
      setPurchasedEvents(purchaseResponses)
    } catch (error) {
      // Logger feil hvis noe går galt med henting av eventdetaljer
      console.error("Error fetching event details:", error)
    }
  }

  // Henter vennedata fra Sanity og finner felles ønskeliste-events
  const fetchFriends = async (user) => {
    try {
      // Henter alle venner fra Sanity basert på referanser
      const friendsData = await sanityClient.fetch(
        `*[_type == "user" && _id in $friendIds]`,
        { friendIds: user.friends?.map((f) => f._ref) || [] }
      )
      setFriends(friendsData)

      const commonList = []

      // For hver venn, sjekker hvilke events i ønskelisten som er felles
      for (const friend of friendsData) {
        const commonEventIds =
          friend.wishlist?.filter((id) => user.wishlist?.includes(id)) || []

        for (const id of commonEventIds) {
          try {
            const res = await fetch(
              `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}&local=*`
            )
            if (!res.ok) continue
            const data = await res.json()
            // Lagrer navn på venn og event for å vise forslag om å gå sammen
            commonList.push({
              friendName: friend.name,
              eventName: data.name,
            })
          } catch (err) {
            // Logger advarsel hvis det oppstår feil for en spesifikk venn/event
            console.warn(
              `Error fetching event ${id} for friend ${friend.name}:`,
              err
            )
          }
        }
      }

      setFriendCommonEvents(commonList)
    } catch (err) {
      // Logger feil hvis henting av venner feiler
      console.error("Error fetching friends:", err)
    }
  }

  // Henter utvalgte events fra Sanity og deres detaljer fra Ticketmaster
  const fetchFeaturedEvents = async () => {
    try {
      // Henter alle events fra Sanity som har en apiId
      const events = await sanityClient.fetch(`*[_type == "event"]{apiId}`)
      const responses = []

      for (const { apiId } of events) {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events/${apiId}.json?apikey=${API_KEY}&local=*`
          )
          if (!res.ok) continue
          const data = await res.json()
          responses.push(data)
          await sleep(1000) // Pause mellom kall for å unngå rate limits
        } catch (err) {
          // Logger advarsel hvis det oppstår feil for et spesifikt event
          console.warn(`Error fetching featured event ${apiId}:`, err)
        }
      }

      setFeaturedEvents(responses)
    } catch (error) {
      // Logger feil hvis henting av utvalgte events feiler
      console.error("Error fetching featured events:", error)
    }
  }

  // Håndterer innlogging av bruker
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // Henter bruker fra Sanity basert på brukernavn (her brukes e-post som navn)
      const user = await sanityClient.fetch(
        `*[_type == "user" && name == $name][0]`,
        { name: email }
      )
      if (user) {
        // Lagrer bruker i localStorage og oppdaterer state
        localStorage.setItem("user", JSON.stringify(user))
        setUserData(user)
        setIsLoggedIn(true)
        fetchEventDetails(user)
        fetchFriends(user)
        fetchFeaturedEvents()
      } else {
        alert("User not found")
      }
    } catch (err) {
      // Logger feil hvis innlogging feiler
      console.error("Login error:", err)
    }
  }

  // Håndterer utlogging av bruker
  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUserData(null)
  }

  // Viser innloggingsskjema hvis bruker ikke er logget inn
  if (!isLoggedIn) {
    return (
      <main className="login-container">
        <section className="login-card">
          <h1>Login</h1>
          <form className="login-form" onSubmit={handleLogin}>
            <fieldset>
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </fieldset>
            <button type="submit">Login</button>
          </form>
        </section>
      </main>
    )
  }

  // Hvis bruker er logget inn, vis dashboard med brukerdata, venner og events
  return (
    <main className="dashboard-container">
      <div className="top-cards">
        <section className="user-card">
          <div className="avatar">{userData?.name?.[0]}</div>
          <h2>{userData?.name}</h2>
          <p>{userData?.dob || "1993-09-19"}</p>
          <p>{userData?.gender || "Female"}</p>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </section>

        <section className="friends-card">
          <h3>Friends</h3>
          {/* Viser felles events mellom bruker og venner */}
          {friendCommonEvents.map((match, index) => (
            <div className="friend-card" key={index}>
              <div className="friend-avatar">{match.friendName?.[0]}</div>
              <div className="friend-info">
                <p className="friend-name">{match.friendName}</p>
                <p>
                  You and <strong>{match.friendName}</strong> both want to go to{" "}
                  <strong>{match.eventName}</strong>. How about going together?
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="user-content">
        <h2>Wishlist</h2>
        <div className="card-grid">
          {/* Viser alle events i ønskelisten */}
          {wishlistEvents.map((event, index) => (
            <EventCard
              key={`${event.id}-${index}`}
              event={event}
              sanityevent={true}
            />
          ))}
        </div>

        <h2>Previous Purchases</h2>
        <div className="card-grid">
          {/* Viser alle tidligere kjøpte events */}
          {purchasedEvents.map((event, index) => (
            <EventCard
              key={`${event.id}-${index}`}
              event={event}
              sanityevent={true}
            />
          ))}
        </div>

        <h2>Featured Events</h2>
        <div className="card-grid">
          {/* Viser utvalgte events fra Sanity */}
          {featuredEvents.map((event, index) => (
            <EventCard
              key={`${event.id}-${index}`}
              event={event}
              sanityevent={true}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Dashboard
