const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

var morgan = require('morgan')
morgan.token('request-data', function (req, res) { return JSON.stringify({}) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-data'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
app.get('/info', (request, response) => {
const currentTime = new Date();
response.send(`<p>Phonebook has info for ${persons.length} people </p><p>${currentTime}</p>`)
})

app.get('/api/persons', (request, response) => {
    morgan.token('request-data', function (req, res) { return JSON.stringify(persons) })
    response.end(JSON.stringify(persons))
})

app.get('/api/persons/:id', (request, response) => {

const id = Number(request.params.id)
const person = persons.find(person => person.id === id)

if (person) {
    morgan.token('request-data', function (req, res) { return JSON.stringify(person) })
    response.json(person)
    } else {
    response.status(404).end()
    }
})


app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})


const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}
  
app.post('/api/persons', (request, response) => {
    const body = request.body
    const person = {}
    if (!body) {
        return response.status(400).json({ error: 'content missing' })
    } else if((!body.name || body.name.trim() === '') || (!body.number || body.number.trim() === '')){
        return response.status(400).json({ error: 'name and number are mandatory' })
    } else if(persons.some(item => item.name.toLowerCase() === body.name.toLowerCase())){
        return response.status(400).json({ error: 'name must be unique'})
    } else {
        const person = {
            id: generateId(),
            name: body.name,
            number: body.number,
        }
        persons = persons.concat(person)
        response.json(person)
        morgan.token('request-data', function (req, res) { return JSON.stringify(person) })
    }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})