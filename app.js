const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const CIFRACLUB_API = 'https://studiosolsolr-a.akamaihd.net/cc/h2/'

/**
 * Receives a part of a song name and search for songs in CifraClub
 */
app.get('/song', async (req, res) => {
  const response = await axios.get(
    CIFRACLUB_API,
    { params: { q: req.query.name } }
  )
  const rawData = response.data

  // Removes the ( )'s from the response
  const processed = JSON.parse(rawData.slice(1).slice(0, rawData.length - 3))

  // Checks if a result was found
  if (!processed.response.docs) { return res.json([]) }
  
  const entries = processed.response.docs

  const finalResult = entries
  // Tells us that this entry is a song, and not an artist
  .filter( entry => entry.t === '2')
  // Change properties from CifraClub to a more human-readable fancy
  .map(({ m, a, u, d }) => ({
    songName: m,
    artistName: a,
    songSlug: u,
    artistSlug: d
  }))

  res.json(finalResult);
})

/**
 * Get the chords of a specific song in the CifraClub service
 */
app.get('/chords/:artist/:song', async ({ params: { artist, song}}, res) => {
  const response = await axios.get(`https://www.cifraclub.com.br/${artist}/${song}/imprimir.html`)
  const $  = cheerio.load(response.data);
  $('.tablatura').remove()
  return res.json($('pre').html());
});



app.listen(8082, () => {
  console.log('Server listening in port 8082')
})
