const {getConexion, sql} = require('../database/database.js')

export const getContacto = async (req,res) => {
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
}

export const searchByName = async (req,res)=>{

}

export const createContact = async (req,res)=>{

}

export const updateContact = async (req,res)=>{

}

export const deleteContact = async (req,res)=>{

}

