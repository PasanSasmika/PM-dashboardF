import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>Home
       <Link to="/about"> <h1>Go to about</h1></Link> 
    </div>
  )
}

export default Home