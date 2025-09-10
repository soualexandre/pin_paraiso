import pandas as pd
import sqlite3
import os

def cadastrar_dados_excel_em_sqlite(excel_file, db_file):
    """
    Lê uma planilha Excel e cadastra os dados em um banco de dados SQLite.

    Args:
        excel_file (str): O caminho para o arquivo Excel (.xlsx, .xls).
        db_file (str): O caminho para o arquivo do banco de dados SQLite.
    """
    if not os.path.exists(excel_file):
        print(f"Erro: O arquivo Excel '{excel_file}' não foi encontrado.")
        return

    try:
        df = pd.read_excel(excel_file)
        
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Address (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uf TEXT NOT NULL,
                localidade TEXT NOT NULL,
                logradouro TEXT NOT NULL,
                tipo_numeracao TEXT,
                situacao TEXT,
                cep TEXT UNIQUE NOT NULL,
                bairro TEXT,
                tipo_codificacao TEXT,
                valido TEXT
            );
        ''')
        conn.commit()
        
        print(f"Conectado ao banco de dados '{db_file}' e tabela 'Address' criada/verificada.")

        for index, row in df.iterrows():
            print('CEP', row.get('cep'))
            try:
                record = {
                    'uf': row.get('uf'),
                    'localidade': row.get('localidade'),
                    'logradouro': row.get('logradouro'),
                    'tipo_numeracao': row.get('tipo_numeracao'),
                    'situacao': row.get('situacao'),
                    'cep': row.get('cep'),
                    'bairro': row.get('bairro'),
                    'tipo_codificacao': row.get('tipo_codificacao'),
                }
                
                if pd.isna(record['cep']):
                    print(f"Aviso: Linha {index + 2} ignorada devido a CEP ausente.")
                    continue

                cursor.execute('''
                    REPLACE INTO Address (uf, localidade, logradouro, tipo_numeracao, situacao, cep, bairro, tipo_codificacao)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                ''', (
                    record['uf'],
                    record['localidade'],
                    record['logradouro'],
                    record['tipo_numeracao'],
                    record['situacao'],
                    record['cep'],
                    record['bairro'],
                    record['tipo_codificacao']
                ))
            
            except sqlite3.Error as e:
                print(f"Erro ao inserir a linha {index + 2} (CEP: {record.get('cep')}): {e}")

        conn.commit()
        print("\n✅ Todos os dados foram processados.")

    except pd.errors.EmptyDataError:
        print("Erro: A planilha está vazia.")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()
            print("Conexão com o banco de dados fechada.")
            print("Colunas encontradas na planilha:", df.columns.tolist())


EXCEL_FILE_PATH = 'CEP PARAÍSO.xlsx' 
SQLITE_DB_PATH = 'street.db'

if __name__ == "__main__":
    cadastrar_dados_excel_em_sqlite(EXCEL_FILE_PATH, SQLITE_DB_PATH)