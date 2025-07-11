import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";

let db = null;
const DB_NAME = "alqualis";

/**
 * Abre (ou retorna) a conexão SQLite
 */
export const openDatabase = () => {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
};

/**
 * @description Remove o arquivo do banco (apenas para testes/development)
 */
export const deleteDatabase = async () => {
  try {
    // Fecha se já estiver aberta
    if (db) {
      await db.closeAsync();
      db = null;
    }

    // Apaga o arquivo .db
    await SQLite.deleteDatabaseAsync(DB_NAME);
    Alert.alert("Sucesso", "🗑️ Banco de dados apagado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao apagar banco:", error);
    Alert.alert("Erro", "Não foi possível apagar o banco de dados.");
  }
};

/**
 * @description Cria as tabelas iniciais
 */
export const createDatabase = async (mensagem = true) => {
  const database = openDatabase();

  try {
    await database.execAsync(`
      -- Ativa verificação de chaves estrangeiras no SQLite
      PRAGMA foreign_keys = ON;

      -- -----------------------------------------------------
      -- Tabela produtor
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS produtor (
        id_produtor     INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_produtor   TEXT    NOT NULL,
        cpf_produtor    TEXT    UNIQUE,          -- retirado o DEFAULT
        codigo_produtor TEXT    UNIQUE
      );

      -- -----------------------------------------------------
      -- Tabela comunidade
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS comunidade (
        id_comunidade      INTEGER PRIMARY KEY,
        nome_comunidade    TEXT    UNIQUE
      );

      -- -----------------------------------------------------
      -- Tabela municipio
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS municipio (
        id_municipio       INTEGER PRIMARY KEY,
        nome_municipio     TEXT    UNIQUE
      );

      -- -----------------------------------------------------
      -- Tabela cooperativa
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS cooperativa (
        id_cooperativa     INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_cooperativa   TEXT    UNIQUE
      );

      -- -----------------------------------------------------
      -- Tabela variedade
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS variedade (
        id_variedade       INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_variedade     TEXT    UNIQUE
      );

      -- -----------------------------------------------------
      -- Tabela face_exposicao
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS face_exposicao (
        id_face_exposicao  INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_face_exposicao TEXT   UNIQUE
      );

      -- -----------------------------------------------------
      -- Tabela plantacao
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS plantacao (
        id_plantacao       INTEGER PRIMARY KEY AUTOINCREMENT,
        id_produtor        INTEGER NOT NULL,
        id_variedade       INTEGER NOT NULL,
        id_comunidade      INTEGER NOT NULL,
        id_municipio       INTEGER NOT NULL,
        nome_plantacao     TEXT    NOT NULL,
        latitude           TEXT,
        longitude          TEXT,
        altitude_media     TEXT,
        nome_talhao        TEXT,
        id_face_exposicao  INTEGER,
        FOREIGN KEY (id_produtor)       REFERENCES produtor(id_produtor),
        FOREIGN KEY (id_variedade)      REFERENCES variedade(id_variedade),
        FOREIGN KEY (id_comunidade)     REFERENCES comunidade(id_comunidade),
        FOREIGN KEY (id_municipio)      REFERENCES municipio(id_municipio),
        FOREIGN KEY (id_face_exposicao) REFERENCES face_exposicao(id_face_exposicao)
      );

      -- Índices adicionais para acelerar buscas
      CREATE INDEX IF NOT EXISTS idx_plantacao_produtor      ON plantacao(id_produtor);
      CREATE INDEX IF NOT EXISTS idx_plantacao_variedade     ON plantacao(id_variedade);
      CREATE INDEX IF NOT EXISTS idx_plantacao_comunidade    ON plantacao(id_comunidade);
      CREATE INDEX IF NOT EXISTS idx_plantacao_municipio     ON plantacao(id_municipio);
      CREATE INDEX IF NOT EXISTS idx_plantacao_face          ON plantacao(id_face_exposicao);

      -- -----------------------------------------------------
      -- Tabela cooperativa_produtor
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS cooperativa_produtor (
        id_cooperativa_produtor INTEGER PRIMARY KEY AUTOINCREMENT,
        id_cooperativa          INTEGER NOT NULL,
        id_produtor             INTEGER NOT NULL,
        FOREIGN KEY (id_cooperativa) REFERENCES cooperativa(id_cooperativa),
        FOREIGN KEY (id_produtor)    REFERENCES produtor(id_produtor)
      );

      -- Índices adicionais
      CREATE INDEX IF NOT EXISTS idx_cp_cooperativa ON cooperativa_produtor(id_cooperativa);
      CREATE INDEX IF NOT EXISTS idx_cp_produtor    ON cooperativa_produtor(id_produtor);
      

    `);

    if (mensagem) {
      Alert.alert("Sucesso", "Banco de dados criado com sucesso!");
    }
    return database;
  } catch (error) {
    console.error("❌ Erro ao criar banco de dados:", error);
    if (mensagem) {
      Alert.alert("Erro", "Erro ao criar o banco de dados.");
    }
    throw error;
  }
};

