from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.maquina import Maquina

router = APIRouter(prefix="/maquinas", tags=["Maquinas"])

@router.get("/")
def listar_maquinas(db: Session = Depends(get_db)):
    maquinas = db.query(Maquina).order_by(Maquina.numero).all()  # Ordena por número
    return maquinas

@router.post("/")
def criar_maquina(
    numero: str,                    # Número da máquina — ex: "001", "054"
    corredor: str,                  # Corredor — "A", "B" ou "C"
    celula: str = None,             # Célula/cor — opcional
    modelo: str = None,             # Modelo da máquina — opcional
    referencia: str = None,         # Referência da meia — ex: "216.02"
    tamanho: str = None,            # Tamanho da meia — ex: "34/38"
    cor: str = None,                # Cor da meia — ex: "C205"
    db: Session = Depends(get_db)
):
    maquina = Maquina(
        numero=numero,
        corredor=corredor,
        celula=celula,
        modelo=modelo,
        referencia=referencia,
        tamanho=tamanho,
        cor=cor,
        lado='direito'              # Valor padrão para não quebrar o banco
    )
    db.add(maquina)
    db.commit()
    db.refresh(maquina)
    return maquina

@router.get("/{maquina_id}")
def buscar_maquina(maquina_id: int, db: Session = Depends(get_db)):
    maquina = db.query(Maquina).filter(Maquina.id == maquina_id).first()
    if not maquina:
        raise HTTPException(status_code=404, detail="Maquina não encontrada")
    return maquina
