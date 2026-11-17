import mysql.connector
from mysql.connector import Error
import sys
import os

# Adiciona o diretório raiz ao path para conseguir importar o config.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DB_CONFIG

def get_connection():
    """
    Tenta estabelecer e retornar uma conexão com o MySQL.
    Retorna o objeto da conexão se sucesso, ou None se falhar.
    """
    try:
        conexao = mysql.connector.connect(**DB_CONFIG)
        if conexao.is_connected():
            return conexao
            
    except Error as e:
        print(f"⚠️ Erro Crítico: Falha ao conectar ao MySQL.\nDetalhes: {e}")
        return None

def close_connection(conexao, cursor=None):
    """
    Garante o fechamento seguro do cursor e da conexão, 
    liberando recursos do sistema opercional.
    """
    try:
        if cursor is not None:
            cursor.close()
            
        if conexao is not None and conexao.is_connected():
            conexao.close()
            
    except Error as e:
        print(f"⚠️ Erro ao tentar fechar a conexão: {e}")