import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";


let db = null;
const DB_NAME = "alqualis";

export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
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
  const database = await openDatabase();

  try {
    await database.execAsync(`
      PRAGMA foreign_keys = ON;

      -- -----------------------------------------------------
      -- Tabela produtor
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS produtor (
        id_produtor        INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_produtor      TEXT    NOT NULL,
        cpf_produtor       TEXT    UNIQUE,
        codigo_produtor    TEXT    UNIQUE
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
        -- removemos o campo 'face_exposicao' aqui porque agora teremos tabela de junção
        FOREIGN KEY (id_produtor)       REFERENCES produtor(id_produtor),
        FOREIGN KEY (id_variedade)      REFERENCES variedade(id_variedade),
        FOREIGN KEY (id_comunidade)     REFERENCES comunidade(id_comunidade),
        FOREIGN KEY (id_municipio)      REFERENCES municipio(id_municipio)
      );

      -- Índices adicionais para acelerar buscas
      CREATE INDEX IF NOT EXISTS idx_plantacao_produtor   ON plantacao(id_produtor);
      CREATE INDEX IF NOT EXISTS idx_plantacao_variedade  ON plantacao(id_variedade);
      CREATE INDEX IF NOT EXISTS idx_plantacao_comunidade ON plantacao(id_comunidade);
      CREATE INDEX IF NOT EXISTS idx_plantacao_municipio  ON plantacao(id_municipio);

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

      CREATE INDEX IF NOT EXISTS idx_cp_cooperativa ON cooperativa_produtor(id_cooperativa);
      CREATE INDEX IF NOT EXISTS idx_cp_produtor     ON cooperativa_produtor(id_produtor);

      -- -----------------------------------------------------
      -- Tabela face_exposicao
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS face_exposicao (
        id_face_exposicao   INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_face_exposicao TEXT    UNIQUE
      );

      -- -----------------------------------------------------
      -- Tabela de junção plantacao ↔ face_exposicao
      -- -----------------------------------------------------
      CREATE TABLE IF NOT EXISTS face_exposicao_plantacao (
        id_face_exposicao_plantacao INTEGER PRIMARY KEY AUTOINCREMENT,
        id_face_exposicao           INTEGER,
        id_plantacao                INTEGER,
        FOREIGN KEY (id_face_exposicao) REFERENCES face_exposicao(id_face_exposicao),
        FOREIGN KEY (id_plantacao)      REFERENCES plantacao(id_plantacao)
      );

      CREATE INDEX IF NOT EXISTS idx_fep_face       ON face_exposicao_plantacao(id_face_exposicao);
      CREATE INDEX IF NOT EXISTS idx_fep_plantacao  ON face_exposicao_plantacao(id_plantacao);

      
      

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
 * @param {*} nome_produtor
 * @param {*} cpf_produtor
 * @param {*} codigo_produtor
 * @param {*} id_cooperativa
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

  const database = await openDatabase();

  try {
    // 🔍 Verifica se CPF já existe (se fornecido)
    if (cpf_produtor) {
      const existeCPF = await database.getFirstAsync(
        `SELECT 1 FROM produtor WHERE cpf_produtor = ? LIMIT 1;`,
        [cpf_produtor]
      );
      if (existeCPF) {
        Alert.alert("Erro", "Este CPF já está cadastrado.");
        return null;
      }
    }

    // 🔍 Verifica se Código já existe (se fornecido)
    if (codigo_produtor) {
      const existeCodigo = await database.getFirstAsync(
        `SELECT 1 FROM produtor WHERE codigo_produtor = ? LIMIT 1;`,
        [codigo_produtor]
      );
      if (existeCodigo) {
        Alert.alert("Erro", "Este código de produtor já está cadastrado.");
        return null;
      }
    }

    // ✅ Insere produtor
    const result = await database.runAsync(
      `INSERT INTO produtor (nome_produtor, cpf_produtor, codigo_produtor)
       VALUES (?, ?, ?);`,
      [nome_produtor, cpf_produtor, codigo_produtor]
    );
    const id = result.lastInsertRowId;

    // 🔗 Associa cooperativa (se houver)
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
 * @description Associa produtor ↔ cooperativa
 * @param {*} id_produtor
 * @param {*} id_cooperativa
 * @returns {boolean} true or false
 */
export const associarProdutorCooperativa = async ({
  id_produtor,
  id_cooperativa,
}) => {
  if (!id_produtor || !id_cooperativa) {
    Alert.alert("Erro", "Produtor e Cooperativa devem ser informados.");
    return false;
  }
  const database = await openDatabase();

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
 * @description Busca todos os registros de uma tabela
 * @param {*} nomeTabela
 */
export const buscarRegistrosGenericos = async (nomeTabela) => {
  const database = await openDatabase();
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
  const entries = Object.entries(data);
  if (entries.length !== 1) {
    throw new Error("inserirGenerico precisa de exatamente uma coluna/valor");
  }

  const [column, value] = entries[0];
  const valor = value?.toString().trim();

  if (!valor) {
    Alert.alert("Erro", `O campo ${column} é obrigatório.`);
    return null;
  }

  const db = await openDatabase();

  try {
    // Verificação se já existe
    const checkSql = `SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1;`;
    const existing = await db.getFirstAsync(checkSql, [valor]);

    if (existing) {
      Alert.alert("Aviso", `O valor "${valor}" já está cadastrado em ${table}.`);
      return null;
    }

    // Inserção
    const insertSql = `INSERT INTO ${table} (${column}) VALUES (?);`;
    const result = await db.runAsync(insertSql, [valor]);
    Alert.alert("Sucesso", successMessage);
    return result.lastInsertRowId;

  } catch (error) {
    console.error(`❌ Erro ao inserir em ${table}:`, error);
    Alert.alert("Erro", `Erro ao cadastrar em ${table}.`);
    return null;
  }
};


/**
 * @description Busca todos os produtores com todos os seus campos, 
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

/**
 * @description Busca um produtor pelo ID com todos os seus campos,
 * e adiciona também o nome da cooperativa (ou null) e o id da cooperativa.
 *
 * @param {number} idProdutor - ID do produtor a ser buscado
 * @returns {Promise<Object|null>} Objeto com os dados do produtor, `cooperativa` e `id_cooperativa`, ou `null`
 */
export async function buscarProdutorPorId(idProdutor) {
  const db = await openDatabase();
  const sql = `
    SELECT
      p.*,
      cp.id_cooperativa,
      c.nome_cooperativa AS cooperativa
    FROM produtor p
    LEFT JOIN cooperativa_produtor cp
      ON cp.id_produtor = p.id_produtor
    LEFT JOIN cooperativa c
      ON c.id_cooperativa = cp.id_cooperativa
    WHERE p.id_produtor = ?;
  `;
  try {
    const row = await db.getAllAsync(sql, [idProdutor]);
    return row || null;
  } catch (error) {
    console.error('❌ Erro ao buscar produtor por ID com cooperativa:', error);
    throw error;
  }
}


/**
 * @description Busca todas as plantações, substituindo
 * - id_produtor   → nome_produtor
 * - id_variedade  → nome_variedade
 * - id_comunidade → nome_comunidade
 * - id_municipio  → nome_municipio
 * E agrupando todas as faces de exposição numa coluna `faces_exposicao`
 *
 * @returns {Promise<Array<Object>>} 
 *   Cada objeto terá:
 *     id_plantacao,
 *     nome_plantacao,
 *     produtor,
 *     variedade,
 *     comunidade,
 *     municipio,
 *     latitude,
 *     longitude,
 *     altitude_media,
 *     nome_talhao,
 *     faces_exposicao  // ex: "Norte, Sul, Leste"
 */
export async function buscarPlantacoesDetalhadas() {
  const db = await openDatabase();
  const sql = `
    SELECT
      p.id_plantacao,
      p.nome_plantacao,
      pr.nome_produtor    AS produtor,
      v.nome_variedade    AS variedade,
      co.nome_comunidade  AS comunidade,
      mu.nome_municipio   AS municipio,
      p.latitude,
      p.longitude,
      p.altitude_media,
      p.nome_talhao,
      -- concatena todas as faces, separadas por vírgula e espaço
      GROUP_CONCAT(fe.nome_face_exposicao, ', ') AS faces_exposicao
    FROM plantacao p
    LEFT JOIN produtor pr
      ON pr.id_produtor = p.id_produtor
    LEFT JOIN variedade v
      ON v.id_variedade = p.id_variedade
    LEFT JOIN comunidade co
      ON co.id_comunidade = p.id_comunidade
    LEFT JOIN municipio mu
      ON mu.id_municipio = p.id_municipio
    -- junta via tabela de relação N:N
    LEFT JOIN face_exposicao_plantacao fep
      ON fep.id_plantacao = p.id_plantacao
    LEFT JOIN face_exposicao fe
      ON fe.id_face_exposicao = fep.id_face_exposicao
    GROUP BY p.id_plantacao
    ORDER BY p.id_plantacao;
  `;
  try {
    const rows = await db.getAllAsync(sql);
    return rows;
  } catch (error) {
    console.error('❌ Erro ao buscar plantações detalhadas:', error);
    throw error;
  }
}

/**
 * Insere uma plantação e associa múltiplas faces de exposição a ela.
 *
 * @param {Object} plantacao
 * @param {number} plantacao.id_produtor
 * @param {number} plantacao.id_variedade
 * @param {number} plantacao.id_comunidade
 * @param {number} plantacao.id_municipio
 * @param {string} plantacao.nome_plantacao
 * @param {string} [plantacao.latitude]
 * @param {string} [plantacao.longitude]
 * @param {string} [plantacao.altitude_media]
 * @param {string} [plantacao.nome_talhao]
 * @param {number[]} plantacao.faces Array de IDs de face_exposicao
 * @returns {Promise<number|null>} id da plantação ou null em caso de erro
 */
export const inserirPlantacao = async ({
  id_produtor,
  id_variedade,
  id_comunidade,
  id_municipio,
  nome_plantacao,
  latitude = null,
  longitude = null,
  altitude_media = null,
  nome_talhao = null,
  faces = [],
}) => {
  const db = await openDatabase();

  // validação mínima
  if (!id_produtor || !id_variedade || !id_comunidade || !id_municipio || !nome_plantacao) {
    Alert.alert('Erro', 'Campos obrigatórios não informados.');
    return null;
  }

  try {
    // inicia transação
    await db.execAsync('BEGIN TRANSACTION;');

    // 1) insere na plantacao
    const res = await db.runAsync(
      `INSERT INTO plantacao (
        id_produtor, id_variedade, id_comunidade, id_municipio,
        nome_plantacao, latitude, longitude, altitude_media, nome_talhao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id_produtor,
        id_variedade,
        id_comunidade,
        id_municipio,
        nome_plantacao,
        latitude,
        longitude,
        altitude_media,
        nome_talhao,
      ]
    );
    const id_plantacao = res.lastInsertRowId;

    // 2) associa cada face de exposição
    for (const id_face of faces) {
      await db.runAsync(
        `INSERT INTO face_exposicao_plantacao (id_face_exposicao, id_plantacao)
         VALUES (?, ?);`,
        [id_face, id_plantacao]
      );
    }

    // 3) commita
    await db.execAsync('COMMIT;');

    Alert.alert('Sucesso', 'Plantação cadastrada com sucesso!');
    return id_plantacao;

  } catch (error) {
    // no erro, desfaz a transação
    try { await db.execAsync('ROLLBACK;'); } catch (_) {/* ignore */}
    console.error('❌ Erro ao cadastrar plantação:', error);
    Alert.alert('Erro', 'Não foi possível cadastrar a plantação.');
    return null;
  }
};
/**
 * 
 * @param {*} tabela 
 * @param {*} termoBusca 
 * @returns Retorna a busca feita no filtro
 */
