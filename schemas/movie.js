import z from "zod"

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: "Movie must be a string",
        required_error: "Movie title is required"
    }),
    director: z.string(),
    genre: z.string(),
    rating: z.object({
        imdb: z.number().positive(),
        rottenTomatoes: z.number().int()
    }),
    description: z.string()
})

export function validateMovieSchema(object) {
    return movieSchema.safeParse(object)
}

export function validatePartialMovieSchema(object) {
    return movieSchema.partial().safeParse(object)
}
