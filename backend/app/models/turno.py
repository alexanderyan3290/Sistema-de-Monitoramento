from sqlalchemy import Column, Integer, String   # Importa os tipos de colunas que vamos usar
from app.database import Base                    # Importa a classe Base — todas as tabelas herdam dela

class Turno(Base):                               # Cria a classe Turno que vai virar a tabela no banco
    __tablename__ = 'turnos'                     # Nome da tabela no PostgreSQL

    id = Column(Integer, primary_key=True, index=True)   # ID único de cada turno, gerado automaticamente
    nome = Column(String, nullable=False)                 # Nome do turno: "Manhã", "Tarde" ou "Noite"
    hora_inicio = Column(String, nullable=False)          # Hora que o turno começa ex: "05:20"
    hora_fim = Column(String, nullable=False)             # Hora que o turno termina ex: "13:40"