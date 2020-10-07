const keys = require('./keys')
const redis = require('redis')

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000, // retry to connect once every 1sec
})

const subscription = redisClient.duplicate()

// unoptimal solution to demonstrate workers
const fib = (index) => {
    if (index < 2) return 1
    return fib(index - 1) + fib(index - 2)
}

subscription.on('message', (channel, message) => {
    // calculate new fib when there is a new value in redis
    redisClient.hset('values', message, fib(parseInt(message)))
})

// add listener for 'insert' events
subscription.subscribe('insert')
