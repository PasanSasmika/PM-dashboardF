import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import Dashboard from "./pages/Dashboard/Dashboard"
import Login from "./pages/auth/login"
import Signup from "./pages/auth/signup"



function App() {
  
  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
         <Route path='/about' element={<About/>}/>
        <Route path='/dashboard/*' element={<Dashboard/>}/>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Routes>
    </>
  )
}

export default App
