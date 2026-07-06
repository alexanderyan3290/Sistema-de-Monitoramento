from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.parada import Parada
from app.models.maquina import Maquina

router = APIRouter(prefix="/paradas", tags=["Paradas"])

@router.get("/")
def listar_paradas(db: Session = Depends(get_db)):
    return db.query(Parada).all()

@router.post("/")
def registrar_parada(
    maquina_id: int,
    motivo: str,
    inicio: datetime,
    db: Session = Depends(get_db)
):
    parada = Parada(
        maquina_id=maquina_id,
        motivo=motivo,
        inicio=inicio
    )
    db.add(parada)

    # Atualiza status da máquina para parada
    maquina = db.query(Maquina).filter(Maquina.id == maquina_id).first()
    if maquina:
        maquina.status = 'parada'

    db.commit()
    db.refresh(parada)
    return parada

@router.put("/{parada_id}/finalizar")
def finalizar_parada(parada_id: int, db: Session = Depends(get_db)):
    parada = db.query(Parada).filter(Parada.id == parada_id).first()
    if not parada:
        raise HTTPException(status_code=404, detail="Parada não encontrada")

    parada.fim = datetime.now()
    parada.tempo_parado = int(
        (parada.fim - parada.inicio).total_seconds() / 60
    )

    # Atualiza status da máquina para ativa
    maquina = db.query(Maquina).filter(Maquina.id == parada.maquina_id).first()
    if maquina:
        maquina.status = 'ativa'

    db.commit()
    db.refresh(parada)
    return parada

@router.get("/maquina/{maquina_id}")
def paradas_por_maquina(maquina_id: int, db: Session = Depends(get_db)):
    return db.query(Parada).filter(Parada.maquina_id == maquina_id).all()

@router.get("/abertas")
def paradas_abertas(db: Session = Depends(get_db)):
    return db.query(Parada).filter(Parada.fim == None).all()
