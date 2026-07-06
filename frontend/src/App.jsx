import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Maquinas from './pages/Maquinas'
import Producao from './pages/Producao'
import Produtos from './pages/Produtos'
import Paradas from './pages/Paradas'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/maquinas" element={<Maquinas />} />
          <Route path="/producao" element={<Producao />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/paradas" element={<Paradas />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
