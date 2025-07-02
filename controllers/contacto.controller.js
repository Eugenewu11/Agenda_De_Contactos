import contactos from '../db_pruebas/contactosPrueba.json' with {type: 'json'}
//const {getConexion, sql} = require('../database/database.js')

/*static getContactos = async (req,res) => {
    try {
        const conexion = await getConexion()
        const data = await conexion.request().query('SELECT PrimerNombre FROM contacto')
        res.json(data.recordset)
    } catch (error) {
        console.error('Error al obtener contactos: ',error)
        res.status(500).json({
            message: 'Error del servidor.'
        })
    }
}*/

//Metodo para devolver todos los contactos
export const getAllContactos = (req,res) => {
    res.json(contactos)
}

 //Este metodo va a buscar segun lo que se escriba en el searchbar
export const getSearchContacto = (req,res) => {
    const { nombre } = req.query

        //Si el nombre enviado al searchbar no igual o no existe devolver un error        
        if(!nombre || nombre.trim() === ""){
            res.status(400).json({
                message: 'No se encontró el contacto especificado'
            })
        }

        const nombreBuscado = nombre.toLowerCase()

        const resultados = contactos.filter( contacto => {
            //Filtrar la busqueda pasando todo a minusculas y encontrar el cualquier coincidencia
            return(
            contacto.primerNombre.toLowerCase().includes(nombreBuscado) || 
            (contacto.segundoNombre.toLowerCase().includes(nombreBuscado)) ||
            contacto.apellidos.toLowerCase().includes(nombreBuscado) )
        })
        res.json(resultados)
}

    //Crear un contacto
    export const createContactos =  (req,res)=>{
        const {primerNombre,segundoNombre,apellidos,telefono,correo} = req.body

        //Si no existe o es vacio
        if(!primerNombre || primerNombre.trim()=== ""){
            return res.status(400).json({
                message: 'Este campo es obligatorio'
            })
        }
        
        //El apellido no puede ir vacio
        if (!apellidos || apellidos.trim() === "") {
            return res.status(400).json({ message: 'Los apellidos son obligatorios.' });
        }

        //Validar que el telefono pueda contener prefijo + o solo de 7 a 15 digitos
        const esTelefonoValido = /^\+?\d{7,15}$/.test(telefono);

        if (!esTelefonoValido) {
            return res.status(400).json({ message: 'El número de teléfono no es válido.' });
        }

        //Validar que el correo contenga el formato valido
        if (correo && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo)) {
            return res.status(400).json({ message: 'El correo electrónico no tiene un formato válido.' });
        }

        const nuevoContacto = {
            primerNombre: primerNombre.trim(),
            segundoNombre: segundoNombre ? segundoNombre.trim() : "",
            apellidos: apellidos.trim(),
            telefono: telefono.trim(),
            correo:correo.trim()
        }

        contactos.push(nuevoContacto)

        res.status(200).json({
        message: 'Contacto creado!.'
    });
    }

    //Actualizar un contacto
    export const updateContactos =  (req,res)=>{

    }

    //Eliminar un contacto
    export const deleteContactos =  (req,res)=>{

    }







