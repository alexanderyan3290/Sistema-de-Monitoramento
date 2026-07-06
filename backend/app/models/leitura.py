from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Leitura(Base):
    __tablename__ = 'leituras_maquina'                          # Nome da tabela

    id = Column(Integer, primary_key=True, index=True)          # ID único
    maquina_id = Column(Integer, ForeignKey('maquinas.id'), nullable=False)  # Qual máquina
    turno_id = Column(Integer, ForeignKey('turnos.id'), nullable=False)      # Qual turno
    referencia = Column(String)                                 # Ex: "216.02"
    tamanho = Column(String)                                    # Ex: "34/38"
    cor = Column(String)                                        # Ex: "C205"
    producao = Column(Integer, default=0)                       # Quantidade produzida
    tempo_parada = Column(Integer, default=0)                   # Tempo parado em minutos
    data_hora = Column(DateTime, default=datetime.now)          # Quando foi registrado
    origem = Column(                                            # Como veio o dado
        Enum('manual', 'automatico', name='origem_enum'),
        default='manual'                                        # Por padrão é manual
    )
    tempo_meia = Column(Integer, default=0)    # Tempo em segundos para fazer uma meia                               # Observações opcionais

    maquina = relationship('Maquina')                           # Liga com máquinas
    turno = relationship('Turno')                               # Liga com turnos