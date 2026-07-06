from sqlalchemy import Column, Integer, String, Enum
from app.database import Base

class Produto(Base):
    __tablename__ = 'produtos'

    id = Column(Integer, primary_key=True, index=True)
    referencia = Column(String, nullable=False)          # Ex: "216.02", "212.7"
    nome = Column(String)                                # Ex: "Sapatilha", "Meia social"
    tamanho_letra = Column(String, nullable=False)       # Ex: "R", "M", "P"
    tamanho_numerico = Column(String, nullable=False)    # Ex: "39-43", "33-38"
    publico = Column(
        Enum(
            'masculino',
            'feminino',
            'infantil',
            'unissex',
            name='publico_enum'
        ),
        nullable=False
    )
    descricao = Column(String)                           # Informações extras
    