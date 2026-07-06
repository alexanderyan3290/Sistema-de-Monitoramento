from sqlalchemy import Column, Integer, String, Enum
from app.database import Base

class Maquina(Base):
    __tablename__ = 'maquinas'

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String, unique=True, nullable=False)     # Ex: "001", "054"
    corredor = Column(String, nullable=False)                # "A", "B" ou "C"
    lado = Column(String, default='direito')                 # Não obrigatório
    celula = Column(String)                                  # Cor da célula
    modelo = Column(String)                                  # Modelo da máquina
    referencia = Column(String)                              # Ex: "216.02"
    tamanho = Column(String)                                 # Ex: "34/38"
    cor = Column(String)                                     # Ex: "C205"
    status = Column(
        Enum('ativa', 'parada', 'manutencao', name='status_enum'),
        default='ativa'
    )