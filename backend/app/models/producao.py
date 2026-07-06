from sqlalchemy import Column, Integer, String, Date, ForeignKey    # Importa os tipos de colunas
from sqlalchemy.orm import relationship                             # Importa relationship para ligar tabelas
from app.database import Base                                       # Importa a classe Base

class Producao(Base):                                               # Cria a classe Producao
    __tablename__ = 'producao'                                      # Nome da tabela no PostgreSQL

    id = Column(Integer, primary_key=True, index=True)              # ID único de cada registro de produção
    maquina_id = Column(Integer, ForeignKey('maquinas.id'), nullable=False)   # ID da máquina — aponta para a tabela maquinas
    turno_id = Column(Integer, ForeignKey('turnos.id'), nullable=False)       # ID do turno — aponta para a tabela turnos
    data = Column(Date, nullable=False)                             # Data da produção ex: 2026-06-27
    quantidade_meias = Column(Integer, nullable=False)              # Quantidade de meias individuais que caíram na máquina
    observacoes = Column(String)                                    # Campo opcional para anotações

    maquina = relationship('Maquina')                               # Liga a produção com a máquina
    turno = relationship('Turno')                                   # Liga a produção com o turno

    @property
    def quantidade_pares(self):                                     # Propriedade calculada automaticamente
        return self.quantidade_meias // 2                           # Divide por 2 — 468 meias = 234 pares