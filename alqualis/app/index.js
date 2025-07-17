import React from 'react';
import {
  View, Text, StyleSheet,
  Alert
} from 'react-native';
import HeaderTitle from '../components/personalizados/headerTtitle';
import Cores from '../constants/Cores';
import Botao from '../components/personalizados/Botao';
import ViewCenter from '../components/personalizados/ViewCenter'
import { router } from 'expo-router';
import {createDatabase,
  deleteDatabase,
  buscarTudoUnificado
} from '../database/database';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

export default function Index() {  

  const handleCriarBanco = async () => {
    try {
      // Se você quiser mostrar algum feedback extra:
      // Alert.alert("Aguarde", "Criando o banco de dados…");

      await createDatabase(true);
      // Opcional: faça algo após a criação, como navegar ou recarregar dados
    } catch (error) {
      // A própria createDatabase já exibe um Alert em caso de erro,
      // mas abaixo você poderia tratar logs adicionais:
      console.error("Erro ao criar banco na UI:", error);
    }
  };
  
  const handleExportar = async () => {
  try {
    const registros = await buscarTudoUnificado();

    registros.forEach((registro, index) => {
      console.log(`Registro ${index + 1}:`, registro);
    });
    
    if (!registros || registros.length === 0) {
      Alert.alert('Aviso', 'Nenhum dado encontrado para exportar.');
      return;
    }

    // Converte os arrays de meses_colheita para string
    const registrosFormatados = registros.map(item => {
      const formatado = { ...item };
      if (Array.isArray(item["Meses de Colheita"])) {
        formatado["Meses de Colheita"] = item["Meses de Colheita"].join(', ');
      }
      return formatado;
    });

    // Cria a planilha a partir do JSON
    const worksheet = XLSX.utils.json_to_sheet(registrosFormatados);

    // 🔄 Define a largura das colunas com base no conteúdo
    const keys = Object.keys(registrosFormatados[0]);
    const colWidths = keys.map(key => {
      const maxLen = Math.max(
        key.length,
        ...registrosFormatados.map(row => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) }; // entre 10 e 40 caracteres
    });
    worksheet['!cols'] = colWidths;

    // 🧭 Centraliza o conteúdo de todas as células
    Object.keys(worksheet).forEach(cell => {
      if (cell[0] === '!') return; // ignora metadados
      worksheet[cell].s = {
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumo Amostras');

    // Gera a string base64 do Excel
    const excelBase64 = XLSX.write(workbook, {
      type: 'base64',
      bookType: 'xlsx',
      cellStyles: true // necessário para estilos
    });

    // Salva e compartilha
    const fileUri = FileSystem.documentDirectory + 'exportacao.xlsx';
    await FileSystem.writeAsStringAsync(fileUri, excelBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Exportar dados para Excel',
      UTI: 'com.microsoft.excel.xlsx',
    });

  } catch (error) {
    console.error('Erro ao exportar:', error);
    Alert.alert('Erro', 'Erro ao exportar para Excel');
  }
};


  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto='Gestão do Café' />
      <ViewCenter>
         <Botao texto='Gestão do Produtor' foto='person-outline'
          cor={Cores.marrom}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{produtor:true, titulo:'Gestão do Produtor'}})}
          />
          <Botao texto='Gestão da Plantação' foto='leaf-outline'
          cor={Cores.azul}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{plantacao:true, titulo:'Gestão da Plantação'}})}
          />
          <Botao texto='Outras Gestões' foto='file-tray-stacked-outline'
          cor={Cores.oliva}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{outros:true, titulo:'Outras Gestões'}})}
          />

        <Botao texto='Criar Banco' cor={Cores.azul} onPress={()=>handleCriarBanco()} />
        <Botao texto='Apagar Banco' cor={Cores.vermelho} onPress={() => deleteDatabase()} foto='trash-outline'/>
        <Botao texto='Exportar' cor={Cores.caramelo} onPress={() =>handleExportar()} foto='share-outline'/>
      </ViewCenter>
      
    </View>
  );
}

