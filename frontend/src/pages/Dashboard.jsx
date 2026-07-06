import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const CORES = ['#185FA5', '#854F0B', '#3B6D11']

function Dashboard() {
  const [dados, setDados] = useState(null)
  const [mensal, setMensal] = useState(null)

  function buscarDados() {
    api.get('/dashboard/').then(r => setDados(r.data)).catch(e => console.log(e))
    api.get('/dashboard/mensal').then(r => setMensal(r.data)).catch(e => console.log(e))
  }

  useEffect(() => {
    buscarDados()
    const intervalo = setInterval(buscarDados, 30000)
    return () => clearInterval(intervalo)
  }, [])

  if (!dados) return <p style={{ padding: '2rem' }}>Carregando...</p>

  const totalDia = dados.producao_por_turno.reduce((s, t) => s + t.meias, 0)

  const dadosPizza = dados.producao_por_turno.map(t => ({
    name: t.turno,
    value: t.meias,
    percent: totalDia > 0 ? Math.round((t.meias / totalDia) * 100) : 0
  }))

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 4px', textAlign: 'center' }}>
        Painel
      </h1>
      <p style={{ fontSize: '13px', color: '#888', margin: '0 0 1.5rem', textAlign: 'center' }}>
        {new Date().toLocaleDateString('pt-BR')} — dados em tempo real
      </p>

      {/* Cards principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>

        <div style={{ ...card, borderTop: '3px solid #185FA5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <p style={labelSmall}>TOTAL MEIAS</p>
            <div style={{ ...iconBox, background: '#E6F1FB' }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#185FA5' }}>dry_cleaning</span>
            </div>
          </div>
          <p style={{ ...valor, color: '#185FA5' }}>{dados.total_meias.toLocaleString('pt-BR')}</p>
          <p style={sub}>unidades hoje</p>
        </div>

        <div style={{ ...card, borderTop: '3px solid #3B6D11' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <p style={labelSmall}>TOTAL PARES</p>
            <div style={{ ...iconBox, background: '#EAF3DE' }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#3B6D11' }}>inventory_2</span>
            </div>
          </div>
          <p style={{ ...valor, color: '#3B6D11' }}>{dados.total_pares.toLocaleString('pt-BR')}</p>
          <p style={sub}>pares hoje</p>
        </div>

        <div style={{ ...card, borderTop: '3px solid #3B6D11' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <p style={labelSmall}>MAQUINAS ATIVAS</p>
            <div style={{ ...iconBox, background: '#EAF3DE' }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#3B6D11' }}>settings</span>
            </div>
          </div>
          <p style={{ ...valor, color: '#3B6D11' }}>{dados.maquinas_ativas}</p>
          <p style={sub}>de {dados.total_maquinas} total</p>
        </div>

        <div style={{ ...card, borderTop: '3px solid #A32D2D' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <p style={labelSmall}>MAQUINAS PARADAS</p>
            <div style={{ ...iconBox, background: '#FCEBEB' }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#A32D2D' }}>warning</span>
            </div>
          </div>
          <p style={{ ...valor, color: '#A32D2D' }}>{dados.maquinas_paradas}</p>
          <p style={sub}>requer atenção</p>
        </div>

      </div>

      {/* Gráficos de turno lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>

        <div style={card}>
          <p style={secao}>Produção por turno — hoje</p>
          {dados.producao_por_turno.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dados.producao_por_turno} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="turno" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => [v.toLocaleString('pt-BR'), 'Meias']} />
                <Bar dataKey="meias" radius={[4, 4, 0, 0]} name="meias">
                  {dados.producao_por_turno.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '3rem 0' }}>Nenhum lançamento hoje</p>
          )}
        </div>

        <div style={card}>
          <p style={secao}>Participação por turno — hoje</p>
          {dadosPizza.length > 0 && totalDia > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {dadosPizza.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v.toLocaleString('pt-BR'), 'Meias']} />
                <Legend fontSize={12} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '3rem 0' }}>Nenhum lançamento hoje</p>
          )}
        </div>

      </div>

      {/* Gráfico por corredor */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <p style={secao}>Produção por corredor — hoje</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={['A', 'B', 'C'].map(c => ({
              name: `Corredor ${c}`,
              meias: dados.producao_por_corredor[c]?.meias || 0,
              pares: dados.producao_por_corredor[c]?.pares || 0,
            }))}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(v, n) => [v.toLocaleString('pt-BR'), n === 'meias' ? 'Meias' : 'Pares']} />
            <Bar dataKey="meias" fill="#185FA5" radius={[4, 4, 0, 0]} name="meias" />
            <Bar dataKey="pares" fill="#97C459" radius={[4, 4, 0, 0]} name="pares" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Indicador mensal */}
      {mensal && (
        <div style={card}>
          <p style={secao}>
            Produção acumulada — {MESES[mensal.mes - 1]} {mensal.ano}
          </p>
          {mensal.producao_por_turno.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mensal.producao_por_turno} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="turno" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => [v.toLocaleString('pt-BR'), 'Meias']} />
                  <Bar dataKey="meias" radius={[4, 4, 0, 0]} name="meias">
                    {mensal.producao_por_turno.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '1rem' }}>
                {mensal.producao_por_turno.map((t, i) => (
                  <div key={t.turno_id} style={{
                    background: '#f8f9fa',
                    border: '0.5px solid #e0e0e0',
                    borderLeft: `3px solid ${CORES[i % CORES.length]}`,
                    borderRadius: '8px',
                    padding: '12px 16px'
                  }}>
                    <p style={labelSmall}>{t.turno.toUpperCase()}</p>
                    <p style={{ fontSize: '20px', fontWeight: 500, color: CORES[i % CORES.length], margin: '4px 0 2px' }}>
                      {t.meias.toLocaleString('pt-BR')}
                    </p>
                    <p style={sub}>{t.pares.toLocaleString('pt-BR')} pares</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>
              Nenhum lançamento este mês
            </p>
          )}
        </div>
      )}

    </div>
  )
}

const card = { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '1rem 1.25rem' }
const iconBox = { width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const labelSmall = { fontSize: '11px', color: '#888', margin: 0, letterSpacing: '0.5px' }
const valor = { fontSize: '28px', fontWeight: 500, margin: '0 0 4px' }
const sub = { fontSize: '12px', color: '#888', margin: 0 }
const secao = { fontSize: '14px', fontWeight: 500, color: '#555', margin: '0 0 10px' }

export default Dashboard
