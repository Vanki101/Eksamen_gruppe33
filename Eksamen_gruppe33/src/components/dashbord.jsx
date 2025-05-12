import React, { useState, useEffect } from "react"
import sanityClient from "../../sanityclient"
import React, { useState, useEffect } from "react"
import sanityClient from "../../sanityclient"
import EventCard from "./eventcard"
const Dashboard = ({ isLoggedIn, setIsLoggedIn }) => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userData, setUserData] = useState(null)
  const [wishlistEvents, setWishlistEvents] = useState([])
  const [purchasedEvents, setPurchasedEvents] = useState([])
  const [friends, setFriends] = useState([])
  const [friendCommonEvents, setFriendCommonEvents] = useState([])

  const API_KEY = import.meta.env.VITE_TM_API_KEY

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      setIsLoggedIn(true)
      setUserData(parsedUser)
      fetchEventDetails(parsedUser)
      fetchFriends(parsedUser)
    }
  }, [])

  const fetchEventDetails = async (user) => {
    try {
      const wishlistResponses = []
      for (const id of user.wishlist?.filter(Boolean) || []) {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}`
          )
          if (!res.ok) continue
          const data = await res.json()
          wishlistResponses.push(data)
        } catch {}
      }
      setWishlistEvents(wishlistResponses)

      const purchaseResponses = []
      for (const id of user.previousPurchases?.filter(Boolean) || []) {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}`
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
    console.log(user.friends)
    try {
      const friendsData = await sanityClient.fetch(
        `*[_type == "user" && _id in $friendIds]`,
        { friendIds: user.friends?.map((f) => f._ref) || [] }
      )
      setFriends(friendsData)

      const commonList = []
      for (const friend of friendsData) {
        const common =
          friend.wishlist?.filter((id) => user.wishlist?.includes(id)) || []
        if (common.length > 0) {
          const firstCommonEventId = common[0]
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events/${firstCommonEventId}.json?apikey=${API_KEY}`
          )
          const event = await res.json()
          commonList.push({
            friendName: friend.name,
            eventName: event.name,
          })
        }
      }
      setFriendCommonEvents(commonList)
    } catch (err) {
      console.error("Error fetching friends:", err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const query = `*[_type == "user" && name == $name][0]`
      const user = await sanityClient.fetch(query, { name: email })
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
        setUserData(user)
        setIsLoggedIn(true)
        fetchEventDetails(user)
        fetchFriends(user)
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

  console.log(friends)

  return (
    <main className="dashboard">
      <section className="user-info">
        <h2>User Information</h2>
        <p>
          <strong>Name:</strong> {userData?.name}
        </p>
        <p>
          <strong>Age:</strong> {userData?.age}
        </p>
        <p>
          <strong>Gender:</strong> {userData?.gender}
        </p>
        <button onClick={handleLogout}>Logout</button>
      </section>

      <section className="user-friends">
        <h2>Friends</h2>
        {friends.map((friend) => (
          <div key={friend._id}>
            <p>
              <strong>{friend.name}</strong>
            </p>
          </div>
        ))}
        {friendCommonEvents.map((match, index) => (
          <p key={index}>
            You and <strong>{match.friendName}</strong> have the same event in
            your wishlist – how about going together to{" "}
            <strong>{match.eventName}</strong>?
          </p>
        ))}
      </section>

      <section className="user-content">
        <h2>Wishlist</h2>
        <div className="card-grid">
          {wishlistEvents.map((event) => (
            <EventCard key={event.id} event={event} sanityevent={true} />
          ))}
        </div>

        <h2>Previous Purchases</h2>
        <div className="card-grid">
          {purchasedEvents.map((event) => (
            <EventCard key={event.id} event={event} sanityevent={true} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Dashboard