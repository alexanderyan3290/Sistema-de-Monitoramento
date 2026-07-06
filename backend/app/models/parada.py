from sqlalchemy import Column, Integer, String, DateTime, ForeignKey   # Importa os tipos de colunas
from sqlalchemy.orm import relationship                                 # Importa relationship para ligar tabelas
from app.database import Base                                           # Importa a classe Base

class Parada(Base):                                                     # Cria a classe Parada
    __tablename__ = 'paradas'                                           # Nome da tabela no PostgreSQL

    id = Column(Integer, primary_key=True, index=True)                  # ID único de cada parada
    maquina_id = Column(Integer, ForeignKey('maquinas.id'), nullable=False)   # ID da máquina que parou
    inicio = Column(DateTime, nullable=False)                           # Data e hora que a máquina parou
    fim = Column(DateTime)                                              # Data e hora que voltou — opcional pois pode ainda estar parada
    motivo = Column(String)                                             # Motivo da parada ex: "manutenção", "falta de linha"
    tempo_parado = Column(Integer)                                      # Tempo total parado em minutos — calculado depois

    maquina = relationship('Maquina')                                   # Liga a parada com a máquina — permite buscar dados da máquina direto