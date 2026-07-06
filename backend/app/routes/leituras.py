from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import get_db
from app.models.leitura import Leitura
from app.models.maquina import Maquina

router = APIRouter(prefix="/leituras", tags=["Leituras"])

@router.get("/")                                                # Lista todas as leituras
def listar_leituras(db: Session = Depends(get_db)):
    return db.query(Leitura).all()

@router.post("/manual")                                         # Lançamento manual pelo usuário
def registrar_manual(
    maquina_id: int,                                            # Qual máquina
    turno_id: int,                                              # Qual turno
    producao: int,                                              # Quantidade produzida
    tempo_parada: int = 0,                                      # Tempo parado (opcional)
    referencia: str = None,                                     # Referência (opcional)
    tamanho: str = None,                                        # Tamanho (opcional)
    cor: str = None,                                            # Cor (opcional)
    tempo_meia: int = 0,                                        # Observações (opcional)
    db: Session = Depends(get_db)
):
    leitura = Leitura(
        maquina_id=maquina_id,
        turno_id=turno_id,
        producao=producao,
        tempo_parada=tempo_parada,
        referencia=referencia,
        tamanho=tamanho,
        cor=cor,
        tempo_meia=tempo_meia,
        origem='manual',                                        # Marcado como manual
        data_hora=datetime.now()
    )
    db.add(leitura)
    db.commit()
    db.refresh(leitura)
    return leitura

@router.post("/automatico")                                     # Futura integração com a máquina
def registrar_automatico(
    maquina_id: int,
    turno_id: int,
    producao: int,
    tempo_parada: int = 0,
    referencia: str = None,
    tamanho: str = None,
    cor: str = None,
    db: Session = Depends(get_db)
):
    leitura = Leitura(
        maquina_id=maquina_id,
        turno_id=turno_id,
        producao=producao,
        tempo_parada=tempo_parada,
        referencia=referencia,
        tamanho=tamanho,
        cor=cor,
        origem='automatico',                                    # Marcado como automático
        data_hora=datetime.now()
    )
    db.add(leitura)
    db.commit()
    db.refresh(leitura)
    return leitura

@router.get("/maquina/{maquina_id}")                            # Leituras de uma máquina
def leituras_por_maquina(maquina_id: int, db: Session = Depends(get_db)):
    return db.query(Leitura).filter(Leitura.maquina_id == maquina_id).all()

@router.get("/hoje")                                            # Leituras de hoje
def leituras_hoje(db: Session = Depends(get_db)):
    hoje = date.today()
    return db.query(Leitura).filter(
        Leitura.data_hora >= datetime.combine(hoje, datetime.min.time())
    ).all()

@router.get("/turno/{turno_id}")                                # Leituras por turno
def leituras_por_turno(turno_id: int, db: Session = Depends(get_db)):
    return db.query(Leitura).filter(Leitura.turno_id == turno_id).all()
