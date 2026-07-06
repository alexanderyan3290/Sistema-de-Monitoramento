from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.producao import Producao

router = APIRouter(prefix="/producao", tags=["Producao"])

@router.get("/")
def listar_producao(db: Session = Depends(get_db)):
    producao = db.query(Producao).all()
    return producao

@router.post("/")
def registrar_producao(
    maquina_id: int,
    turno_id: int,
    quantidade_meias: int,
    data: date,
    observacoes: str = None,
    db: Session = Depends(get_db)
):
    producao = Producao(
        maquina_id=maquina_id,
        turno_id=turno_id,
        quantidade_meias=quantidade_meias,
        data=data,
        observacoes=observacoes
    )
    db.add(producao)
    db.commit()
    db.refresh(producao)
    return producao

@router.get("/maquina/{maquina_id}")
def producao_por_maquina(maquina_id: int, db: Session = Depends(get_db)):
    producao = db.query(Producao).filter(Producao.maquina_id == maquina_id).all()
    if not producao:
        raise HTTPException(status_code=404, detail="Nenhuma produção encontrada")
    return producao

@router.get("/hoje")
def producao_hoje(db: Session = Depends(get_db)):
    hoje = date.today()
    producao = db.query(Producao).filter(Producao.data == hoje).all()
    return producao