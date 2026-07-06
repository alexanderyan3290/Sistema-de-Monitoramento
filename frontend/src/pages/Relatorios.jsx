import { useState } from 'react'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const CORES = ['#185FA5', '#854F0B', '#3B6D11', '#A32D2D', '#534AB7', '#993C1D']

function Relatorios() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [aba, setAba] = useState('diario')
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function buscarRelatorio() {
    setCarregando(true)
    try {
      const resposta = await api.get(`/relatorios/${aba}?data=${data}`)
      setDados(resposta.data)
    } catch (erro) {
      console.log(erro)
    }
    setCarregando(false)
  }

  function getDados() {
    if (aba === 'diario') return dados.registros.map(r => ({
      Maquina: r.maquina, Corredor: r.corredor, Turno: r.turno,
      Referência: r.referencia || '', Tamanho: r.tamanho || '', Cor: r.cor || '',
      Meias: r.producao_meias, Pares: r.producao_pares, 'T.Parada': r.tempo_parada || 0
    }))
    if (aba === 'turno') return dados.turnos.map(t => ({
      Turno: t.turno, Meias: t.total_meias, Pares: t.total_pares, Registros: t.total_registros
    }))
    if (aba === 'corredor') return dados.corredores.map(c => ({
      Corredor: c.corredor, Meias: c.total_meias, Pares: c.total_pares, Maquinas: c.total_maquinas
    }))
    if (aba === 'celula') return dados.celulas.map(c => ({
      Célula: c.celula, Meias: c.total_meias, Pares: c.total_pares, Maquinas: c.total_maquinas
    }))
    return []
  }

  function exportarCSV() {
    if (!dados) return
    const linhas = getDados()
    const cabecalho = Object.keys(linhas[0]).join(',')
    const conteudo = linhas.map(l => Object.values(l).join(',')).join('\n')
    const blob = new Blob([cabecalho + '\n' + conteudo], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio_${aba}_${data}.csv`
    link.click()
  }

  function exportarExcel() {
    if (!dados) return
    const linhas = getDados()
    const ws = XLSX.utils.json_to_sheet(linhas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório')
    XLSX.writeFile(wb, `relatorio_${aba}_${data}.xlsx`)
  }

  function exportarPDF() {
    if (!dados) return
    const linhas = getDados()
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Relatório — ${aba} — ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}`, 14, 20)
    autoTable(doc, {
      startY: 30,
      head: [Object.keys(linhas[0])],
      body: linhas.map(l => Object.values(l)),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [24, 95, 165] }
    })
    doc.save(`relatorio_${aba}_${data}.pdf`)
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 1.5rem' }}>
        Relatórios
      </h1>

      {/* Filtros */}
      <div style={card}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={campo}>
            <label style={labelStyle}>Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={input} />
          </div>
          <div style={campo}>
            <label style={labelStyle}>Tipo de relatório</label>
            <select value={aba} onChange={e => { setAba(e.target.value); setDados(null) }} style={input}>
              <option value="diario">Diário por maquina</option>
              <option value="turno">Por turno</option>
              <option value="corredor">Por corredor</option>
              <option value="celula">Por célula</option>
            </select>
          </div>
          <button onClick={buscarRelatorio} disabled={carregando} style={{ ...botao, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>bar_chart</span>
            {carregando ? 'Buscando...' : 'Gerar relatório'}
          </button>
          {dados && getDados().length > 0 && (
            <>
              <button onClick={exportarCSV} style={{ ...botaoBranco, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>download</span>
                CSV
              </button>
              <button onClick={exportarExcel} style={{ ...botaoBranco, display: 'flex', alignItems: 'center', gap: '6px', color: '#3B6D11', borderColor: '#3B6D11' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>table_chart</span>
                Excel
              </button>
              <button onClick={exportarPDF} style={{ ...botaoBranco, display: 'flex', alignItems: 'center', gap: '6px', color: '#A32D2D', borderColor: '#A32D2D' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>picture_as_pdf</span>
                PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Resultado */}
      {dados && (
        <div style={{ marginTop: '1.5rem' }}>

          {/* Cards de resumo */}
          {dados.total_meias !== undefined && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ ...card, borderTop: '3px solid #185FA5' }}>
                <p style={labelSmall}>DATA</p>
                <p style={{ fontSize: '18px', fontWeight: 500, color: '#1a1a2e', margin: '4px 0 0' }}>
                  {new Date(dados.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div style={{ ...card, borderTop: '3px solid #185FA5' }}>
                <p style={labelSmall}>TOTAL MEIAS</p>
                <p style={{ fontSize: '24px', fontWeight: 500, color: '#185FA5', margin: '4px 0 0' }}>
                  {dados.total_meias.toLocaleString('pt-BR')}
                </p>
              </div>
              <div style={{ ...card, borderTop: '3px solid #3B6D11' }}>
                <p style={labelSmall}>TOTAL PARES</p>
                <p style={{ fontSize: '24px', fontWeight: 500, color: '#3B6D11', margin: '4px 0 0' }}>
                  {dados.total_pares.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          {/* Gráfico diário por maquina */}
          {aba === 'diario' && dados.registros.length > 0 && (
            <div style={card}>
              <p style={secao}>Produção por maquina</p>
              <ResponsiveContainer width="100%" height={Math.max(300, dados.registros.length * 30)}>
                <BarChart
                  data={dados.registros.map(r => ({ name: r.maquina, meias: r.producao_meias }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={40} />
                  <Tooltip formatter={(v) => [v.toLocaleString('pt-BR'), 'Meias']} />
                  <Bar dataKey="meias" fill="#185FA5" radius={[0, 4, 4, 0]} name="meias" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {aba === 'diario' && dados.registros.length === 0 && (
            <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#888' }}>Nenhum registro encontrado para esta data</p>
            </div>
          )}

          {/* Gráfico por turno */}
          {aba === 'turno' && (
            <div style={card}>
              <p style={secao}>Produção por turno</p>
              {dados.turnos.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dados.turnos.map(t => ({ name: t.turno, meias: t.total_meias, pares: t.total_pares }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v, n) => [v.toLocaleString('pt-BR'), n === 'meias' ? 'Meias' : 'Pares']} />
                    <Bar dataKey="meias" radius={[4, 4, 0, 0]} name="meias">
                      {dados.turnos.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                    </Bar>
                    <Bar dataKey="pares" radius={[4, 4, 0, 0]} name="pares" fill="#97C459" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Nenhum registro encontrado</p>
              )}
            </div>
          )}

          {/* Gráfico por corredor */}
          {aba === 'corredor' && (
            <div style={card}>
              <p style={secao}>Produção por corredor</p>
              {dados.corredores.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dados.corredores.map(c => ({ name: `Corredor ${c.corredor}`, meias: c.total_meias, pares: c.total_pares }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v, n) => [v.toLocaleString('pt-BR'), n === 'meias' ? 'Meias' : 'Pares']} />
                    <Bar dataKey="meias" fill="#185FA5" radius={[4, 4, 0, 0]} name="meias" />
                    <Bar dataKey="pares" fill="#97C459" radius={[4, 4, 0, 0]} name="pares" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Nenhum registro encontrado</p>
              )}
            </div>
          )}

          {/* Gráfico por célula */}
          {aba === 'celula' && (
            <div style={card}>
              <p style={secao}>Produção por célula</p>
              {dados.celulas && dados.celulas.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dados.celulas.map(c => ({ name: c.celula.charAt(0).toUpperCase() + c.celula.slice(1), meias: c.total_meias, pares: c.total_pares }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v, n) => [v.toLocaleString('pt-BR'), n === 'meias' ? 'Meias' : 'Pares']} />
                    <Bar dataKey="meias" radius={[4, 4, 0, 0]} name="meias">
                      {dados.celulas.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                    </Bar>
                    <Bar dataKey="pares" fill="#97C459" radius={[4, 4, 0, 0]} name="pares" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Nenhum registro encontrado</p>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  )
}

const card = { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem' }
const campo = { display: 'flex', flexDirection: 'column', gap: '4px' }
const labelStyle = { fontSize: '12px', color: '#888' }
const labelSmall = { fontSize: '11px', color: '#888', margin: 0, letterSpacing: '0.5px' }
const input = { padding: '8px 12px', borderRadius: '8px', border: '0.5px solid #e0e0e0', fontSize: '14px', outline: 'none', minWidth: '150px' }
const botao = { padding: '8px 20px', backgroundColor: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
const botaoBranco = { padding: '8px 16px', backgroundColor: '#fff', color: '#185FA5', border: '0.5px solid #185FA5', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
const secao = { fontSize: '14px', fontWeight: 500, color: '#555', margin: '0 0 1rem' }

export default Relatorios
