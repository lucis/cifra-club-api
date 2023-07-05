const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()
const PORT = 8082
const SEARCH_SONGS_API = 'https://studiosolsolr-a.akamaihd.net/cc/h2/'
const getChordsApi = (artist, song) => `https://www.cifraclub.com.br/${artist}/${song}/imprimir.html`
const getArtistApi = artistSlug => `https://www.vagalume.com.br/${artistSlug}/index.js`
const CIFRACLUB_SONG_ID = '2'

app.get('/songs', async ({ query: { name } }, res) => {
  const response = await axios.get(SEARCH_SONGS_API, {
    params: { q: name },
  })
  const rawData = response.data
  const processed = JSON.parse(rawData.slice(1).slice(0, rawData.length - 3))
  if (!processed.response.docs) {
    return res.status(404).json([])
  } 
  const entries = processed.response.docs
  const finalResult = entries
    .filter(entry => entry.t === CIFRACLUB_SONG_ID)
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
      .then(response => ({...song, genre: response.data.artist && response.data.artist.genre && response.data.artist.genre[0]?.name}), () => ({...song}))
    })
  const songs = await Promise.all(finalResult)  
  res.json(songs)
})

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

app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <div >
          <p style="margin-right: 5px"> Route: "/songs": The purpose of this route is to search for songs based on the provided name.</p>
          <div style="display: flex; align-items: center">
            <p style:"margin-right: 5px"> Exemple: </p>
            <a href="http://localhost:${PORT}/songs?name=caetano-veloso">
              /songs?name=caetano-veloso
            </a>
          </div>
      </div>
      <div >
          <p style="margin-right: 5px"> Route: "/chords/:artist/:song": The purpose of this route is to retrieve the chords for a specific song from Cifra Club and format them for display. </p>
          <div style="display: flex; align-items: center">
            <p style:"margin-right: 5px"> Exemple: </p>
            <a href="http://localhost:${PORT}/chords/caetano-veloso/sozinho/">
              /chords/caetano-veloso/sozinho/
            </a>
          </div>
      </div>
      <div >
          <p style="margin-right: 5px"> Route: "/artists/:artistslug": The purpose of this route is to obtain information about an artist based on the artist's slug. </p>
          <div style="display: flex; align-items: center">
            <p style:"margin-right: 5px"> Exemple: </p>
            <a href="http://localhost:${PORT}/artists/caetano-veloso">
              /artists/caetano-veloso
            </a>
          </div>
          <p style="margin-right: 5px"> Route: "/artists/:artistslug?complete=true": The purpose of this route is to obtain information about an artist based on the artist's slug. Additionally, when the complete parameter is set to true, the route retrieves the artist's top songs. </p>
          <div style="display: flex; align-items: center">
            <p style:"margin-right: 5px"> Exemple: </p>
            <a href="http://localhost:${PORT}/artists/caetano-veloso?complete=true">
              /artists/caetano-veloso?complete=true
            </a>
          </div>
      </div>
    </html
  `)
})

app.listen(PORT, () => {
  console.log(`Server listening in http://localhost:${PORT}/ `)
})