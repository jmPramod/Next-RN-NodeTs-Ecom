import e from 'express'
import { date } from 'joi'
import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${Date.now()}`)    
  
}})

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedType = /jpeg|jpg|png|webp/

  const extname = allowedType.test(
    file.originalname.toLowerCase()
  )
  const mimetype = allowedType.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'))
  }
}

export const upload=multer({
  storage:storage,
  fileFilter:fileFilter,
  limits:{fileSize:1024*1024*5}//5Mb
})