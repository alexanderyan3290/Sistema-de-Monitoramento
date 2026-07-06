from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.produto import Produto

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.get("/")
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(Produto).all()                   # Busca todos os produtos no banco
    return produtos

@router.post("/")
def criar_produto(
    referencia: str,                                     # Ex: "216.02"
    nome: str,                                           # Ex: "Sapatilha"
    tamanho_letra: str,                                  # Ex: "R", "M", "P"
    tamanho_numerico: str,                               # Ex: "39-43"
    publico: str,                                        # Ex: "masculino"
    descricao: str = None,                               # Opcional
    db: Session = Depends(get_db)
):
    produto = Produto(
        referencia=referencia,
        nome=nome,
        tamanho_letra=tamanho_letra,
        tamanho_numerico=tamanho_numerico,
        publico=publico,
        descricao=descricao
    )
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto

@router.get("/{produto_id}")
def buscar_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.get("/referencia/{referencia}")
def buscar_por_referencia(referencia: str, db: Session = Depends(get_db)):
    produtos = db.query(Produto).filter(Produto.referencia == referencia).all()
    if not produtos:
        raise HTTPException(status_code=404, detail="Referência não encontrada")
    return produtos