export const buscarRegistrosComFiltro = async (tabela, termoBusca) => {
  const db = await openDatabase();

  try {
    // 1. Tenta identificar colunas de texto via PRAGMA
    const colunasInfo = await db.getAllAsync(`PRAGMA table_info(${tabela});`);
    let colunasTexto = colunasInfo
      .filter(col =>
        col.type?.toUpperCase().includes('CHAR') || col.type?.toUpperCase().includes('TEXT')
      )
      .map(col => col.name);

    // 2. Fallback: se nada for identificado, tenta a coluna que começa com "nome_"
    if (colunasTexto.length === 0) {
      colunasTexto = colunasInfo
        .filter(col => col.name?.toLowerCase().startsWith('nome_'))
        .map(col => col.name);
    }

    // 3. Se ainda assim não achou nada, retorna []
    if (colunasTexto.length === 0) return [];

    // 4. Monta a cláusula WHERE
    const whereClause = colunasTexto.map(col => `${col} LIKE ?`).join(' OR ');
    const params = colunasTexto.map(() => `%${termoBusca}%`);
    const sql = `SELECT * FROM ${tabela} WHERE ${whereClause};`;

    const resultados = await db.getAllAsync(sql, params);
    return resultados;

  } catch (error) {
    console.error(`Erro ao buscar com filtro na tabela ${tabela}:`, error);
    return [];
  }
};

