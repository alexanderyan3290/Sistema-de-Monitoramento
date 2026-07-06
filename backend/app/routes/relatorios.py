from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app.models.leitura import Leitura
from app.models.maquina import Maquina
from app.models.turno import Turno

router = APIRouter(prefix="/relatorios", tags=["Relatorios"])

@router.get("/diario")
def relatorio_diario(data: str = None, db: Session = Depends(get_db)):
    if not data:
        data = str(date.today())

    leituras = db.query(
        Leitura,
        Maquina.numero,
        Maquina.corredor,
        Turno.nome
    ).join(Maquina, Leitura.maquina_id == Maquina.id
    ).join(Turno, Leitura.turno_id == Turno.id
    ).filter(func.date(Leitura.data_hora) == data).all()

    resultado = []
    for l, numero, corredor, turno in leituras:
        resultado.append({
            'maquina': numero,
            'corredor': corredor,
            'turno': turno,
            'referencia': l.referencia,
            'tamanho': l.tamanho,
            'cor': l.cor,
            'producao_meias': l.producao,
            'producao_pares': l.producao // 2 if l.producao else 0,
            'tempo_parada': l.tempo_parada,
            'tempo_meia': l.tempo_meia,
            'data_hora': str(l.data_hora)
        })

    total_meias = sum(r['producao_meias'] or 0 for r in resultado)
    total_pares = sum(r['producao_pares'] or 0 for r in resultado)

    return {
        'data': data,
        'total_meias': total_meias,
        'total_pares': total_pares,
        'total_registros': len(resultado),
        'registros': resultado
    }

@router.get("/turno")
def relatorio_turno(data: str = None, db: Session = Depends(get_db)):
    if not data:
        data = str(date.today())

    resultado = db.query(
        Turno.nome,
        func.sum(Leitura.producao).label('total_meias'),
        func.count(Leitura.id).label('total_registros')
    ).join(Turno, Leitura.turno_id == Turno.id
    ).filter(func.date(Leitura.data_hora) == data
    ).group_by(Turno.nome).all()

    return {
        'data': data,
        'turnos': [
            {
                'turno': r[0],
                'total_meias': r[1] or 0,
                'total_pares': (r[1] or 0) // 2,
                'total_registros': r[2]
            }
            for r in resultado
        ]
    }

@router.get("/corredor")
def relatorio_corredor(data: str = None, db: Session = Depends(get_db)):
    if not data:
        data = str(date.today())

    resultado = db.query(
        Maquina.corredor,
        func.sum(Leitura.producao).label('total_meias'),
        func.count(Leitura.id).label('total_maquinas')
    ).join(Maquina, Leitura.maquina_id == Maquina.id
    ).filter(func.date(Leitura.data_hora) == data
    ).group_by(Maquina.corredor).all()

    return {
        'data': data,
        'corredores': [
            {
                'corredor': r[0],
                'total_meias': r[1] or 0,
                'total_pares': (r[1] or 0) // 2,
                'total_maquinas': r[2]
            }
            for r in resultado
        ]
    }

@router.get("/celula")
def relatorio_celula(data: str = None, db: Session = Depends(get_db)):
    if not data:
        data = str(date.today())

    resultado = db.query(
        Maquina.celula,
        func.sum(Leitura.producao).label('total_meias'),
        func.count(Leitura.id).label('total_maquinas')
    ).join(Maquina, Leitura.maquina_id == Maquina.id
    ).filter(
        func.date(Leitura.data_hora) == data,
        Maquina.celula != None
    ).group_by(Maquina.celula).all()

    return {
        'data': data,
        'celulas': [
            {
                'celula': r[0] or 'Sem célula',
                'total_meias': r[1] or 0,
                'total_pares': (r[1] or 0) // 2,
                'total_maquinas': r[2]
            }
            for r in resultado if r[0]
        ]
    }
