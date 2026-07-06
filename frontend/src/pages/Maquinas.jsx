import { useState, useEffect } from 'react'
import api from '../services/api'

function Maquinas() {
  const [maquinas, setMaquinas] = useState([])
  const [form, setForm] = useState({
    numero: '',
    corredor: 'A',
    celula: '',
    modelo: '',
  })
  const [maquinaExpandida, setMaquinaExpandida] = useState(null)
  const [referencias, setReferencias] = useState([])
  const [formRef, setFormRef] = useState({ referencia: '' })

  useEffect(() => {
    buscarMaquinas()
  }, [])

  function buscarMaquinas() {
    api.get('/maquinas/')
      .then(resposta => setMaquinas(resposta.data))
      .catch(erro => console.log(erro))
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const numeroFormatado = String(form.numero).padStart(3, '0')
    api.post(`/maquinas/?numero=${numeroFormatado}&corredor=${form.corredor}&celula=${form.celula}&modelo=${form.modelo}`)
      .then(() => {
        buscarMaquinas()
        setForm({ numero: '', corredor: 'A', celula: '', modelo: '' })
      })
      .catch(erro => console.log(erro))
  }

  function corCelula(celula) {
    const cores = {
      'branca':         { background: '#f5f5f5', color: '#444' },
      'amarela':        { background: '#FFF3CD', color: '#856404' },
      'verde':          { background: '#D4EDDA', color: '#155724' },
      'cinza':          { background: '#E2E3E5', color: '#383D41' },
      'azul':           { background: '#CCE5FF', color: '#004085' },
      'cinza com azul': { background: '#CFE2FF', color: '#084298' },
      'roxo':           { background: '#E2D9F3', color: '#432874' },
      'laranja':        { background: '#FFE5D0', color: '#7D3A00' },
    }
    return cores[celula.toLowerCase()] || { background: '#f0f0f0', color: '#555' }
  }

  function toggleReferencias(maquina) {
    if (maquinaExpandida?.id === maquina.id) {
      setMaquinaExpandida(null)
      setReferencias([])
    } else {
      setMaquinaExpandida(maquina)
      api.get(`/referencias/maquina/${maquina.id}`)
        .then(r => setReferencias(r.data))
        .catch(erro => console.log(erro))
    }
  }

  function handleSubmitRef(e) {
    e.preventDefault()
    api.post(`/referencias/?maquina_id=${maquinaExpandida.id}&referencia=${formRef.referencia}`)
      .then(() => {
        api.get(`/referencias/maquina/${maquinaExpandida.id}`)
          .then(r => setReferencias(r.data))
        setFormRef({ referencia: '' })
      })
      .catch(erro => console.log(erro))
  }

  function removerReferencia(id) {
    api.delete(`/referencias/${id}`)
      .then(() => {
        api.get(`/referencias/maquina/${maquinaExpandida.id}`)
          .then(r => setReferencias(r.data))
      })
      .catch(erro => console.log(erro))
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '20px', fontWeight: 500, margin: '0 0 1rem' }}>
        Maquinas
      </h1>

      {/* Formulário */}
      <div style={card}>
        <p style={secao}>Cadastrar nova maquina</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
          <div style={campo}>
            <label style={labelStyle}>Número</label>
            <input
              type="text"
              name="numero"
              value={form.numero}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, '')
                setForm({ ...form, numero: valor })
              }}
              placeholder="Ex: 005"
              maxLength={3}
              required
              style={input}
            />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Corredor</label>
            <select name="corredor" value={form.corredor} onChange={handleChange} style={input}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div style={campo}>
            <label style={labelStyle}>Célula</label>
            <input type="text" name="celula" value={form.celula} onChange={handleChange} placeholder="Ex: azul" style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Modelo</label>
            <input type="text" name="modelo" value={form.modelo} onChange={handleChange} placeholder="Ex: Lonati 400" style={input} />
          </div>
          <button type="submit" style={{ ...botao, display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>add_circle</span>
            Cadastrar
          </button>
        </form>
      </div>

      {/* Lista de maquinas */}
      <div style={{ ...card, marginTop: '1rem' }}>
        <p style={secao}>Maquinas cadastradas ({maquinas.length})</p>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #e0e0e0' }}>
                <th style={th}>Número</th>
                <th style={th}>Corredor</th>
                <th style={th}>Célula</th>
                <th style={th}>Modelo</th>
                <th style={th}>Status</th>
                <th style={th}>Referências</th>
              </tr>
            </thead>
            <tbody>
              {maquinas.length > 0 ? (
                maquinas.map(m => (
                  <>
                    <tr key={m.id} style={{ borderBottom: maquinaExpandida?.id === m.id ? 'none' : '0.5px solid #f0f0f0' }}>
                      <td style={td}><strong>{m.numero}</strong></td>
                      <td style={td}>{m.corredor}</td>
                      <td style={td}>
                        {m.celula ? (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, ...corCelula(m.celula) }}>
                            {m.celula}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={td}>{m.modelo || '—'}</td>
                      <td style={td}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '20px', fontSize: '12px',
                          background: m.status === 'ativa' ? '#EAF3DE' : '#FCEBEB',
                          color: m.status === 'ativa' ? '#3B6D11' : '#A32D2D'
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => toggleReferencias(m)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 12px', fontSize: '12px',
                            background: maquinaExpandida?.id === m.id ? '#E6F1FB' : '#f5f5f5',
                            color: maquinaExpandida?.id === m.id ? '#185FA5' : '#666',
                            border: `0.5px solid ${maquinaExpandida?.id === m.id ? '#B5D4F4' : '#e0e0e0'}`,
                            borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'auto'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: '14px' }}>
                            {maquinaExpandida?.id === m.id ? 'expand_less' : 'expand_more'}
                          </span>
                          {maquinaExpandida?.id === m.id ? 'Fechar' : 'Referências'}
                        </button>
                      </td>
                    </tr>

                    {maquinaExpandida?.id === m.id && (
                      <tr key={`ref-${m.id}`}>
                        <td colSpan="6" style={{ padding: '0', borderBottom: '0.5px solid #B5D4F4' }}>
                          <div style={{ padding: '14px 16px', background: '#EBF4FF' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
                                Nova referência — {m.numero}
                              </span>
                              <input
                                type="text"
                                value={formRef.referencia}
                                onChange={e => setFormRef({ referencia: e.target.value })}
                                placeholder="Ex: 216.02P"
                                style={{ ...input, maxWidth: '180px', padding: '5px 10px', fontSize: '13px' }}
                                onKeyDown={e => e.key === 'Enter' && handleSubmitRef(e)}
                              />
                              <button
                                onClick={handleSubmitRef}
                                style={{ ...botao, padding: '5px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto' }}
                              >
                                <span className="material-icons" style={{ fontSize: '16px' }}>add</span>
                                Adicionar
                              </button>
                            </div>

                            {referencias.length > 0 ? (
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {referencias.map(r => (
                                  <div key={r.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 12px', background: '#fff',
                                    border: '0.5px solid #B5D4F4', borderRadius: '20px',
                                    fontSize: '13px', color: '#185FA5', fontWeight: 500
                                  }}>
                                    <span>{r.referencia}</span>
                                    <button
                                      onClick={() => removerReferencia(r.id)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0', display: 'flex', alignItems: 'center', width: 'auto' }}
                                    >
                                      <span className="material-icons" style={{ fontSize: '16px' }}>close</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                                Nenhuma referência cadastrada ainda
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    Nenhuma máquina cadastrada ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

const card = { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem' }
const secao = { fontSize: '14px', fontWeight: 500, color: '#555', margin: '0 0 1rem' }
const campo = { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px', flex: '1' }
const labelStyle = { fontSize: '12px', color: '#888' }
const input = { padding: '8px 10px', borderRadius: '8px', border: '0.5px solid #e0e0e0', fontSize: '14px', outline: 'none', width: '100%' }
const botao = { padding: '8px 16px', backgroundColor: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
const th = { textAlign: 'left', padding: '8px 10px', color: '#888', fontWeight: 500, whiteSpace: 'nowrap' }
const td = { padding: '10px 10px', color: '#1a1a2e' }

export default Maquinas
