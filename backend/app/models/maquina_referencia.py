from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MaquinaReferencia(Base):
    __tablename__ = 'maquina_referencias'

    id = Column(Integer, primary_key=True, index=True)
    maquina_id = Column(Integer, ForeignKey('maquinas.id'), nullable=False)
    referencia = Column(String, nullable=False)
    tamanho = Column(String)
    ativa = Column(Boolean, default=True)
    cor = Column(String)