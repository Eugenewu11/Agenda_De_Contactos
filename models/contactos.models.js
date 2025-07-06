import db  from '../config/contactos.config.js'

export const getAllContactos = async () => {
    const query = `select c.ContactoID, c.PrimerNombre, c.SegundoNombre, c.Apellidos,c.Telefono, c.Correo 
                    from contactos as c`


    try {
        const resultado = await db.pool.request().query(query)
        return resultado.recordset //Me devuelve el resultado del query

    } catch (error) {
        console.log('Error al obtener contactos: ',error)
        throw error
    }
}

export const getBuscarContacto = async (nombre) => {
    const query = `SELECT 
            ContactoID,
            PrimerNombre,
            SegundoNombre,
            Apellidos,
            Telefono,
            Correo
            FROM contactos
            WHERE 
            LOWER(PrimerNombre) LIKE '%' + LOWER(@nombre) + '%' OR
            LOWER(SegundoNombre) LIKE '%' + LOWER(@nombre) + '%' OR
            LOWER(Apellidos) LIKE '%' + LOWER(@nombre) + '%' `

        try {
            const request = db.pool.request(); //Request a la bd en la que le estoy enviando un parametro llamado nombre
            request.input('nombre', db.sql.VarChar, nombre); // 'nombre' del parametro SQL (@nombre), varchar el tipo de dato que espera, nombre es el valor que le estoy pasando

            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
                console.log('Error al obtener contactos: ',error)
                throw error
        }
}