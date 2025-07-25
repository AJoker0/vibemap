import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibemap'
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // В режиме разработки используем глобальную переменную для сохранения
  // подключения между hot reloads
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // В продакшене создаем новое подключение для каждого запроса
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Утилита для подключения к базе данных
export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db('vibemap')
  return { client, db }
}
