import { Router } from 'express'
import{
    getContacto,
    searchByName,
    createContact,
    updateContact,
    deleteContact,
    getAll
} from '../controllers/contacto.controller.js'

const contactRouter = Router()

contactRouter.get('/',(req,res)=>{
    getAll(req,res)
})

contactRouter.get('/',getContacto)

contactRouter.get('/:nombre',searchByName)

contactRouter.post('/',createContact)

contactRouter.patch('/',updateContact)

contactRouter.delete('/',deleteContact)

export default contactRouter