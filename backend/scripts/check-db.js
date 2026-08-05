import { closePool, query } from '../src/db.js'

async function checkDatabaseConnection() {
  let exitCode = 0

  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set.')
      console.error('Set DATABASE_URL before running npm run db:check.')
      exitCode = 1
    } else {
      const result = await query('SELECT NOW() AS database_time')
      const databaseTime = result.rows[0].database_time

      console.log('Database connection successful.')
      console.log('Database time: ' + databaseTime.toISOString())
    }
  } catch (error) {
    console.error('Database connection failed.')
    console.error(error.message || String(error))
    exitCode = 1
  } finally {
    await closePool()
  }

  return exitCode
}

const exitCode = await checkDatabaseConnection()

process.exit(exitCode)
