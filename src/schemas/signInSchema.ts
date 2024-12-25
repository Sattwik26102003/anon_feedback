import {z} from "zod"

export const signInSchema=z.object({
    identifier:z.string(),  // identifier represents email
    password:z.string()
})