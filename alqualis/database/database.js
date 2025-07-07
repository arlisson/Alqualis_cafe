import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing'; // opcional: para abrir o menu de compartilhamento
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";

let db = null;
/*
*
Essa função abre o database, se ele não existir, ele é criado
*/
/**
 * 
 * @returns Retorna a conexão com o banco
 */
export const openDatabase = () => {
  db = SQLite.openDatabaseSync("alqualis");
  // Exibe o caminho completo do arquivo .db no console
  //console.log("📂 Caminho do banco de dados:", db.databasePath);
  return db;
};


/**
Essa função cria a estrutura de tabelas do banco de dados
 */

/**
 * 
 * @returns Cria a estrutura de tabelas do banco de dados, não retorna nada
 */
export const createDatabase = async (mensagem=true) => {
  const db = openDatabase();

  try {
    // 1. Criação das tabelas
    await db.execAsync(`
      

    `);

  } catch (error) {
    console.error("❌ Erro ao criar o banco de dados:", error);
    mensagem ? Alert.alert("Erro", "Erro ao criar o banco de dados."):'';
  }

  return db;
};


  
  // No final do arquivo
export default {};
