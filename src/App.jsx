import { Route, Routes } from "react-router-dom"
import Dashboard from "./pages/Dashboard/Dashboard"
import Login from "./pages/auth/login"
import Signup from "./pages/auth/signup"
import { useEffect, useState } from "react";



function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
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
