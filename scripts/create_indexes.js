// Скрипт для создания уникального индекса username в MongoDB
// Запустите этот код в MongoDB Compass или через mongo shell

db.users.createIndex(
  { username: 1 }, 
  { 
    unique: true,
    name: "username_unique_index"
  }
)

console.log("✅ Unique index created for username field")

// Также можно добавить индекс для email
db.users.createIndex(
  { email: 1 }, 
  { 
    unique: true,
    name: "email_unique_index"
  }
)

console.log("✅ Unique index created for email field")