/**
 * @description Insere um produtor e opcionalmente associa a cooperativa
 */
export const inserirProdutor = async ({
  nome_produtor,
  cpf_produtor = "",
  codigo_produtor = null,
  id_cooperativa = null,
}) => {
  if (!nome_produtor) {
    Alert.alert("Erro", "O nome do produtor é obrigatório.");
    return null;
  }
  const database = openDatabase();

  try {
    // insere produtor
    const result = await database.runAsync(
      `INSERT INTO produtor (nome_produtor, cpf_produtor, codigo_produtor)
       VALUES (?, ?, ?);`,
      [nome_produtor, cpf_produtor, codigo_produtor]
    );
    const id = result.lastInsertRowId;

    // associa cooperativa, se informado
    if (id_cooperativa) {
      await database.runAsync(
        `INSERT INTO cooperativa_produtor (id_cooperativa, id_produtor)
         VALUES (?, ?);`,
        [id_cooperativa, id]
      );
    }

    Alert.alert("Sucesso", "Produtor cadastrado com sucesso!");
    return id;
  } catch (error) {
    console.error("❌ Erro ao inserir produtor:", error);
    Alert.alert("Erro", "Erro ao cadastrar o produtor.");
    return null;
  }
};

/**
 * Associa produtor ↔ cooperativa
 */
export const associarProdutorCooperativa = async ({
  id_produtor,
  id_cooperativa,
}) => {
  if (!id_produtor || !id_cooperativa) {
    Alert.alert("Erro", "Produtor e Cooperativa devem ser informados.");
    return false;
  }
  const database = openDatabase();

  try {
    await database.runAsync(
      `INSERT INTO cooperativa_produtor (id_cooperativa, id_produtor)
       VALUES (?, ?);`,
      [id_cooperativa, id_produtor]
    );
    Alert.alert("Sucesso", "Associação realizada com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao associar produtor à cooperativa:", error);
    Alert.alert("Erro", "Erro ao associar produtor à cooperativa.");
    return false;
  }
};

/**
 * Busca todos os registros de uma tabela
 */
export const buscarRegistrosGenericos = async (nomeTabela) => {
  const database = openDatabase();
  try {
    const rows = await database.getAllAsync(
      `SELECT * FROM ${nomeTabela};`
    );
    return rows;
  } catch (error) {
    console.error(`❌ Erro ao buscar registros de ${nomeTabela}:`, error);
    Alert.alert("Erro", `Não foi possível buscar ${nomeTabela}.`);
    return [];
  }
};

/**
 * @description Insere um registro genérico em qualquer tabela
 * @param {string} table - Nome da tabela (ex: 'cooperativa')
 * @param {Object} data   - Objeto com um único par { coluna: valor }
 * @param {string} successMessage - Texto de sucesso no Alert
 * @returns {Promise<number|null>} ID inserido ou null em caso de erro
 */
export const inserirGenerico = async (table, data, successMessage) => {
  // valida entrada
  const entries = Object.entries(data);
  if (entries.length !== 1) {
    throw new Error("inserirGenerico precisa de exatamente uma coluna/valor");
  }
  const [column, value] = entries[0];
  if (value == null || value.toString().trim() === "") {
    Alert.alert("Erro", `O campo ${column} é obrigatório.`);
    return null;
  }

  const db = openDatabase();
  const sql = `INSERT INTO ${table} (${column}) VALUES (?);`;

  try {
    const result = await db.runAsync(sql, [value]);
    Alert.alert("Sucesso", successMessage);
    return result.lastInsertRowId;
  } catch (error) {
    console.error(`❌ Erro ao inserir em ${table}:`, error);
    Alert.alert("Erro", `Erro ao cadastrar em ${table}.`);
    return null;
  }
};

/**
 * Busca todos os produtores com todos os seus campos,
 * e adiciona também o nome da cooperativa (ou null).
 *
 * @returns {Promise<Array<Object>>} Cada objeto terá todas as colunas de `produtor`
 * e ainda uma propriedade `cooperativa`.
 */
export async function buscarProdutoresCooperativa() {
  const db = await openDatabase();
  const sql = `
    SELECT
      p.*,
      c.nome_cooperativa AS cooperativa
    FROM produtor p
    LEFT JOIN cooperativa_produtor cp
      ON cp.id_produtor = p.id_produtor
    LEFT JOIN cooperativa c
      ON c.id_cooperativa = cp.id_cooperativa;
  `;
  try {
    const rows = await db.getAllAsync(sql);
    return rows;
  } catch (error) {
    console.error('❌ Erro ao buscar produtores com cooperativa:', error);
    throw error;
  }
}