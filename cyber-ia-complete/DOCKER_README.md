# Cyber IA - Docker Setup

## � Pré-requisitos

### **OBRIGATÓRIO: Docker Desktop**
- **Windows**: https://www.docker.com/products/docker-desktop/
- **Mac**: https://www.docker.com/products/docker-desktop/
- **Linux**: https://docs.docker.com/engine/install/

### **Verificar Instalação**
```bash
# Verificar se Docker está instalado
docker --version

# Verificar se Docker Compose está disponível
docker compose version
```

### **Se Docker não estiver instalado:**
1. Baixe e instale Docker Desktop para seu sistema operacional
2. Reinicie seu computador após a instalação
3. Abra Docker Desktop e aguarde inicialização completa
4. Verifique instalação com os comandos acima

**⚠️ IMPORTANTE**: Sem Docker instalado, os comandos abaixo não funcionarão!

---

## � Docker Quick Start

Execute o sistema completo com um único comando:

```bash
docker-compose up --build
```

## 🚀 Como Usar

### **1. Clonar o Repositório**
```bash
git clone https://github.com/mnogueiradev/CyberAI.git
cd cyber-ia-complete
```

### **2. Iniciar o Sistema**
```bash
# Build e start dos containers
docker-compose up --build

# Ou em modo background
docker-compose up --build -d
```

### **3. Acessar as Aplicações**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### **4. Parar o Sistema**
```bash
docker-compose down
```

## 📁 Estrutura Docker

```
cyber-ia-complete/
├── docker-compose.yml          # Orquestração dos containers
├── requirements.txt            # Dependências Python
├── .dockerignore              # Arquivos ignorados no build
├── backend/
│   └── Dockerfile             # Container do backend Python
├── frontend/
│   ├── Dockerfile             # Container do frontend React
│   └── nginx.conf             # Configuração do servidor web
└── DOCKER_README.md           # Este arquivo
```

## 🔧 Detalhes dos Containers

### **Backend Container**
- **Base**: Python 3.9-slim
- **Porta**: 8000
- **Dependências**: pandas, scikit-learn, tensorflow, fastapi, uvicorn
- **Volumes**: Data/, models/, reports/, src/

### **Frontend Container**
- **Base**: Nginx Alpine (multi-stage build)
- **Porta**: 3000
- **Build**: React production build
- **Proxy**: API requests para backend

## 📊 Persistência de Dados

Os seguintes diretórios são mantidos persistently:

- **`./Data`**: Datasets e arquivos de dados
- **`./models`**: Modelos de ML treinados
- **`./reports`**: Relatórios gerados

## 🛠️ Comandos Úteis

### **Logs**
```bash
# Logs de todos os containers
docker-compose logs

# Logs apenas do backend
docker-compose logs backend

# Logs apenas do frontend
docker-compose logs frontend

# Logs em tempo real
docker-compose logs -f
```

### **Gerenciamento**
```bash
# Reconstruir containers
docker-compose build --no-cache

# Reiniciar apenas um serviço
docker-compose restart backend

# Executar comando no container
docker-compose exec backend python src/models/run_inference.py

# Status dos containers
docker-compose ps
```

### **Desenvolvimento**
```bash
# Iniciar com volumes para desenvolvimento
docker-compose up --build

# Parar e remover volumes
docker-compose down -v
```

## 🌐 Endpoints da API

- `GET /` - Status da API
- `GET /summary` - Resumo da análise
- `GET /results` - Lista completa de hosts
- `GET /alerts` - Alertas detectados
- `GET /dashboard/real-data` - Dados do dashboard
- `GET /docs` - Documentação Swagger

## 🔍 Troubleshooting

### **Portas já em uso**
```bash
# Verificar portas em uso
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Mudar portas no docker-compose.yml
ports:
  - "8001:8000"  # Backend na porta 8001
  - "3001:3000"  # Frontend na porta 3001
```

### **Problemas de permissão**
```bash
# Linux/Mac - ajustar permissões dos volumes
sudo chown -R $USER:$USER Data models reports
```

### **Limpeza completa**
```bash
# Parar containers
docker-compose down

# Remover imagens
docker-compose down --rmi all

# Remover volumes
docker-compose down -v

# Limpeza completa do Docker
docker system prune -a
```

### **Build lento**
- Use cache do Docker: `docker-compose build`
- Para rebuild completo: `docker-compose build --no-cache`

## 🚀 Deploy em Produção

### **Variáveis de Ambiente**
Crie um arquivo `.env`:
```bash
# .env
COMPOSE_PROJECT_NAME=cyber-ia-prod
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### **HTTPS/SSL**
Para produção, configure nginx com SSL:
```bash
# Adicione certificados SSL em frontend/ssl/
# Atualize nginx.conf para usar HTTPS
```

### **Performance**
```bash
# Escalar backend
docker-compose up --scale backend=2

# Limitar recursos
docker-compose up --build --memory="2g"
```

## 📈 Monitoramento

### **Health Checks**
Os containers incluem health checks:
```bash
# Verificar status
docker-compose ps

# Verificar health logs
docker inspect cyber-ia-backend | grep Health -A 10
```

### **Recursos**
```bash
# Uso de recursos
docker stats

# Uso de disco
docker system df
```

## 🔄 CI/CD Integration

### **GitHub Actions Example**
```yaml
name: Docker CI/CD
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and test
        run: |
          docker-compose build
          docker-compose up -d
          docker-compose exec backend python -m pytest
```

## 📚 Documentação Adicional

- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Verifique se as portas estão livres
3. Confirme se Docker está rodando
4. Limpe e rebuild: `docker-compose down && docker-compose up --build`

---

**🐳 Docker torna o Cyber IA portável e fácil de deploy em qualquer ambiente!**
