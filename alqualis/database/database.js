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

      -- Tabela produtor
      CREATE TABLE IF NOT EXISTS produtor (
        id_produtor        INTEGER PRIMARY KEY,
        nome_produtor      TEXT NOT NULL,
        cpf_produtor       TEXT,
        codigo_produtor    TEXT,
        UNIQUE (cpf_produtor),
        UNIQUE (codigo_produtor)
      );

      -- Tabela comunidade
      CREATE TABLE IF NOT EXISTS comunidade (
        id_comunidade      INTEGER PRIMARY KEY,
        nome_comunidade    TEXT,
        UNIQUE (nome_comunidade)
      );

      -- Tabela municipio
      CREATE TABLE IF NOT EXISTS municipio (
        id_municipio       INTEGER PRIMARY KEY,
        nome_municipio     TEXT,
        UNIQUE (nome_municipio)
      );

      -- Tabela cooperativa
      CREATE TABLE IF NOT EXISTS cooperativa (
        id_cooperativa     INTEGER PRIMARY KEY,
        nome_cooperativa   TEXT,
        UNIQUE (nome_cooperativa)
      );

      -- Tabela variedade
      CREATE TABLE IF NOT EXISTS variedade (
        id_variedade       INTEGER PRIMARY KEY,
        nome_variedade     TEXT,
        UNIQUE (nome_variedade)
      );

      -- Tabela plantacao
      CREATE TABLE IF NOT EXISTS plantacao (
        id_plantacao     INTEGER PRIMARY KEY,
        id_produtor      INTEGER NOT NULL,
        id_variedade     INTEGER NOT NULL,
        id_comunidade    INTEGER NOT NULL,
        id_municipio     INTEGER NOT NULL,
        nome_plantacao   TEXT NOT NULL,
        latitude         TEXT,
        longitude        TEXT,
        altitude_media   TEXT,
        nome_talhao      TEXT,
        face_exposicao   TEXT,
        meses_colheita   TEXT,
        FOREIGN KEY (id_produtor)    REFERENCES produtor(id_produtor),
        FOREIGN KEY (id_variedade)   REFERENCES variedade(id_variedade),
        FOREIGN KEY (id_comunidade)  REFERENCES comunidade(id_comunidade),
        FOREIGN KEY (id_municipio)   REFERENCES municipio(id_municipio)
      );

      -- Índices auxiliares
      CREATE INDEX IF NOT EXISTS idx_plantacao_produtor   ON plantacao(id_produtor);
      CREATE INDEX IF NOT EXISTS idx_plantacao_variedade  ON plantacao(id_variedade);
      CREATE INDEX IF NOT EXISTS idx_plantacao_comunidade ON plantacao(id_comunidade);
      CREATE INDEX IF NOT EXISTS idx_plantacao_municipio  ON plantacao(id_municipio);

      -- Tabela cooperativa_produtor
      CREATE TABLE IF NOT EXISTS cooperativa_produtor (
        id_cooperativa_produtor INTEGER PRIMARY KEY,
        id_cooperativa          INTEGER NOT NULL,
        id_produtor             INTEGER NOT NULL,
        FOREIGN KEY (id_cooperativa) REFERENCES cooperativa(id_cooperativa),
        FOREIGN KEY (id_produtor)    REFERENCES produtor(id_produtor)
      );

      CREATE INDEX IF NOT EXISTS idx_cp_cooperativa ON cooperativa_produtor(id_cooperativa);
      CREATE INDEX IF NOT EXISTS idx_cp_produtor    ON cooperativa_produtor(id_produtor);

      -- Tabela face_exposicao
      CREATE TABLE IF NOT EXISTS face_exposicao (
        id_face_exposicao     INTEGER PRIMARY KEY,
        nome_face_exposicao   TEXT,
        UNIQUE (nome_face_exposicao)
      );

      -- Tabela de junção face_exposicao_plantacao
      CREATE TABLE IF NOT EXISTS face_exposicao_plantacao (
        id_face_exposicao_plantacao INTEGER PRIMARY KEY,
        id_face_exposicao           INTEGER,
        id_plantacao                INTEGER,
        FOREIGN KEY (id_face_exposicao) REFERENCES face_exposicao(id_face_exposicao),
        FOREIGN KEY (id_plantacao)      REFERENCES plantacao(id_plantacao)
      );

      CREATE INDEX IF NOT EXISTS idx_fep_face      ON face_exposicao_plantacao(id_face_exposicao);
      CREATE INDEX IF NOT EXISTS idx_fep_plantacao ON face_exposicao_plantacao(id_plantacao);
   
      INSERT INTO cooperativa (nome_cooperativa) VALUES ('COOPAGRI');
      INSERT INTO cooperativa (nome_cooperativa) VALUES ('AGROVALE');
      INSERT INTO cooperativa (nome_cooperativa) VALUES ('COOPCAFÉ');

      INSERT INTO municipio (nome_municipio) VALUES ('Lavras');
      INSERT INTO municipio (nome_municipio) VALUES ('Patrocínio');
      INSERT INTO municipio (nome_municipio) VALUES ('Manhuaçu');

      INSERT INTO comunidade (nome_comunidade) VALUES ('Santa Rosa');
      INSERT INTO comunidade (nome_comunidade) VALUES ('Boa Esperança');
      INSERT INTO comunidade (nome_comunidade) VALUES ('Monte Verde');

      INSERT INTO face_exposicao (nome_face_exposicao) VALUES ('Norte');
      INSERT INTO face_exposicao (nome_face_exposicao) VALUES ('Sul');
      INSERT INTO face_exposicao (nome_face_exposicao) VALUES ('Leste');

      INSERT INTO variedade (nome_variedade) VALUES ('Catuaí Amarelo');
      INSERT INTO variedade (nome_variedade) VALUES ('Bourbon Vermelho');
      INSERT INTO variedade (nome_variedade) VALUES ('Mundo Novo');

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
      [nome_produtor, cpf_produtor, codigo_produtor.replace(/\s+/g, '')]
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
 * @description Atualiza um produtor e sua associação com cooperativa
 * @param {*} id_produtor
 * @param {*} nome_produtor
 * @param {*} cpf_produtor
 * @param {*} codigo_produtor
 * @param {*} id_cooperativa
 * @returns {boolean} true se sucesso, false se erro
 */
