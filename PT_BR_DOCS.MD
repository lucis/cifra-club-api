# Cifra Club API

## Rodando localmente

Clone o projeto

```bash
    git clone https://github.com/lucis/cifra-club-api.git
```

Entre no diretório do projeto

```bash
    cd cifra-club-api
```

Instale as dependências

```bash
    npm install || yarn
```

Inicie o servidor **OBS.** Somente para o ambiente de desenvolvimento

```bash
    npm run dev || yarn dev
```

o projeto por padrão está rodando em: 

```javascript
    http://localhost:8082/
```
**OBS.** Trocar a porta na variável PORT em ./app.js

## Usando as rotas

## Rota **"/songs"** 
    
- retona um array de objetos com musicas de um artista com base no nome de um artista


```javascript
const artistExample = "caetano-veloso"
exemplo de requisição: `http://localhost:8082/songs?name={artistExample}`
```
    teremos o retorno:
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

caso não exista o nome pesquisado o retorno será: **[]**

## Rota **"/chords/:artist/:song"** 
    
- pega os acordes de uma musica especifica do cifra club e faz o tratamento do html retornado

```javascript
const artistExample = "caetano-veloso"
const musicExample =  "sozinho"
exemplo de requisição: `http://localhost:8082/chords/${artistExample}/${musicExample}/`
```
teremos o retorno: **uma string com marcadores html**

caso não exista a pesquisa o retorno será : **"null"**

## Rota **"/artists/:artistslug"** 

- pega informações do artista pesquisado tendo a base de pesquisa o vagalume

```javascript
const artistExample = "caetano-veloso"
exemplo de requisição: `http://localhost:8082/artists/${artistExample}`
```
    teremos o retorno:
        {
            "name": string,
            "imgUrl": string,
            "genre": string
        }

caso não exista a pesquisa o retorno será : **{}**

**Pode ser utilizado "?complete=true"para obter as principais musicas desse artista**

```javascript
const artistExample = "caetano-veloso"
exemplo de requisição: `http://localhost:8082/artists/${artistExample}?complete=true`
```
    teremos o retorno:
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

caso não exista a pesquisa o retorno será : **{}**

## Referências

 - [Cifra Club](https://www.cifraclub.com.br)
 - [Vagalume](https://www.vagalume.com.br)

## Autores

- [@lucis](https://github.com/lucis)

## Contribuições

- [@caiofelipe97](https://github.com/caiofelipe97)
- [@bezlima](https://github.com/bezlima)


## Documentação

**Constantes**

- A constante **PORT** é utilizada para definir a porta em que o projeto está sendo executado na máquina local. Ao atribuir um número à constante PORT, o projeto é configurado para escutar as solicitações de entrada nessa porta específica.

- A constante **SEARCH_SONGS_API** é usada para chamar uma API que retorna um array de objetos de músicas com base no parâmetro de pesquisa ?q=. Essa API é projetada para buscar músicas com base em uma parte do nome fornecida como valor para o parâmetro q.

- A constante **getChordsApi** é utilizada para chamar a funcionalidade de impressão de cifras no site Cifra Club. Essa API específica do Cifra Club permite obter uma versão formatada para impressão de uma cifra selecionada.

- A constante **getArtistApi** é utilizada para chamar a API do Vagalume, que é responsável por retornar dados sobre um artista específico. Essa API do Vagalume oferece informações detalhadas sobre artistas, como nome, imagem, gênero musical, principais letras de músicas e outros detalhes relevantes. 

- A constante **CIFRACLUB_SONG_ID** é utilizada para identificar que uma determinada entrada se refere a uma música e não a um artista.

**Rotas**

A rota **"/songs"** é uma função assíncrona que recebe a query "name" como parâmetro. O objetivo dessa rota é buscar músicas com base no nome fornecido.

- A rota inicia fazendo uma requisição para a constante "SEARCH_SONGS_API" com o parâmetro "name" como valor do parâmetro de pesquisa "q". A resposta é armazenada na variável "response".
- A variável "rawData" é usada para extrair os dados da resposta, removendo os parênteses () que envolvem o objeto de "response.data".
- Em seguida, é verificado se existe um resultado válido. Caso não haja resultados, a rota retorna um erro HTTP 404 com um array vazio [].
- A variável "entries" é criada para armazenar os documentos de resposta da busca, especificamente a propriedade "docs" de "processed.response".
- Em "finalResult" o array "entries" é filtrado com base na constante "CIFRACLUB_SONG_ID". Isso significa que apenas as entradas que representam músicas são mantidas.
- Em seguida, ocorre um mapeamento das propriedades dessas músicas para torná-las mais compreensíveis. Isso inclui a transformação das propriedades "m", "a", "u" e "d" em "name", "slug" e "artist".
- Posteriormente, é feito outro mapeamento em "finalResult" para adicionar informações adicionais sobre o gênero das músicas. Essas informações são obtidas por meio da função "getArtistApi" usando o slug do artista.
- Para aguardar a conclusão de todas as chamadas assíncronas, a função "Promise.all(finalResult)" é utilizada. Isso garante que todas as promises presentes no array "finalResult" sejam concluídas antes de prosseguir.
- Por fim, o resultado final contendo as músicas é atribuído à variável "songs" e retornado como resposta da rota utilizando o método "res.json(songs)".

A rota **"/chords/:artist/:song"** é uma função assíncrona que recebe dois parâmetros: "artist" e "song". O objetivo dessa rota é obter os acordes de uma música específica do Cifra Club e formatá-los para exibição.

- A rota inicia fazendo uma requisição para a constante "getChordsApi" passando os parametros "artist" e "song" recebidos pela rota para essa função para identificar a música desejada
- A resposta da requisição é armazenada na variável "response".
- Em seguida, é utilizada a biblioteca "cheerio" para carregar o conteúdo HTML retornado pela requisição. Isso permite manipular o HTML e extrair os dados necessários.
- A classe CSS ".tablatura" é removida do HTML utilizando o método "remove()" do objeto "$('.tablatura')". Essa classe geralmente contém informações adicionais que não são necessárias para a exibição dos acordes.
- Por fim, o conteúdo HTML do elemento "pre" é extraído utilizando o método "html()" do objeto "$('pre')". Esse elemento geralmente contém os acordes formatados.
- O conteúdo HTML dos acordes é retornado como resposta da rota utilizando o método "res.json()".
- Caso ocorra algum erro durante o processo, como a música não ser encontrada, a rota retorna um status HTTP 404 com um objeto vazio "{}" como resposta.

A rota **"/artists/:artistslug"** é uma função assíncrona que recebe um parâmetro chamado "artistslug" e um parâmetro de consulta opcional chamado "complete". O objetivo dessa rota é obter informações sobre um artista com base no slug do artista.

- A rota faz uma requisição utilizando a função "getArtistApi" para obter os dados do artista do Vagalume. O parâmetro "artistslug" é passado para essa função para identificar o artista desejado.
- A resposta da requisição é armazenada na variável "response".
- O objeto "artist" é extraído dos dados da resposta, obtendo a propriedade "data.artist".
- É feita uma verificação para garantir que o objeto "artist" existe. Caso não exista, a rota retorna um status HTTP 404 com um objeto vazio "{}" como resposta.
- A variável "artistResponse" é inicializada com as propriedades básicas do artista, como "name" (nome), "imgUrl" (URL da imagem) e "genre" (gênero musical). Essas informações são extraídas do objeto "artist".
- Se o parâmetro de consulta "complete" estiver presente e for avaliado como verdadeiro, o bloco de código dentro do "if" será executado.
- Dentro do bloco "if", é adicionada a propriedade "topLyrics" ao objeto "artistResponse". Essa propriedade contém as principais letras de músicas do artista e é obtida a partir da propriedade "toplyrics.item" do objeto "artist".
- Por fim, o objeto "artistResponse" é retornado como resposta da rota utilizando o método "res.json()".
- Caso ocorra algum erro durante o processo, como o artista não ser encontrado, a rota retorna um status HTTP 404 com um objeto vazio "{}" como resposta.

