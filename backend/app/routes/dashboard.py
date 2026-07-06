from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
import calendar
from app.database import get_db
from app.models.leitura import Leitura
from app.models.maquina import Maquina
from app.models.turno import Turno

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):
    hoje = date.today()

    total_meias = db.query(
        func.sum(Leitura.producao)
    ).filter(func.date(Leitura.data_hora) == hoje).scalar() or 0

    total_pares = total_meias // 2

    corredores = ['A', 'B', 'C']
    producao_corredor = {}
    for corredor in corredores:
        total = db.query(
            func.sum(Leitura.producao)
        ).join(Maquina, Leitura.maquina_id == Maquina.id).filter(
            func.date(Leitura.data_hora) == hoje,
            Maquina.corredor == corredor
        ).scalar() or 0
        producao_corredor[corredor] = {
            'meias': total,
            'pares': total // 2
        }

    producao_turno_raw = db.query(
        Leitura.turno_id,
        func.sum(Leitura.producao)
    ).filter(
        func.date(Leitura.data_hora) == hoje
    ).group_by(Leitura.turno_id).all()

    turnos = db.query(Turno).all()
    turnos_dict = {t.id: t.nome for t in turnos}

    turnos_resultado = [
        {
            'turno_id': t[0],
            'turno': turnos_dict.get(t[0], f'Turno {t[0]}'),
            'meias': t[1] or 0,
            'pares': (t[1] or 0) // 2
        }
        for t in producao_turno_raw
    ]

    total_maquinas = db.query(Maquina).count()
    maquinas_paradas = db.query(Maquina).filter(
        Maquina.status == 'parada'
    ).count()
    maquinas_ativas = total_maquinas - maquinas_paradas

    return {
        'data': str(hoje),
        'total_meias': total_meias,
        'total_pares': total_pares,
        'producao_por_corredor': producao_corredor,
        'producao_por_turno': turnos_resultado,
        'maquinas_ativas': maquinas_ativas,
        'maquinas_paradas': maquinas_paradas,
        'total_maquinas': total_maquinas
    }

@router.get("/mensal")
def get_dashboard_mensal(db: Session = Depends(get_db)):
    hoje = date.today()
    primeiro_dia = hoje.replace(day=1)
    ultimo_dia = hoje.replace(day=calendar.monthrange(hoje.year, hoje.month)[1])

    resultado = db.query(
        Leitura.turno_id,
        func.sum(Leitura.producao).label('total_meias')
    ).filter(
        func.date(Leitura.data_hora) >= primeiro_dia,
        func.date(Leitura.data_hora) <= ultimo_dia
    ).group_by(Leitura.turno_id).all()

    turnos = db.query(Turno).all()
    turnos_dict = {t.id: t.nome for t in turnos}

    return {
        'mes': hoje.month,
        'ano': hoje.year,
        'producao_por_turno': [
            {
                'turno_id': r[0],
                'turno': turnos_dict.get(r[0], f'Turno {r[0]}'),
                'meias': r[1] or 0,
                'pares': (r[1] or 0) // 2
            }
            for r in resultado
        ]
    }
