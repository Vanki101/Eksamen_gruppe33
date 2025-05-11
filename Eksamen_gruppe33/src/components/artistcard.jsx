// ArtistCard-komponenten: Viser et bilde og navnet til en artist.
// Komponenten mottar et 'artist'-objekt som prop, henter det første bildet hvis det finnes,
// og viser artistens navn. Passer bra til å vise artister i en liste eller et grid.

import React from "react"

export default function ArtistCard({ artist }) {
  return (
    <div className="artist-card">
      <img
        src={artist.images?.[0]?.url}
        alt={artist.name}
        className="artist-image"
      />
      <p className="artist-name">{artist.name}</p>
    </div>
  )
}
