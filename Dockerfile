FROM python:3.12-slim

WORKDIR /app

# Copia apenas o arquivo de dependências primeiro para otimizar o cache
COPY requirements.txt .

# Instala as dependências do projeto e o servidor gunicorn
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copia o restante dos arquivos do projeto
COPY . .

EXPOSE 5000

# Comando para iniciar a aplicação (assumindo que sua instância Flask se chama 'app' dentro de 'app.py')
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]