import express from "express"
import dataJSON from "./requires/requireJson.cjs"
import crypto from "node:crypto"
import { validateMovieSchema, validatePartialMovieSchema } from "./schemas/movie.js"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors({
	origin: (origin, callback) => {
		const ACCEPTED_ORIGINS = [ //ORIGENES PERMITIDOS
			"http://localhost:8080",
			"http://localhost:1234"
		]
		if (ACCEPTED_ORIGINS.includes(origin)) { //SI LA RUTA ESTA PERMITIDA
			return callback(null, true)
		}
		if (!origin) { //QUE NO TENGA ORIGEN (OSEA QUE LA PETICION TENGA EL MISMO ORIGEN QUE DE DONDE ESTA DESPLEGADA LA API)
			return callback(null, true)
		}
		return callback(new Error("Not allowed by CORS")) //PETICION NO PERMITIDA POR CORS
	}
}))

app.get("/", (req, res) => {
	res.status(200).send("This is mi API")
})

app.get("/movies", (req, res) => {
	const { genre } = req.query
	console.log(genre)
	if (genre) {
		const filteredMovies = dataJSON[0].filter(movie => {
			const genreMovie = movie.genre.split(", ")
			if (genreMovie.some(g => g.toLowerCase() === genre.toLowerCase())) {
				return movie
			}
		})
		return res.status(200).send(filteredMovies)
	}
	return res.status(200).send(dataJSON)
})

app.post("/movies", (req, res) => {

	const result = validateMovieSchema(req.body)

	if (result.error) {
		res.status(400).json({ error: JSON.parse(result.error.message) })
	}

	const newMovie = {
		id: crypto.randomUUID(),
		...result.data
	}

	dataJSON[0].push(newMovie)

	res.status(201).json(newMovie)

})

app.patch("/movies/:id", (req, res) => {
	const result = validatePartialMovieSchema(req.body)
	console.log(result)
	if (result.error) {
		console.error(`Error en la validacion del squema: `)
		return res.status(400).json({ message: "Error in the petition" })
	}
	const { id } = req.params
	const findIndex = dataJSON[0].findIndex(movie => movie.id === id)
	if (findIndex < 0) {
		console.error(`Error al encontrar la pelicula: `)
		return res.status(404).json({ error: "Movie not found" })
	}
	const updatedMovie = {
		...dataJSON[0][findIndex],
		...result.data
	}
	dataJSON[0][findIndex] = updatedMovie
	return res.json(updatedMovie)
})

const SERVER_PORT = process.env.PORT ?? 3000

app.listen(SERVER_PORT, () => {
	console.log(`Server listening on port http://localhost:${SERVER_PORT}`)
})