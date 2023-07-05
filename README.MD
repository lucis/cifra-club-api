# Cifra Club API

## Getting Started

Clone the project:

```bash
    git clone https://github.com/lucis/cifra-club-api.git
```

Navigate to the project directory:

```bash
    cd cifra-club-api
```

Install all dependencies:

```bash
    npm install || yarn
```

Start the server **NOTE** Only for the development environment:

```bash
    npm run dev || yarn dev
```

The project is running by default at:

```javascript
    http://localhost:8082/
```

**NOTE**: Change the port in the **PORT** variable in **./app.js** if needed.

## Using Routes

## Route **"/songs"** 
    
- Returns an array of objects with an artist's songs based on the artist's name.

```javascript
const artistExample = "caetano-veloso"
request example: `http://localhost:8082/songs?name={artistExample}`
```
    returns:
    [
        {
            "name": string,
            "slug": string,
            "artist": {
                        "name": string
                        "slug" string
                      }
        }
    ] 

If the searched name does not exist, the return will be an empty array: **[]**

## Route **"/chords/:artist/:song"** 
    
- Retrieves the chords of a specific song from Cifra Club and handles the returned HTML.

```javascript
const artistExample = "caetano-veloso"
const musicExample =  "sozinho"
request example: `http://localhost:8082/chords/${artistExample}/${musicExample}/`
```
returns: **A string with html tags**

If the search does not exist, the return will be : **"null"**

## Route **"/artists/:artistslug"** 

- Collects information about the researched artist using "Vagalume" as the research base.

```javascript
const artistExample = "caetano-veloso"
request example: `http://localhost:8082/artists/${artistExample}`
```
    returns:
        {
            "name": string,
            "imgUrl": string,
            "genre": string
        }

If the search does not exist, the return will be an empty object: **{}**

You can use **"?complete=true"** to get the top lyrics for that artist.

```javascript
const artistExample = "caetano-veloso"
request example: `http://localhost:8082/artists/${artistExample}?complete=true`
```
    returns:
    { 
        "name": string,
        "imgUrl": string,
        "genre: string,
        "topLyrics": [
                        {
                            "id": string,
                            "desc": string,
                            "url": string,
                        }
                        ...
                     ]

    }

If the search does not exist, the return will be an empty object: **{}**

## References

 - [Cifra Club](https://www.cifraclub.com.br)
 - [Vagalume](https://www.vagalume.com.br)

## Authors

- [@lucis](https://github.com/lucis)

## Contributors

- [@caiofelipe97](https://github.com/caiofelipe97)
- [@bezlima](https://github.com/bezlima)


## Documentation

#### **Constants**

- The **PORT** constant is used to define the port on which the project is running on the local machine. By assigning a number to the PORT constant, the project is configured to listen for incoming requests on that specific port.

- The **SEARCH_SONGS_API** constant is used to call an API that returns an array of music objects based on the search parameter "?q=". This API is designed to search for songs based on a partial match of their name, which is supplied as the value of the "q" parameter.

- The **getChordsApi** constant is used to call the Cifra Club website's print sheet music functionality. This specific API provided by Cifra Club allows you to obtain a formatted printable version of a selected song's chords.

- The **getArtistApi** constant is used to call the Vagalume API, which is responsible for returning data about a specific artist. This Vagalume API provides detailed information about artists, including their name, image, music genre, main lyrics, and other relevant details.

- The constant **CIFRACLUB_SONG_ID** is used to identify that a particular entry refers to a song rather than an artist.

#### **Route**

The route **"/songs"** is an asynchronous function that takes the query parameter "name" as input. Its purpose is to search for songs based on the provided name.

The route starts by making a request to the "SEARCH_SONGS_API" constant with the "name" parameter as the value for the search parameter "q". The response is stored in the "response" variable.
The "rawData" variable is used to extract the data from the response by removing the parentheses () surrounding the "response.data" object.
It then checks if there is a valid result. If there are no results, the route returns a 404 HTTP error with an empty array [].
The "entries" variable is created to store the response documents from the search, specifically the "docs" property of the "processed.response".
In "finalResult", the array "entries" is filtered based on the "CIFRACLUB_SONG_ID" constant. This means that only entries representing songs are kept.
Next, the properties of these songs are mapped to make them more understandable. This includes transforming properties such as "m", "a", "u", and "d" into "name", "slug", and "artist".
Additionally, another mapping is performed in "finalResult" to add additional information about the genre of the songs. This information is obtained by using the "getArtistApi" function with the artist's slug.
To ensure that all asynchronous calls are completed before proceeding, the function "Promise.all(finalResult)" is used.
Finally, the resulting songs are assigned to the "songs" variable and returned as the response of the route using the "res.json(songs)" method.

The **"/chords/:artist/:song"** route is an asynchronous function that takes two parameters: "artist" and "song". The purpose of this route is to retrieve the chords for a specific song from Cifra Club and format them for display.

The route starts by making a request to the "getChordsApi" constant, passing the "artist" and "song" parameters received by the route function to identify the desired song.
The response from the request is stored in the "response" variable.
Next, the "cheerio" library is used to load the HTML content returned by the request. This allows for manipulating the HTML and extracting the necessary data.
The CSS class ".tablatura" is removed from the HTML using the "remove()" method of the "$('.tablatura')" object. This class usually contains additional information that is not necessary for displaying the chords.
Finally, the HTML content of the "pre" element is extracted using the "html()" method of the "$('pre')" object. This element typically contains the formatted chords.
The HTML content of the chords is returned as the response of the route using the "res.json()" method.
If an error occurs during the process, such as the song not being found, the route returns an HTTP 404 status with an empty object "{}" as the response.

The **"/artists/:artistslug"** route is an asynchronous function that takes a parameter called "artistslug" and an optional query parameter called "complete". The purpose of this route is to obtain information about an artist based on the artist's slug.

The route makes a request using the "getArtistApi" function to fetch the artist data from Vagalume. The "artistslug" parameter is passed to this function to identify the desired artist.
The response from the request is stored in the "response" variable.
The "artist" object is extracted from the response data, retrieving the "data.artist" property.
A check is performed to ensure that the "artist" object exists. If it doesn't exist, the route returns an HTTP 404 status with an empty object "{}" as the response.
The "artistResponse" variable is initialized with the basic properties of the artist, such as "name", "imgUrl" (image URL), and "genre" (music genre). These pieces of information are extracted from the "artist" object.
If the "complete" query parameter is present and evaluates to true, the code block inside the "if" statement is executed.
Within the "if" block, the "topLyrics" property is added to the "artistResponse" object. This property contains the artist's top lyrics and is obtained from the "toplyrics.item" property of the "artist" object.
Finally, the "artistResponse" object is returned as the response of the route using the "res.json()" method.
If an error occurs during the process, such as the artist not being found, the route returns an HTTP 404 status with an empty object "{}" as the response.