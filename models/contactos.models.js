
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

export const insertContacto = async (contacto) => {
    const conn = await db.poolConnect()
    const transaccion = new db.sql.Transaction(conn)

    try {
        await transaccion.begin()

        const request = new db.sql.Request(transaccion)

        //Desestructurar el contenido del body
        const {primerNombre,segundoNombre,apellidos,telefono,correo} = contacto

        request.input('PrimerNombre',db.sql.VarChar, primerNombre)
        request.input('SegundoNombre',db.sql.VarChar, segundoNombre)
        request.input('Apellidos',db.sql.VarChar, apellidos)
        request.input('Telefono',db.sql.VarChar, telefono)
        request.input('Correo',db.sql.VarChar, correo)

        const resultado = await request.query(`
            INSERT INTO contactos (PrimerNombre,SegundoNombre,Apellidos,Telefono,Correo)
            OUTPUT INSERTED.ContactoID
            VALUES (@PrimerNombre,@SegundoNombre,@Apellidos,@Telefono,@Correo)
            `)

        await transaccion.commit() //Aqui ya se realiza la transaccion
        contacto.id = resultado.recordset[0].ContactoID //obtener los resultados del ultimo contacto agregado
        return contacto

    } catch (error) {
        await transaccion.rollback()
        throw error
    }
    //No se necesita cerrar la conexion a la bd porque pool ya lo administra automaticamente. 
}

export const updateContacto = async (id, contacto) => {
    const conn = db.poolConnect()
    const transaccion = new db.sql.Transaction(conn)

    try {
        await transaccion.begin()

        const request = new db.sql.Request(transaccion)

        const {primerNombre,segundoNombre,apellidos,telefono,correo} = contacto

        //Definicion de parametros
        request.input('id', db.sql.Int,id)
        request.input('PrimerNombre',db.sql.VarChar, primerNombre)
        request.input('SegundoNombre',db.sql.VarChar, segundoNombre)
        request.input('Apellidos',db.sql.VarChar, apellidos)
        request.input('Telefono',db.sql.VarChar, telefono)
        request.input('Correo',db.sql.VarChar, correo)

        const resultado = await request.query(`
            UPDATE contactos SET
                PrimerNombre = @PrimerNombre,
                SegundoNombre = @SegundoNombre,
                Apellidos = @Apellidos,
                Telefono = @Telefono,
                Correo = @Correo
            WHERE ContactoID = @id
            `)

            await transaccion.commit()
            return {
                id,primerNombre,segundoNombre,apellidos,telefono,correo
            }
    } catch (error) {
        await transaccion.rollback()
        throw error
    }
}

export const deleteContacto = async (id) => {
    const conn = db.sql.connect()
    const transaccion = db.sql.Transaction(conn)

    try {
        await transaccion.begin()

        const request = new db.sql.Request(transaccion)
        request.input('id', db.sql.Int,id)

        const resultado = await request.query(`
            DELETE FROM contactos WHERE ContactoID = @id
            `)

        await transaccion.commit()

        //Devuelve 0 si no se elimino, 1 si se elimino
        return resultado.rowsAffected[0]

    } catch (error) {
        transaccion.rollback()
        throw error
    }
}