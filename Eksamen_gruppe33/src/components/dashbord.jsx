import React, { useState, useEffect } from "react"
import sanityClient from "../../sanityclient"
import EventCard from "./eventcard"

const Dashboard = ({ isLoggedIn, setIsLoggedIn }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userData, setUserData] = useState(null)
  const [wishlistEvents, setWishlistEvents] = useState([])
  const [purchasedEvents, setPurchasedEvents] = useState([])
  const [friends, setFriends] = useState([])
  const [friendCommonEvents, setFriendCommonEvents] = useState([])
  const [featuredEvents, setFeaturedEvents] = useState([])
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const API_KEY = import.meta.env.VITE_TM_API_KEY

  useEffect(() => {
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

  const fetchEventDetails = async (user) => {
    console.log(user)
    try {
      const wishlistResponses = []
      for (const id of user.wishlist?.filter(Boolean) || []) {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}&local=*`
          )
          if (!res.ok) continue
          const data = await res.json()
          wishlistResponses.push(data)
          await sleep(450)
        } catch {}
      }
      setWishlistEvents(wishlistResponses)

      const purchaseResponses = []
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
      console.error("Error fetching event details:", error)
    }
  }

  const fetchFriends = async (user) => {
    try {
      const friendsData = await sanityClient.fetch(
        `*[_type == "user" && _id in $friendIds]`,
        { friendIds: user.friends?.map((f) => f._ref) || [] }
      )
      setFriends(friendsData)

      const commonList = []

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

            // Push each common event individually
            commonList.push({
              friendName: friend.name,
              eventName: data.name,
            })
          } catch (err) {
            console.warn(
              `Error fetching event ${id} for friend ${friend.name}:`,
              err
            )
          }
        }
      }

      setFriendCommonEvents(commonList)
    } catch (err) {
      console.error("Error fetching friends:", err)
    }
  }

  const fetchFeaturedEvents = async () => {
    try {
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
          await sleep(1000)
        } catch (err) {
          console.warn(`Error fetching featured event ${apiId}:`, err)
        }
      }

      setFeaturedEvents(responses)
    } catch (error) {
      console.error("Error fetching featured events:", error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const user = await sanityClient.fetch(
        `*[_type == "user" && name == $name][0]`,
        { name: email }
      )
      if (user) {
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
      console.error("Login error:", err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUserData(null)
  }

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
