import {z} from "zod"

export const userNameValidation=z
.string()
.min(2,"Username must be atleast two characters")
.max(20,"no more than 20 character")
.regex(/^[a-zA-Z0-9 ]*$/,"username must not contain speacial character")


export const signUpSchema=z.object({
    userName:userNameValidation,
    email:z.string().min(6,{message:"password must be at least 6 characters"}),
    password:z.string().min(6,{message:"password must be atleast 6 characters"})
})