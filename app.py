from flask import Flask, render_template, request, flash, redirect, url_for
from database.db import get_connection, close_connection

app = Flask(__name__)
# Necessário para enviar mensagens de sucesso/erro para a tela do usuário
app.secret_key = "chave_secreta_ifsp_projetos" 

# Rota para a Página Principal
@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')

# Rota para o Manual
@app.route('/manual')
def manual():
    return render_template('manual.html')

# Rota que recebe os dados do formulário
@app.route('/enviar', methods=['POST'])
def enviar_chamado():
    # 1. Coleta os dados digitados no HTML
    prontuario = request.form.get('prontuario')
    nome = request.form.get('nome')
    categoria = request.form.get('categoria')
    laboratorio = request.form.get('laboratorio') 
    pat_pc = request.form.get('pat_pc')
    pat_tela = request.form.get('pat_tela')
    descricao = request.form.get('descricao')

    # 2. Descobre qual subcategoria foi escolhida
    subcategoria_nome = ''
    if categoria == 'Hardware':
        subcategoria_nome = request.form.get('subcategoria_hw')
    elif categoria == 'Software':
        subcategoria_nome = request.form.get('subcategoria_sw')
    else:
        subcategoria_nome = 'Não Especificado'

    # DICA DE ARQUITETURA: Como não criamos a coluna "laboratório" no banco, 
    # nós concatenamos ela na descrição para não perder a informação!
    descricao_completa = f"[Local: Lab {laboratorio}] {descricao}"

    # 3. Conexão e Inserção no Banco de Dados
    conexao = get_connection()
    if conexao:
        cursor = None
        try:
            cursor = conexao.cursor()

            # Passo A: Buscar o ID numérico da subcategoria baseada no nome
            cursor.execute("SELECT id FROM subcategorias WHERE nome = %s LIMIT 1", (subcategoria_nome,))
            resultado = cursor.fetchone()

            if not resultado:
                flash("Erro: Subcategoria inválida ou não encontrada.", "danger")
                return redirect(url_for('index'))
            
            subcategoria_id = resultado[0]

            # Passo B: Inserir o Chamado na tabela principal
            sql = """
                INSERT INTO Chamado 
                (prontuario, nome_usuario, subcategoria_id, patrimonio_pc, patrimonio_tela, descricao) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            valores = (prontuario, nome, subcategoria_id, pat_pc, pat_tela, descricao_completa)
            
            cursor.execute(sql, valores)
            conexao.commit()

            # Sucesso! Retorna mensagem para o Frontend
            flash("✅ Chamado aberto com sucesso! A equipe de TI foi notificada.", "success")
            return redirect(url_for('index'))

        except Exception as e:
            print(f"Erro crítico no banco: {e}")
            flash("❌ Ocorreu um erro interno ao processar sua requisição.", "danger")
            return redirect(url_for('index'))
        finally:
            close_connection(conexao, cursor)
    else:
        flash("❌ Sistema temporariamente indisponível (Falha no Banco).", "warning")
        return redirect(url_for('index'))

if __name__ == '__main__':
    # O debug=True permite que o servidor atualize sozinho quando você salva um arquivo
    app.run(debug=True, port=5000)