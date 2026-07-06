from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.turno import Turno

router = APIRouter(prefix="/turnos", tags=["Turnos"])

@router.get("/")
def listar_turnos(db: Session = Depends(get_db)):
    turnos = db.query(Turno).all()
    return turnos

@router.post("/")
def criar_turno(
    nome: str,
    hora_inicio: str,
    hora_fim: str,
    db: Session = Depends(get_db)
):
    turno = Turno(
        nome=nome,
        hora_inicio=hora_inicio,
        hora_fim=hora_fim
    )
    db.add(turno)
    db.commit()
    db.refresh(turno)
    return turno

@router.get("/{turno_id}")
def buscar_turno(turno_id: int, db: Session = Depends(get_db)):
    turno = db.query(Turno).filter(Turno.id == turno_id).first()
    if not turno:
        raise HTTPException(status_code=404, detail="Turno não encontrado")
    return turno
