import { Router } from 'express'
import{
    getAllContactos,
    getSearchContacto,
    createContactos,
    updateContactos,
    deleteContactos
} from '../controllers/contacto.controller.js'

const contactRouter = Router()

contactRouter.get('/',(req,res)=>{
    getAllContactos(req,res)
})

contactRouter.get('/search',getSearchContacto)

contactRouter.post('/',createContactos)

contactRouter.patch('/:id',updateContactos)

contactRouter.delete('/:id',deleteContactos)

export default contactRouter