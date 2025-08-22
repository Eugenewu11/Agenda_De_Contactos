import { validateContactos,contactoSchemaUpdate } from '../schemas/contactos.schemas.js'
import contactos from '../db_pruebas/contactosPrueba.json' with {type: 'json'}
import { getAllContactos as getAllContactosDB, getBuscarContacto,insertContacto,updateContacto, deleteContacto as deleteContactoDB} from '../models/contactos.models.js'



//Metodo para devolver todos los contactos
export const getAllContactos = async (req,res) => {
    try {
        const contactosDB = await getAllContactosDB()
        res.json(contactosDB)
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener contactos'
        })
    } 
}

 //Este metodo va a buscar segun lo que se escriba en el searchbar
export const getSearchContacto = async (req,res) => {
    const { nombre } = req.query

        //Si el nombre enviado al searchbar no igual o no existe devolver un error        
        if(!nombre || nombre.trim() === ""){
            res.status(400).json({
                message: 'No se encontró el contacto especificado'
            })
        }

        try {
            const resultados = await getBuscarContacto(nombre)

            //Si no se encontraron coincidencias entonces...
            if(resultados.length === 0){
                return res.status(404).json({
                    message: 'No se encontro el contacto especificado.'
                })
            }
            res.json(resultados)
        } catch (error) {
            res.status(500).json({
            message: 'Error al buscar contactos',
            error: error.message
        })
    }
}

//Crear un contacto
export const createContactos = async (req, res) => {

    const data = req.body

    // Verificar que hay datos en el body
    if (Object.keys(data).length === 0) {
        return res.status(400).json({
        message: 'Se requieren datos para crear el contacto.'
        });
    }
    //Valida los campos que vienen en el body con zod
    const parseResult = validateContactos(data);

    //Si no cumplen con el formato, se envia un error de formato
    if (!parseResult.success) {

        return res.status(400).json({
        errors: parseResult.error.format(), 
        });
    }

    //Variable para almacenar data valida del body
    const contactoValido = parseResult.data; //.data viene del resultado que return la funcion validateContactos()


    try{
        await insertContacto(contactoValido)
        res.status(201).json({
        message: 'Contacto creado exitosamente.',
        contacto: contactoValido
        })
    }catch(error){
        res.status(500).json({
            message: 'Error al crear contacto',
            error: error.message
        })
    }
  
};


//Actualizar un contacto
export const updateContactos = async (req, res) => {
    const { id } = req.params;
    const parsedId = Number(id);

    if (isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
            message: 'El ID debe ser un número positivo.'
        });
    }

    const data = req.body;

    // Verificar que hay datos en el body
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
        message: 'Se requieren datos para actualizar el contacto.'
        });
    }

    const parseResult = contactoSchemaUpdate.safeParse(data)

    if(!parseResult.success){
        return res.status(400).json({
            message: parseResult.error.format()
        })
    }

    const dataValidada = parseResult.data

    try {
        await updateContacto(parsedId,dataValidada)

        res.status(200).json({
            message: 'Contacto actualizado exitosamente.'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar contacto',
            error: error.message
        })
        
    }

};


//Eliminar un contacto
export const deleteContactos = async (req,res)=>{
    const {id} = req.params
    const parseId  = Number(id)

    if(isNaN(parseId) || parseId <= 0){
        return res.status(400).json({
            message: 'El ID debe ser un número positivo.'
        })
    }

    try {
        const result = await deleteContactoDB(parseId)

        res.status(200).json({
            message:'Contacto eliminado exitosamente'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar contacto',
            error: error.message
        })
    }
}







