from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.maquina_referencia import MaquinaReferencia

router = APIRouter(prefix='/referencias', tags=['Referencias'])

@router.get('/maquina/{maquina_id}')
def listar_referencias(maquina_id: int, db: Session = Depends(get_db)):
    return db.query(MaquinaReferencia).filter(MaquinaReferencia.maquina_id == maquina_id).all()

@router.post("/")
def cadastrar_referencia(
    maquina_id: int,
    referencia: str,
    tamanho: str = None,
    cor: str = None,
    db: Session = Depends(get_db)
):
    ref = MaquinaReferencia(
        maquina_id=maquina_id,
        referencia=referencia,
        tamanho=tamanho,
        cor=cor,
        ativa=True
    )
    db.add(ref)
    db.commit()
    db.refresh(ref)
    return ref

@router.get('/verificar')
def verificar_referencia(maquina_id: int, referencia: str, db: Session = Depends(get_db)):
    ref = db.query(MaquinaReferencia).filter(MaquinaReferencia.maquina_id == maquina_id, MaquinaReferencia.referencia == referencia, MaquinaReferencia.ativa == True).first()
    if ref:
        return {'valida': True, 'mensagem': 'Referencia programada!'}
    else:
        return {'valida': False, 'mensagem': 'Referencia NAO programada!'}

@router.delete('/{referencia_id}')
def remover_referencia(referencia_id: int, db: Session = Depends(get_db)):
    ref = db.query(MaquinaReferencia).filter(MaquinaReferencia.id == referencia_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail='Referencia nao encontrada')
    db.delete(ref)
    db.commit()
    return {'mensagem': 'Referencia removida!'}

@router.get("/")
def listar_todas(db: Session = Depends(get_db)):
    return db.query(MaquinaReferencia).all()