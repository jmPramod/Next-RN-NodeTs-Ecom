import 'dotenv/config'
import { app } from './server'

 
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)    
})