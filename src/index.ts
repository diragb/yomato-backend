// Packages:
import express from 'express'
import cors from 'cors'
import getRestaurant from './functions/getRestaurant'

// Constants:
const port = process.env['PORT'] || 8080
const app = express()

// Configurations:
app.use(cors({
  credentials: true,
}))

// Routes:
app.get('/restaurant', getRestaurant)

// Initialization:
app.listen(port, () => {
  console.log(`Yomato API listening on port ${port}`)
})
