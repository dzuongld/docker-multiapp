const keys = require('./keys')

// EXPRESS SETUP
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(bodyParser.json())

// POSTGRES SETUP
const { Pool } = require('pg')
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
})

// create a table of seen values
pgClient.on('connect', () => {
    pgClient
        .query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .catch((err) => console.log(err))
})

// REDIS SETUP
const redis = require('redis')

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000, // retry to connect once every 1sec
})

const redisPublisher = redisClient.duplicate()

// EXPRESS ROUTE HANDLERS

app.get('/', (req, res) => {
    res.send('Hi')
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values')
    res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
    // get values from hashes
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})

app.post('/values', async (req, res) => {
    const index = req.body.index

    // place a limit
    if (parseInt(index) > 40) return res.status(422).send('Index too high')

    // place index into redis
    redisClient.hset('values', index, 'Nothing yet')

    // invoke worker on 'insert' to calculate value
    redisPublisher.publish('insert', index)

    // store value of index in Postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

    // notify that calculation is being done
    res.send({ working: true })
})

app.listen(5000, () => console.log('Listening...'))
