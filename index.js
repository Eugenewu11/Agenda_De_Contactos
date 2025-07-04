import express from 'express'
import contactRoutes from './routes/contacto.route.js'
import cors from 'cors'
import dotenv from 'dotenv'

const app = express() //Para crear la aplicacion de express

dotenv.config() //Cargar las variables de entorno

//Puerto en donde se va a ejecutar la aplicacion
const PORT = process.env.PORT || 3000

//Convertir los boddies de las peticiones que se reciban
app.use(express.json())

app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://prod.server.com',
        'https://test.server.com'
    ],
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization', 'Bearer', 'api-key']
}))

//Ruta de contactos
app.use('/contactos',contactRoutes)

//Si no se encuentra esa ruta, mostrar error
app.use((req,res)=>{
    res.status(404).json({
        message: `${req.url} no encontrado.`
    })
})

app.listen(PORT,() => {
    console.log(`Server running on port http://localhost:${PORT}`)
})