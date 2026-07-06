import { useState, useEffect } from 'react'
import api from '../services/api'

function Producao() {
  const [maquinas, setMaquinas] = useState([])
  const [turnos, setTurnos] = useState([])
  const [turnoSelecionado, setTurnoSelecionado] = useState('')
  const [corredorFiltro, setCorredorFiltro] = useState('Todos')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [lancamentos, setLancamentos] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [avisos, setAvisos] = useState({})

  useEffect(() => {
    api.get('/maquinas/').then(r => setMaquinas(r.data))
    api.get('/turnos/').then(r => {
      setTurnos(r.data)
      if (r.data.length > 0) setTurnoSelecionado(r.data[0].id)
    })
  }, [])

  const maquinasFiltradas = maquinas.filter(m =>
    corredorFiltro === 'Todos' ? true : m.corredor === corredorFiltro
  )

  async function verificarReferencia(maquinaId, referencia) {
    if (!referencia) return null
    try {
      const resposta = await api.get(`/referencias/verificar?maquina_id=${maquinaId}&referencia=${referencia}`)
      return resposta.data
    } catch (erro) {
      return null
    }
  }

  async function handleLancamento(maquinaId, campo, valor) {
    setLancamentos(prev => ({
      ...prev,
      [maquinaId]: { ...prev[maquinaId], [campo]: valor }
    }))
    if (campo === 'referencia' && valor.length > 3) {
      const resultado = await verificarReferencia(maquinaId, valor)
      if (resultado) setAvisos(prev => ({ ...prev, [maquinaId]: resultado }))
    }
  }

  async function salvarTudo() {
    setSalvando(true)
    setMensagem('')
    let salvos = 0
    for (const maquinaId in lancamentos) {
      const l = lancamentos[maquinaId]
      if (l.producao && l.producao > 0) {
        try {
          await api.post(`/leituras/manual?maquina_id=${maquinaId}&turno_id=${turnoSelecionado}&producao=${l.producao || 0}&tempo_parada=${l.tempo_parada || 0}&referencia=${l.referencia || ''}&tamanho=${l.tamanho || ''}&cor=${l.cor || ''}&tempo_meia=${l.tempo_meia || 0}`)
          salvos++
        } catch (erro) {
          console.log(erro)
        }
      }
    }
    setSalvando(false)
    setMensagem(`✅ ${salvos} registros salvos com sucesso!`)
    setLancamentos({})
    setAvisos({})
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '20px', fontWeight: 500, margin: '0 0 1rem' }}>
        Lançamento de produção
      </h1>

      {/* Filtros */}
      <div style={card}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
          <div style={campo}>
            <label style={labelStyle}>Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Turno</label>
            <select value={turnoSelecionado} onChange={e => setTurnoSelecionado(e.target.value)} style={input}>
              {turnos.length > 0 ? (
                turnos.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.hora_inicio} - {t.hora_fim})
                  </option>
                ))
              ) : (
                <option value="">Carregando...</option>
              )}
            </select>
          </div>
          <div style={campo}>
            <label style={labelStyle}>Corredor</label>
            <select value={corredorFiltro} onChange={e => setCorredorFiltro(e.target.value)} style={input}>
              <option value="Todos">Todos</option>
              <option value="A">Corredor A</option>
              <option value="B">Corredor B</option>
              <option value="C">Corredor C</option>
            </select>
          </div>
          <button
            onClick={salvarTudo}
            disabled={salvando}
            style={{ ...botao, display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', alignSelf: 'flex-end' }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>save</span>
            {salvando ? 'Salvando...' : 'Salvar tudo'}
          </button>
        </div>
        {mensagem && (
          <p style={{ marginTop: '12px', color: '#3B6D11', fontSize: '14px' }}>{mensagem}</p>
        )}
      </div>

      {/* Tabela */}
      <div style={{ ...card, marginTop: '1rem' }}>
        <p style={secao}>
          Maquinas ({maquinasFiltradas.length})
          {corredorFiltro !== 'Todos' && ` — Corredor ${corredorFiltro}`}
        </p>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <th style={th}>Maquina</th>
                <th style={th}>Corredor</th>
                <th style={th}>Status</th>
                <th style={th}>Referência</th>
                <th style={th}>Tamanho</th>
                <th style={th}>Cor</th>
                <th style={th}>Produção (meias)</th>
                <th style={th}>Tempo parada (min)</th>
                <th style={th}>Tempo/meia (seg)</th>
              </tr>
            </thead>
            <tbody>
              {maquinasFiltradas.length > 0 ? (
                maquinasFiltradas.map(m => (
                  <tr key={m.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                    <td style={td}><strong>{m.numero}</strong></td>
                    <td style={td}>{m.corredor}</td>
                    <td style={td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: m.status === 'ativa' ? '#EAF3DE' : '#FCEBEB',
                        color: m.status === 'ativa' ? '#3B6D11' : '#A32D2D'
                      }}>
                        <span className="material-icons" style={{ fontSize: '12px' }}>
                          {m.status === 'ativa' ? 'check_circle' : 'warning'}
                        </span>
                        {m.status}
                      </span>
                    </td>
                    <td style={td}>
                      <input type="text" placeholder="Ex: 216.02"
                        value={lancamentos[m.id]?.referencia ?? m.referencia ?? ''}
                        onChange={e => handleLancamento(m.id, 'referencia', e.target.value)}
                        style={{ ...input, width: '90px', borderColor: avisos[m.id]?.valida === false ? '#A32D2D' : '#e0e0e0' }}
                      />
                      {avisos[m.id]?.valida === false && (
                        <p style={{ fontSize: '11px', color: '#A32D2D', margin: '2px 0 0' }}>⚠️ Fora!</p>
                      )}
                      {avisos[m.id]?.valida === true && (
                        <p style={{ fontSize: '11px', color: '#3B6D11', margin: '2px 0 0' }}>✅ OK</p>
                      )}
                    </td>
                    <td style={td}>
                      <input type="text" placeholder="Ex: 34/38"
                        value={lancamentos[m.id]?.tamanho ?? m.tamanho ?? ''}
                        onChange={e => handleLancamento(m.id, 'tamanho', e.target.value)}
                        style={{ ...input, width: '80px' }} />
                    </td>
                    <td style={td}>
                      <input type="text" placeholder="Ex: C205"
                        value={lancamentos[m.id]?.cor ?? m.cor ?? ''}
                        onChange={e => handleLancamento(m.id, 'cor', e.target.value)}
                        style={{ ...input, width: '80px' }} />
                    </td>
                    <td style={td}>
                      <input type="number" placeholder="0"
                        value={lancamentos[m.id]?.producao || ''}
                        onChange={e => handleLancamento(m.id, 'producao', e.target.value)}
                        style={{ ...input, width: '90px' }} />
                    </td>
                    <td style={td}>
                      <input type="number" placeholder="0"
                        value={lancamentos[m.id]?.tempo_parada || ''}
                        onChange={e => handleLancamento(m.id, 'tempo_parada', e.target.value)}
                        style={{ ...input, width: '90px' }} />
                    </td>
                    <td style={td}>
                      <input type="number" placeholder="0"
                        value={lancamentos[m.id]?.tempo_meia || ''}
                        onChange={e => handleLancamento(m.id, 'tempo_meia', e.target.value)}
                        style={{ ...input, width: '90px' }} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
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
const campo = { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '130px', flex: '1' }
const labelStyle = { fontSize: '12px', color: '#888' }
const input = { padding: '8px 10px', borderRadius: '8px', border: '0.5px solid #e0e0e0', fontSize: '14px', outline: 'none', width: '100%' }
const botao = { padding: '8px 16px', backgroundColor: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
const th = { textAlign: 'left', padding: '8px 10px', color: '#888', fontWeight: 500, whiteSpace: 'nowrap' }
const td = { padding: '8px 10px', color: '#1a1a2e' }

export default Producao
