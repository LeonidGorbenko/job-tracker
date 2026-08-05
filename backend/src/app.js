import express from 'express'
import applicationsRouter from './routes/applications.js'

const app = express()

app.use(express.json())

app.get('/api/health', (request, response) => {
  void request

  response.status(200).json({
    status: 'ok',
    service: 'job-tracker-api',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/applications', applicationsRouter)

app.use((request, response) => {
  void request

  response.status(404).json({
    message: 'Route not found',
  })
})

app.use((error, request, response, next) => {
  void request
  void next

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    response.status(400).json({
      message: 'Invalid JSON request body',
    })
    return
  }

  console.error(error)

  response.status(500).json({
    message: 'Internal server error',
  })
})

export default app
