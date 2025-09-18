import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import Dashboard from "./pages/Dashboard/Dashboard"



function App() {
  
  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
         <Route path='/about' element={<About/>}/>
        <Route path='/dashboard/*' element={<Dashboard/>}/>

      </Routes>
    </>
  )
}

export default App
