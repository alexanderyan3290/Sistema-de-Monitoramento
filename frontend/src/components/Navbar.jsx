import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false)

  const links = [
    { to: '/', label: 'Painel', end: true },
    { to: '/maquinas', label: 'Maquinas' },
    { to: '/producao', label: 'Produção' },
    { to: '/produtos', label: 'Produtos' },
    { to: '/paradas', label: 'Paradas' },
    { to: '/relatorios', label: 'Relatórios' },
  ]

  return (
    <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '15px 20px',
        gap: '12px'
      }}>

        {/* Logo — esquerda */}
        <img
          src="https://mash.vtexassets.com/assets/vtex.file-manager-graphql/images/8247d099-2666-4eb2-a4f4-536dce9b53c2___8e33f1c74905dbbed007c5accd5c8949.svg"
          alt="Logo"
          height="24"
        />

        {/* Links — centro no desktop */}
        <div className="nav-desktop" style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center'
        }}>
          {links.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => isActive ? linkAtivo : linkStyle}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Hamburguer — mobile */}
        <button
          className="nav-hamburguer"
          onClick={() => setMenuAberto(!menuAberto)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'none', marginLeft: 'auto' }}
        >
          <span className="material-icons" style={{ fontSize: '28px', color: '#1a1a2e' }}>
            {menuAberto ? 'close' : 'menu'}
          </span>
        </button>

      </div>

      {/* Menu mobile aberto */}
      {menuAberto && (
        <div style={{ padding: '8px 16px 16px', borderTop: '0.5px solid #e0e0e0' }}>
          {links.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuAberto(false)}
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '16px',
                textDecoration: 'none',
                color: isActive ? '#185FA5' : '#1a1a2e',
                background: isActive ? '#E6F1FB' : 'transparent',
                fontWeight: isActive ? '500' : '400',
                marginBottom: '4px'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

    </nav>
  )
}

const linkStyle = { color: '#a0aec0', textDecoration: 'none', fontSize: '18px', padding: '6px 10px', borderRadius: '6px' }
const linkAtivo = { color: '#1a1a2e', textDecoration: 'none', fontSize: '20px', padding: '6px 10px', borderRadius: '6px', fontWeight: '500', borderBottom: '2px solid #185FA5' }

export default Navbar
