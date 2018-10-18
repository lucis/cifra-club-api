const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const SEARCH_SONGS_API = 'https://studiosolsolr-a.akamaihd.net/cc/h2/'
const getChordsApi = (artist, song) =>
  `https://www.cifraclub.com.br/${artist}/${song}/imprimir.html`
const getArtistApi = artistSlug =>
  `https://www.vagalume.com.br/${artistSlug}/index.js`

// Tells us that this entry is a song, and not an artist
const CIFRACLUB_SONG_ID = '2'

/**
 * Receives a part of a song name and search for songs in CifraClub
 */
app.get('/songs', async ({ query: { name } }, res) => {
  const response = await axios.get(SEARCH_SONGS_API, {
    params: { q: name },
  })
  const rawData = response.data

  // Removes the ( )'s from the response
  const processed = JSON.parse(rawData.slice(1).slice(0, rawData.length - 3))

  // Checks if a result was found
  if (!processed.response.docs) {
    return res.json([])
  }

  const entries = processed.response.docs

  const finalResult = entries
    .filter(entry => entry.t === CIFRACLUB_SONG_ID)
    // Change properties from CifraClub to a more human-readable fancy
    .map(({ m, a, u, d }) => ({
      name: m,
      slug: u,
      artist: {
        name: a,
        slug: d
      }
    }))
    .map(song => {
      return axios.get(getArtistApi(song.artist.slug))
      .then(response => ({...song, genre: response.data.artist && response.data.artist.genre && response.data.artist.genre[0].name}), () => ({...song}))
    })
  const songs = await Promise.all(finalResult)  
  res.json(songs)
})

/**
 * Get the chords of a specific song in the CifraClub service
 */
app.get('/chords/:artist/:song', async ({ params: { artist, song } }, res) => {
  try {
    const response = await axios.get(getChordsApi(artist, song))
    const $ = cheerio.load(response.data)
    $('.tablatura').remove()
    return res.json($('pre').html())
  } catch (e) {
    return res.status(404).json({})
  }
})

/**
 * Recover data from an specific artist by its slug (we are using the genre)
 *
 * It can also recover top lyrics if ?complete=true
 */
app.get(
  '/artists/:artistslug',
  async ({ params: { artistslug }, query: { complete } }, res) => {
    try {
      const response = await axios.get(getArtistApi(artistslug))
      const artist = response.data.artist

      if (!artist) return res.status(404).json({})

      let artistResponse = {
        name: artist.desc,
        imgUrl: artist.pic_small,
        genre: artist.genre ? artist.genre[0].name : undefined,
      }

      if (complete) {
        artistResponse = { ...artistResponse, topLyrics: artist.toplyrics.item }
      }
      return res.json(artistResponse)
    } catch (e) {
      return res.status(404).json({})
    }
  }
)

app.listen(8082, () => {
  console.log('Server listening in port 8082')
})
