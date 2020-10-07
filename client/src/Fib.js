import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Fib = () => {
    const [seenIndexes, setSeenIndexes] = useState([])
    const [values, setValues] = useState({})
    const [index, setIndex] = useState('')

    const fetchValues = async () => {
        const values = await axios.get('/api/values/current')
        setValues(values.data)
    }

    const fetchIndexes = async () => {
        const seenIndexes = await axios.get('/api/values/all')
        setSeenIndexes(seenIndexes.data)
    }

    useEffect(() => {
        fetchValues()
        fetchIndexes()
    }, [])

    const renderValues = () => {
        const entries = []

        for (const key in values) {
            entries.push(
                <div key={key}>
                    Index {key} returns {values[key]}
                </div>
            )
        }

        return entries
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        await axios.post('/api/values', { index })
        setIndex('')
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Enter your index:</label>
                <input
                    value={index}
                    onChange={(e) => setIndex(e.target.value)}
                />
                <button>Submit</button>

                <h3>Indexes I have seen:</h3>
                {seenIndexes.map(({ number }) => number).join(', ')}

                <h3>Calculated values:</h3>
                {renderValues()}
            </form>
        </div>
    )
}

export default Fib
