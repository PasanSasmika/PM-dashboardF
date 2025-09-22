import { Route, Routes } from "react-router-dom"
import Dashboard from "./pages/Dashboard/Dashboard"
import Login from "./pages/auth/login"
import Signup from "./pages/auth/signup"



function App() {
  
  return (
    <>
      <Routes>
        <Route path='/dashboard/*' element={<Dashboard/>}/>
        <Route path='/' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Routes>
    </>
  )
}

export default App
