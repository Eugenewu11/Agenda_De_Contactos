//Import de zod 
import zod from 'zod'

const contactoSchema = zod.object({
    "primerNombre": zod.string()
    .min(1,{message: 'El primer nombre es obligatorio.'})
    .max(30,'El primer nombre no puede exceder los 50 caracteres.')
    .trim(),

    "segundoNombre": zod.string()
    .min(1,{message: 'El segundo nombre debe contener al menos 1 caracter.'})
    .max(30)
    .trim()
    .optional(),

    "apellidos": zod.string()
    .min(1,{message: 'Los apellidos son obligatorios.'})
    .max(30,'El apellido no debe exceder los 30 caracteres.')
    .trim()
    .max(30),

    "telefono":  zod.string()
    .regex(/^\+?\d{8,15}$/,
    {
        message: 'Teléfono no válido. Debe tener entre 8 y 15 dígitos y opcionalmente el prefijo "+" al inicio.'
    })
    .trim(),

   "correo": zod.string()
   .regex(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
    { 
        message: "El correo electrónico no tiene un formato válido." 
    })
    .optional()

}).strict()

//Schema para actualizar contactos
export const contactoSchemaUpdate = contactoSchema.partial()

//Schema para crear contactos
export const validateContactos = (contactos) => {
    return contactoSchema.safeParse(contactos)
}