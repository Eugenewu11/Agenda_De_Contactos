import express from 'express'
import contactRoutes from './routes/contacto.route.js'

const app = express() //Para crear la aplicacion de express

//Puerto en donde se va a ejecutar la aplicacion
const PORT = process.env.PORT || 3000

//Convertir los boddies de las peticiones que se reciban
app.use(express.json())

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