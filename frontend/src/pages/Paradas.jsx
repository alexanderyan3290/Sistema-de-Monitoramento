import { useState, useEffect } from 'react'
import api from '../services/api'

function Paradas() {
  const [paradas, setParadas] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [agora, setAgora] = useState(new Date())
  const [form, setForm] = useState({
    maquina_id: '',
    motivo: '',
    inicio: new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 16)
  })
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    buscarParadas()
    api.get('/maquinas/').then(r => setMaquinas(r.data))

    const intervalo = setInterval(() => buscarParadas(), 30000)
    const timer = setInterval(() => setAgora(new Date()), 1000)

    return () => {
      clearInterval(intervalo)
      clearInterval(timer)
    }
  }, [])

  function buscarParadas() {
    api.get('/paradas/').then(r => setParadas(r.data))
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    api.post(`/paradas/?maquina_id=${form.maquina_id}&motivo=${form.motivo}&inicio=${form.inicio}`)
      .then(() => {
        buscarParadas()
        setForm({ maquina_id: '', motivo: '', inicio: new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 16) })
        setMensagem('Parada registrada com sucesso!')
        setTimeout(() => setMensagem(''), 3000)
      })
      .catch(erro => console.log(erro))
  }

  function finalizarParada(id) {
    api.put(`/paradas/${id}/finalizar`)
      .then(() => buscarParadas())
      .catch(erro => console.log(erro))
  }

  function nomeMaquina(id) {
    const m = maquinas.find(m => m.id === id)
    return m ? m.numero : id
  }

  function formatarData(data) {
    if (!data) return '—'
    return new Date(data).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  }

  function calcularTempo(inicio) {
    const inicioUTC = new Date(inicio)
    const agoraUTC = new Date(agora.getTime())
    const diff = agoraUTC - inicioUTC
    if (diff < 0) return '0s'
    const totalSegundos = Math.floor(diff / 1000)
    const horas = Math.floor(totalSegundos / 3600)
    const minutos = Math.floor((totalSegundos % 3600) / 60)
    const segundos = totalSegundos % 60
    if (horas > 0) return `${horas}h ${minutos}min ${segundos}s`
    if (minutos > 0) return `${minutos}min ${segundos}s`
    return `${segundos}s`
  }

  const paradasAbertas = paradas.filter(p => !p.fim)
  const paradasFechadas = paradas.filter(p => p.fim)

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 1.5rem' }}>
        Paradas
      </h1>

      {/* Formulário */}
      <div style={card}>
        <p style={secao}>Registrar nova parada</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={campo}>
            <label style={labelStyle}>Maquina</label>
            <select name="maquina_id" value={form.maquina_id} onChange={handleChange} required style={input}>
              <option value="">Selecione...</option>
              {maquinas.map(m => (
                <option key={m.id} value={m.id}>{m.numero} — Corredor {m.corredor}</option>
              ))}
            </select>
          </div>
          <div style={campo}>
            <label style={labelStyle}>Motivo</label>
            <input type="text" name="motivo" value={form.motivo} onChange={handleChange} placeholder="Ex: Entupimento" required style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Início</label>
            <input type="datetime-local" name="inicio" value={form.inicio} onChange={handleChange} required style={input} />
          </div>
          <button type="submit" style={{ ...botao, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>add_circle</span>
            Registrar parada
          </button>
        </form>
        {mensagem && (
          <p style={{ marginTop: '12px', color: '#3B6D11', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
            {mensagem}
          </p>
        )}
      </div>

      {/* Paradas abertas */}
      <div style={{ ...card, marginTop: '1.5rem' }}>
        <p style={{ ...secao, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ fontSize: '18px', color: '#A32D2D' }}>warning</span>
          Maquinas paradas agora ({paradasAbertas.length})
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <th style={th}>Maquina</th>
              <th style={th}>Motivo</th>
              <th style={th}>Início</th>
              <th style={th}>Tempo parado</th>
              <th style={th}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {paradasAbertas.length > 0 ? (
              paradasAbertas.map(p => (
                <tr key={p.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                  <td style={td}><strong>{nomeMaquina(p.maquina_id)}</strong></td>
                  <td style={td}>{p.motivo || '—'}</td>
                  <td style={td}>{formatarData(p.inicio)}</td>
                  <td style={td}>
                    <span style={{ color: '#A32D2D', fontWeight: 500 }}>
                      {calcularTempo(p.inicio)}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => finalizarParada(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 12px',
                        background: '#EAF3DE',
                        color: '#3B6D11',
                        border: '0.5px solid #A3D48A',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '14px' }}>check_circle</span>
                      Finalizar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '20px', color: '#3B6D11' }}>check_circle</span>
                    Nenhuma maquina parada no momento
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Histórico */}
      <div style={{ ...card, marginTop: '1.5rem' }}>
        <p style={{ ...secao, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons" style={{ fontSize: '18px', color: '#555' }}>history</span>
          Histórico de paradas ({paradasFechadas.length})
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <th style={th}>Maquina</th>
              <th style={th}>Motivo</th>
              <th style={th}>Início</th>
              <th style={th}>Fim</th>
              <th style={th}>Tempo parado</th>
            </tr>
          </thead>
          <tbody>
            {paradasFechadas.length > 0 ? (
              paradasFechadas.map(p => (
                <tr key={p.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                  <td style={td}><strong>{nomeMaquina(p.maquina_id)}</strong></td>
                  <td style={td}>{p.motivo || '—'}</td>
                  <td style={td}>{formatarData(p.inicio)}</td>
                  <td style={td}>{formatarData(p.fim)}</td>
                  <td style={td}>{p.tempo_parado ? `${p.tempo_parado} min` : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  Nenhuma parada registrada ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

const card = { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem' }
const secao = { fontSize: '14px', fontWeight: 500, color: '#555', margin: '0 0 1rem' }
const campo = { display: 'flex', flexDirection: 'column', gap: '4px' }
const labelStyle = { fontSize: '12px', color: '#888' }
const input = { padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #e0e0e0', fontSize: '14px', outline: 'none', minWidth: '150px' }
const botao = { padding: '8px 20px', backgroundColor: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
const th = { textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 500 }
const td = { padding: '10px 12px', color: '#1a1a2e' }

export default Paradas