export const atualizarProdutor = async ({
  id_produtor,
  nome_produtor,
  cpf_produtor = "",
  codigo_produtor = null,
  id_cooperativa = null,
}) => {
  if (!id_produtor || !nome_produtor) {
    Alert.alert("Erro", "ID e nome do produtor são obrigatórios.");
    return false;
  }

  const database = await openDatabase();

  try {
    // 🔍 Verifica se CPF já existe para outro produtor
    if (cpf_produtor) {
      const cpfDuplicado = await database.getFirstAsync(
        `SELECT 1 FROM produtor WHERE cpf_produtor = ? AND id_produtor != ? LIMIT 1;`,
        [cpf_produtor, id_produtor]
      );
      if (cpfDuplicado) {
        Alert.alert("Erro", "Este CPF já está cadastrado para outro produtor.");
        return false;
      }
    }

    // 🔍 Verifica se Código já existe para outro produtor
    if (codigo_produtor) {
      const codigoDuplicado = await database.getFirstAsync(
        `SELECT 1 FROM produtor WHERE codigo_produtor = ? AND id_produtor != ? LIMIT 1;`,
        [codigo_produtor, id_produtor]
      );
      if (codigoDuplicado) {
        Alert.alert("Erro", "Este código já está cadastrado para outro produtor.");
        return false;
      }
    }

    // ✅ Atualiza dados do produtor
    await database.runAsync(
      `UPDATE produtor
       SET nome_produtor = ?, cpf_produtor = ?, codigo_produtor = ?
       WHERE id_produtor = ?;`,
      [nome_produtor, cpf_produtor, codigo_produtor, id_produtor]
    );

    // 🔄 Remove associação anterior
    await database.runAsync(
      `DELETE FROM cooperativa_produtor WHERE id_produtor = ?;`,
      [id_produtor]
    );

    // 🔗 Reassocia cooperativa (se fornecida)
    if (id_cooperativa) {
      await database.runAsync(
        `INSERT INTO cooperativa_produtor (id_cooperativa, id_produtor)
         VALUES (?, ?);`,
        [id_cooperativa, id_produtor]
      );
    }

    Alert.alert("Sucesso", "Produtor atualizado com sucesso!");
    return true;

  } catch (error) {
    console.error("❌ Erro ao atualizar produtor:", error);
    Alert.alert("Erro", "Erro ao atualizar o produtor.");
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
 * @description Busca um único registro de uma tabela pelo ID
 * @param {string} nomeTabela - Nome da tabela (ex: 'produtor')
 * @param {number} id - ID do registro a ser buscado
 * @returns {Promise<Object|null>} Objeto com os dados ou null se não encontrado
 */
export const buscarRegistroGenericoPorId = async (nomeTabela, id) => {
  const database = await openDatabase();
  try {
    const row = await database.getFirstAsync(
      `SELECT * FROM ${nomeTabela} WHERE id_${nomeTabela} = ?;`,
      [id]
    );
    return row || null;
  } catch (error) {
    console.error(`❌ Erro ao buscar registro em ${nomeTabela} por ID:`, error);
    Alert.alert("Erro", `Não foi possível buscar o registro de ${nomeTabela}.`);
    return null;
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
 * @description Atualiza um registro genérico em qualquer tabela
 * @param {string} table - Nome da tabela (ex: 'cooperativa')
 * @param {string} column - Nome da coluna (ex: 'nome_cooperativa')
 * @param {string|number} value - Novo valor
 * @param {number} id - ID do registro que será atualizado
 * @param {string} successMessage - Texto de sucesso no Alert
 * @returns {Promise<boolean>} true se sucesso, false caso erro
 */
export const atualizarGenerico = async (table, column, value, id, successMessage) => {
  const valor = value?.toString().trim();
  if (!valor) {
    Alert.alert("Erro", `O campo ${column} é obrigatório.`);
    return false;
  }

  const db = await openDatabase();

  try {
    // Verifica se já existe outro com o mesmo nome
    const checkSql = `SELECT 1 FROM ${table} WHERE ${column} = ? AND id_${table} != ? LIMIT 1;`;
    const existente = await db.getFirstAsync(checkSql, [valor, id]);

    if (existente) {
      Alert.alert("Aviso", `Já existe um registro com o valor "${valor}" em ${table}.`);
      return false;
    }

    // Atualização
    const updateSql = `UPDATE ${table} SET ${column} = ? WHERE id_${table} = ?;`;
    await db.runAsync(updateSql, [valor, id]);

    Alert.alert("Sucesso", successMessage);
    return true;

  } catch (error) {
    console.error(`❌ Erro ao atualizar ${table}:`, error);
    Alert.alert("Erro", `Erro ao atualizar em ${table}.`);
    return false;
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
 * e os meses de colheita como array.
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
 *     faces_exposicao,  // ex: "Norte, Sul, Leste"
 *     meses_colheita    // ex: ["Janeiro", "Março"]
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
      p.meses_colheita,
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
    LEFT JOIN face_exposicao_plantacao fep
      ON fep.id_plantacao = p.id_plantacao
    LEFT JOIN face_exposicao fe
      ON fe.id_face_exposicao = fep.id_face_exposicao
    GROUP BY p.id_plantacao
    ORDER BY p.id_plantacao;
  `;
  try {
    const rows = await db.getAllAsync(sql);

    // converte meses_colheita de JSON para array
    return rows.map(row => ({
      ...row,
      meses_colheita: row.meses_colheita ? JSON.parse(row.meses_colheita) : []
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar plantações detalhadas:', error);
    throw error;
  }
}


/**
 * @description Busca uma plantação pelo ID, incluindo todas as faces de exposição associadas.
 *
 * @param {number} idPlantacao - ID da plantação a ser buscada
 * @returns {Promise<Object|null>} Objeto com dados da plantação e um array `faces` com os IDs das exposições, ou null se não encontrada
 */
export async function buscarPlantacaoPorId(idPlantacao) {
  const db = await openDatabase();

  const sqlPlantacao = `
    SELECT *
    FROM plantacao
    WHERE id_plantacao = ?;
  `;

  const sqlFaces = `
    SELECT id_face_exposicao
    FROM face_exposicao_plantacao
    WHERE id_plantacao = ?;
  `;

  try {
    // Busca a plantação (como array)
    const rows = await db.getAllAsync(sqlPlantacao, [idPlantacao]);
    const plantacao = rows[0]; // ✅ Pega o primeiro registro

    if (!plantacao) return null;

    // Busca as faces associadas
    const faces = await db.getAllAsync(sqlFaces, [idPlantacao]);
    plantacao.faces = faces.map(f => f.id_face_exposicao);

    // Trata meses_colheita
    try {
      plantacao.meses_colheita = plantacao.meses_colheita
        ? JSON.parse(plantacao.meses_colheita)
        : [];
    } catch {
      plantacao.meses_colheita = [];
    }

    return plantacao;

  } catch (error) {
    console.error('❌ Erro ao buscar plantação por ID:', error);
    Alert.alert('Erro', 'Não foi possível carregar os dados da plantação.');
    return null;
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
  meses_colheita=null
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
        nome_plantacao, latitude, longitude, altitude_media, nome_talhao, meses_colheita
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
        JSON.stringify(meses_colheita) // 👈 Salva como JSON string
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
 * Atualiza uma plantação existente e suas associações de face de exposição.
 *
 * @param {Object} plantacao
 * @param {number} plantacao.id_plantacao
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
 * @param {string[]} [plantacao.meses_colheita]
 * @returns {Promise<boolean>} true se sucesso, false se erro
 */
export const atualizarPlantacao = async ({
  id_plantacao,
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
  meses_colheita = null
}) => {
  const db = await openDatabase();

  if (
    !id_plantacao || !id_produtor || !id_variedade || !id_comunidade ||
    !id_municipio || !nome_plantacao
  ) {
    Alert.alert('Erro', 'Campos obrigatórios não informados.');
    return false;
  }

  try {
    await db.execAsync('BEGIN TRANSACTION;');

    // Atualiza a plantação
    await db.runAsync(
      `UPDATE plantacao SET
        id_produtor = ?,
        id_variedade = ?,
        id_comunidade = ?,
        id_municipio = ?,
        nome_plantacao = ?,
        latitude = ?,
        longitude = ?,
        altitude_media = ?,
        nome_talhao = ?,
        meses_colheita = ?
      WHERE id_plantacao = ?;`,
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
        JSON.stringify(meses_colheita),
        id_plantacao
      ]
    );

    // Remove faces antigas
    await db.runAsync(
      `DELETE FROM face_exposicao_plantacao WHERE id_plantacao = ?;`,
      [id_plantacao]
    );

    // Insere novas faces
    for (const id_face of faces) {
      await db.runAsync(
        `INSERT INTO face_exposicao_plantacao (id_face_exposicao, id_plantacao)
         VALUES (?, ?);`,
        [id_face, id_plantacao]
      );
    }

    await db.execAsync('COMMIT;');
    Alert.alert('Sucesso', 'Plantação atualizada com sucesso!');
    return true;

  } catch (error) {
    try { await db.execAsync('ROLLBACK;'); } catch (_) {}
    console.error('❌ Erro ao atualizar plantação:', error);
    Alert.alert('Erro', 'Não foi possível atualizar a plantação.');
    return false;
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

///////////////////////// EXCLUIR ///////////////////////////////////////////////

export const excluirPlantacao = async (id_plantacao) => {
  const db = await openDatabase();
  try {
    await db.execAsync('BEGIN TRANSACTION;');

    // Remove associações com faces de exposição
    await db.runAsync(
      `DELETE FROM face_exposicao_plantacao WHERE id_plantacao = ?;`,
      [id_plantacao]
    );

    // Remove a plantação
    await db.runAsync(
      `DELETE FROM plantacao WHERE id_plantacao = ?;`,
      [id_plantacao]
    );

    await db.execAsync('COMMIT;');
    Alert.alert('Sucesso', 'Plantação excluída com sucesso!');
    return true;
  } catch (error) {
    try { await db.execAsync('ROLLBACK;'); } catch (_) {}
    console.error('❌ Erro ao excluir plantação:', error);
    Alert.alert('Erro', 'Erro ao excluir a plantação.');
    return false;
  }
};

export const excluirProdutor = async (id_produtor) => {
  const db = await openDatabase();
  try {
    await db.execAsync('BEGIN TRANSACTION;');

    // Verifica se há plantações associadas
    const plantaExistente = await db.getFirstAsync(
      `SELECT 1 FROM plantacao WHERE id_produtor = ? LIMIT 1;`,
      [id_produtor]
    );
    if (plantaExistente) {
      Alert.alert('Aviso', 'Este produtor está vinculado a plantações e não pode ser excluído.');
      await db.execAsync('ROLLBACK;');
      return false;
    }

    // Remove associação com cooperativa (se houver)
    await db.runAsync(
      `DELETE FROM cooperativa_produtor WHERE id_produtor = ?;`,
      [id_produtor]
    );

    // Remove o produtor
    await db.runAsync(
      `DELETE FROM produtor WHERE id_produtor = ?;`,
      [id_produtor]
    );

    await db.execAsync('COMMIT;');
    Alert.alert('Sucesso', 'Produtor excluído com sucesso!');
    return true;
  } catch (error) {
    try { await db.execAsync('ROLLBACK;'); } catch (_) {}
    console.error('❌ Erro ao excluir produtor:', error);
    Alert.alert('Erro', 'Erro ao excluir o produtor.');
    return false;
  }
};


export const excluirGenerico = async (tabela, id) => {
  const db = await openDatabase();

  const idColumnMap = {
    cooperativa: 'id_cooperativa',
    municipio: 'id_municipio',
    comunidade: 'id_comunidade',
    face_exposicao: 'id_face_exposicao',
    variedade: 'id_variedade',
  };

  const dependenciasMap = {
    cooperativa: { tabela: 'cooperativa_produtor', coluna: 'id_cooperativa' },
    municipio: { tabela: 'plantacao', coluna: 'id_municipio' },
    comunidade: { tabela: 'plantacao', coluna: 'id_comunidade' },
    face_exposicao: { tabela: 'face_exposicao_plantacao', coluna: 'id_face_exposicao' },
    variedade: { tabela: 'plantacao', coluna: 'id_variedade' },
  };

  const idColumn = idColumnMap[tabela];
  const dependenteInfo = dependenciasMap[tabela];

  if (!idColumn || !dependenteInfo) {
    Alert.alert('Erro', `Configuração de exclusão inválida para tabela '${tabela}'.`);
    return false;
  }

  try {
    await db.execAsync('BEGIN TRANSACTION;');

    const dependente = await db.getFirstAsync(
      `SELECT 1 FROM ${dependenteInfo.tabela} WHERE ${dependenteInfo.coluna} = ? LIMIT 1;`,
      [id]
    );

    if (dependente) {
      Alert.alert('Aviso', 'Este registro está vinculado a outro e não pode ser excluído.');
      await db.execAsync('ROLLBACK;');
      return false;
    }

    await db.runAsync(
      `DELETE FROM ${tabela} WHERE ${idColumn} = ?;`,
      [id]
    );

    await db.execAsync('COMMIT;');
    Alert.alert('Sucesso', `Registro excluído de ${tabela}.`);
    return true;

  } catch (error) {
    try { await db.execAsync('ROLLBACK;'); } catch (_) {}
    console.error(`❌ Erro ao excluir em ${tabela}:`, error);
    Alert.alert('Erro', `Erro ao excluir o registro de ${tabela}.`);
    return false;
  }
};

/**
 * @description Retorna todos os dados em uma única tabela unificada, com:
 * - nome_produtor, cpf, codigo_produtor, cooperativa
 * - nome_plantacao, variedade, comunidade, municipio
 * - latitude, longitude, altitude_media, nome_talhao
 * - faces_exposicao (string), meses_colheita (array)
 *
 * @returns {Promise<Array<Object>>}
 */
export async function buscarTudoUnificado() {
  const db = await openDatabase();
  const sql = `
    SELECT
      p.nome_produtor       AS "Nome do Produtor",
      p.cpf_produtor        AS "CPF do Produtor",
      p.codigo_produtor     AS "Código do Produtor",
      c.nome_cooperativa    AS "Cooperativa",
      pl.nome_plantacao     AS "Nome da Plantação",
      v.nome_variedade      AS "Variedade",
      com.nome_comunidade   AS "Comunidade",
      m.nome_municipio      AS "Município",
      pl.latitude           AS "Latitude",
      pl.longitude          AS "Longitude",
      pl.altitude_media     AS "Altitude Média",
      pl.nome_talhao        AS "Nome do Talhão",
      pl.meses_colheita     AS "Meses de Colheita",
      GROUP_CONCAT(fe.nome_face_exposicao, ', ') AS "Faces de Exposição"
    FROM produtor p
    LEFT JOIN cooperativa_produtor cp
      ON cp.id_produtor = p.id_produtor
    LEFT JOIN cooperativa c
      ON c.id_cooperativa = cp.id_cooperativa
    LEFT JOIN plantacao pl
      ON pl.id_produtor = p.id_produtor
    LEFT JOIN variedade v
      ON v.id_variedade = pl.id_variedade
    LEFT JOIN comunidade com
      ON com.id_comunidade = pl.id_comunidade
    LEFT JOIN municipio m
      ON m.id_municipio = pl.id_municipio
    LEFT JOIN face_exposicao_plantacao fep
      ON fep.id_plantacao = pl.id_plantacao
    LEFT JOIN face_exposicao fe
      ON fe.id_face_exposicao = fep.id_face_exposicao
    GROUP BY pl.id_plantacao
    ORDER BY p.nome_produtor, pl.nome_plantacao;
  `;

  try {
    const rows = await db.getAllAsync(sql);

    return rows.map(row => ({
      ...row,
      "Meses de Colheita": row["Meses de Colheita"]
        ? JSON.parse(row["Meses de Colheita"])
        : [],
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar dados unificados:', error);
    Alert.alert('Erro', 'Não foi possível carregar os dados completos.');
    return [];
  }
}


