import { useState, useEffect } from 'react'
import api from '../services/api'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [form, setForm] = useState({
    referencia: '',
    nome: '',
    tamanho_letra: '',
    tamanho_numerico: '',
    publico: 'masculino',
    descricao: ''
  })
  const [mensagem, setMensagem] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    buscarProdutos()
  }, [])

  function buscarProdutos() {
    api.get('/produtos/').then(r => setProdutos(r.data))
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    api.post(`/produtos/?referencia=${form.referencia}&nome=${form.nome}&tamanho_letra=${form.tamanho_letra}&tamanho_numerico=${form.tamanho_numerico}&publico=${form.publico}&descricao=${form.descricao}`)
      .then(() => {
        buscarProdutos()
        setForm({ referencia: '', nome: '', tamanho_letra: '', tamanho_numerico: '', publico: 'masculino', descricao: '' })
        setMensagem('Produto cadastrado com sucesso!')
        setTimeout(() => setMensagem(''), 3000)
      })
      .catch(erro => console.log(erro))
  }

  const produtosFiltrados = produtos.filter(p =>
    p.referencia.toLowerCase().includes(busca.toLowerCase()) ||
    (p.nome && p.nome.toLowerCase().includes(busca.toLowerCase()))
  )

  function corPublico(publico) {
    const cores = {
      'masculino': { background: '#CCE5FF', color: '#004085' },
      'feminino':  { background: '#F8D7DA', color: '#721C24' },
      'infantil':  { background: '#D4EDDA', color: '#155724' },
      'unissex':   { background: '#FFF3CD', color: '#856404' },
    }
    return cores[publico] || { background: '#f0f0f0', color: '#555' }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '20px', fontWeight: 500, margin: '0 0 1rem' }}>
        Catálogo de Produtos
      </h1>

      {/* Formulário */}
      <div style={card}>
        <p style={secao}>Cadastrar nova referência</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
          <div style={campo}>
            <label style={labelStyle}>Referência</label>
            <input type="text" name="referencia" value={form.referencia} onChange={handleChange} placeholder="Ex: 216.02P" required style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Nome</label>
            <input type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Sapatilha" style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Tamanho (letra)</label>
            <input type="text" name="tamanho_letra" value={form.tamanho_letra} onChange={handleChange} placeholder="Ex: R, M, P" style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Tamanho (numérico)</label>
            <input type="text" name="tamanho_numerico" value={form.tamanho_numerico} onChange={handleChange} placeholder="Ex: 39-43" required style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Público</label>
            <select name="publico" value={form.publico} onChange={handleChange} style={input}>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="infantil">Infantil</option>
              <option value="unissex">Unissex</option>
            </select>
          </div>
          <div style={campo}>
            <label style={labelStyle}>Descrição</label>
            <input type="text" name="descricao" value={form.descricao} onChange={handleChange} placeholder="Opcional" style={input} />
          </div>
          <button type="submit" style={{ ...botao, display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>add_circle</span>
            Cadastrar
          </button>
        </form>
        {mensagem && (
          <p style={{ marginTop: '12px', color: '#3B6D11', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
            {mensagem}
          </p>
        )}
      </div>

      {/* Lista */}
      <div style={{ ...card, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ ...secao, margin: 0 }}>Produtos cadastrados ({produtosFiltrados.length})</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '0.5px solid #e0e0e0', borderRadius: '8px', padding: '6px 12px', flex: 1, maxWidth: '300px', minWidth: '160px' }}>
            <span className="material-icons" style={{ fontSize: '18px', color: '#888' }}>search</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <th style={th}>Referência</th>
                <th style={th}>Nome</th>
                <th style={th}>Tamanho letra</th>
                <th style={th}>Tamanho numérico</th>
                <th style={th}>Público</th>
                <th style={th}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length > 0 ? (
                produtosFiltrados.map(p => (
                  <tr key={p.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                    <td style={td}><strong>{p.referencia}</strong></td>
                    <td style={td}>{p.nome || '—'}</td>
                    <td style={td}>{p.tamanho_letra || '—'}</td>
                    <td style={td}>{p.tamanho_numerico || '—'}</td>
                    <td style={td}>
                      <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, ...corPublico(p.publico) }}>
                        {p.publico}
                      </span>
                    </td>
                    <td style={td}>{p.descricao || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    Nenhum produto cadastrado ainda
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

export default Produtos
