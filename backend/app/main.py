from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import maquina, turno, producao, parada, produto, leitura, maquina_referencia
from app.routes import maquinas, turnos, producao as producao_router, produtos, paradas, dashboard, leituras, referencias
from app.routes import relatorios

Base.metadata.create_all(bind=engine)

app = FastAPI(title='Sistema de Monitoramento de Meias')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(maquinas.router)
app.include_router(turnos.router)
app.include_router(producao_router.router)
app.include_router(produtos.router)
app.include_router(paradas.router)
app.include_router(dashboard.router)
app.include_router(leituras.router)
app.include_router(referencias.router)
app.include_router(relatorios.router)

@app.get('/')
def root():
    return {'mensagem': 'API do Sistema de Meias funcionando!'}
