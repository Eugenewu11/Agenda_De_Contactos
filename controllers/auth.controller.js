import jwt from 'jsonwebtoken'


export const login = (req,res)  => {
    const data = {
        id: 13123,
        name: 'Eugene Wu',
        email: 'eugene.wu@unah.hn',
        password: '>?Y$a~L_nL23#k:0FQ',
        role: 'admin'
    }

    const payload = {
        id: data.id,
        role:  data.role
    }

    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        algorithm: 'HS256',
        expiresIn: '1h'
    })

    delete data.password

    res.json({
        success:true,
        message: 'Usuario cargado correctamente',
        data: data,
        token
    })

}