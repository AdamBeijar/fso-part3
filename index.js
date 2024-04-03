require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")
const app = express()

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint"})
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if(error.name === "CastError") {
        return res.status(400).send({error: "malformatted id"})
    } else if(error.name === "ValidationError") {
        return res.status(400).json({error: error.message})
    }

    next(error)
}

app.use(express.json())

morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

app.use(cors())

app.use(express.static("dist"))

app.use(errorHandler)

app.get("/api/persons", (req, res, next) => {
    Person.find({}).then(result => {
        res.json(result)
    }).catch(error => next(error))
})

app.get("/api/persons/:id", (req, res, next) => {
    const id = req.params.id
    Person.findById(id).then(result => {
        if(result) {
            res.json(result)
        } else {
            res.status(404).end()
        }
    }).catch(error => {
        console.log(error)
        res.status(400).send({error: "malformatted id"})
    })
})

app.get("/info", (req, res, next) => {
    const date = new Date()
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
})

app.delete("/api/persons/:id", (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndDelete(id).then(result => {
        res.status(204).end()
    }).catch(error => next(error))
})

app.post("/api/persons", (req, res, next) => {
    const body = req.body

    if(!body.name || !body.number) {
        return res.status(400).json({
            error: "name or number is missing"
        })
    }

    let persons = []

    Person.find({}).then(result => {
        persons = result
    }).catch(error => next(error))

    if(persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: "name must be unique"
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    }).catch(error => next(error))
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


