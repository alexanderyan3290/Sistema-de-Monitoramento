from sqlalchemy import create_engine                        # Importa a função que cria o motor de conexão com o banco
from sqlalchemy.orm import sessionmaker, DeclarativeBase    # Importa o sessionmaker para criar sessões E o DeclarativeBase moderno
from dotenv import load_dotenv                              # Importa o load_dotenv que lê o arquivo .env
import os                                                   # Importa o módulo os para ler variáveis do sistema

load_dotenv()                                               # Lê o arquivo .env e carrega as variáveis na memória

DATABASE_URL = os.getenv("DATABASE_URL")                    # Busca o valor de DATABASE_URL do arquivo .env

engine = create_engine(DATABASE_URL)                        # Cria o motor de conexão com o PostgreSQL usando a URL do .env

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)    # Cria a fábrica de sessões configurada para não salvar automaticamente

class Base(DeclarativeBase):                                # Cria a classe Base moderna — as tabelas vão herdar dela
    pass                                                    # "pass" significa que a classe não tem nada extra por enquanto

def get_db():                                               # Função que abre e fecha conexão com o banco
    db = SessionLocal()                                     # Abre uma sessão nova
    try:                                                    # Tenta executar
        yield db                                            # Entrega a sessão para quem pediu
    finally:                                                # Sempre executa isso no final
        db.close()                                          # Fecha a sessão para não deixar conexões abertas