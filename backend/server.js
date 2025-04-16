const http = require('http')
const url = require('url')
const fs = require('fs')

const PORT = 3000
const USERS_PATH = './users.json'

let users = []

try {
  const data = fs.readFileSync(USERS_PATH, 'utf-8')
  users = JSON.parse(data)
  console.log(`📦 Загружено ${users.length} пользователей из ${USERS_PATH}`)
} catch (err) {
  console.error('❌ Не удалось загрузить файл users.json. Сначала запусти generateUsers.js')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const parsedUrl = url.parse(req.url, true)
  const { pathname, query } = parsedUrl

  // GET /users?page=1&limit=20
  if (pathname === '/users' && req.method === 'GET') {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20

    const start = (page - 1) * limit
    const end = start + limit

    const paginatedUsers = users.slice(start, end)
    const totalPages = Math.ceil(users.length / limit)

    const response = {
      page,
      limit,
      total: users.length,
      totalPages,
      data: paginatedUsers
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(response, null, 2))
    return
  }

  // PUT /users/:id
  if (pathname.startsWith('/users/') && req.method === 'PUT') {
    const id = pathname.split('/')[2]

    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const updatedData = JSON.parse(body)
        const index = users.findIndex(u => String(u.id) === String(id))

        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'User not found' }))
          return
        }

        users[index] = { ...users[index], ...updatedData }

        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8')

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(users[index], null, 2))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
    return
  }

  // DELETE /users/:id
  if (pathname.startsWith('/users/') && req.method === 'DELETE') {
    const id = pathname.split('/')[2]

    const index = users.findIndex(u => String(u.id) === String(id))

    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'User not found' }))
      return
    }

    const deletedUser = users.splice(index, 1)[0]

    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8')

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'User deleted', user: deletedUser }, null, 2))
    return
  }

  // Неизвестный маршрут
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found' }))
})

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`)
})