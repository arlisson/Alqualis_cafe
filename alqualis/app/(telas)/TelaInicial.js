import React, {useState} from 'react';
import {
  View, Text, StyleSheet, Modal
} from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter'
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import {createDatabase,
  deleteDatabase,
  buscarTudoUnificado,
} from '../../database/database';
import Carregando from '../../components/personalizados/Carregando';
import { ImportarPlanilhaExcel } from '../../hooks/ImportarPlanilha';
import PrefixoModal from '../../components/personalizados/PrefixoModal';

export default function TelaInicial() {  
  const {produtor=false, plantacao=false , outros=false, titulo, funcao=false} = useLocalSearchParams()
    
  const [modalVisible, setModalVisible] = useState(false);
  
    
    
    
  const [loading, setLoading] = useState(false);
  // ⬇ Função chamada ao pressionar o botão "Importar"
    const handleImportar = () => {
      setModalVisible(true);
    };
  
    // ⬇ Quando o usuário confirma o prefixo no modal
    const handlePrefixoConfirmado = async (prefixo) => {
      setModalVisible(false);
      await ImportarPlanilhaExcel(setLoading, prefixo);
    };
  const handleCriarBanco = async () => {
      try {
        // Se você quiser mostrar algum feedback extra:
        // Alert.alert("Aguarde", "Criando o banco de dados…");
  
        await createDatabase(true);
        // Opcional: faça algo após a criação, como navegar ou recarregar dados
      } catch (error) {
        // A própria createDatabase já exibe um Alert em caso de erro,
        // mas abaixo você poderia tratar logs adicionais:
        Alert.alert("Erro ao criar banco na UI:", error);
      }
    };
  const handleExportar = async () => {
  try {
    const registros = await buscarTudoUnificado();

    // registros.forEach((registro, index) => {
    //   console.log(`Registro ${index + 1}:`, registro);
    // });
    
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
    //console.error('Erro ao exportar:', error);
    Alert.alert('Erro', `Erro ao exportar para Excel.\n${error}`);
  }
};  
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle  texto={titulo} voltar={true} home = {true}/>
      <ViewCenter>
        {produtor &&
            <>
                <Botao texto='Cadastrar Produtor' foto='person-add-outline'
                cor={Cores.marrom}
                onPress={() => router.push('(telas)/CadastrarProdutor')}
                />
                <Botao texto='Visualizar Produtor' foto='eye-outline'
                cor={Cores.marrom}
                onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Produtor', id: '1' } })}
                />
            </>
        }
        
        {plantacao &&
        <>
            <Botao texto='Cadastrar Plantação' foto='leaf-outline'
            cor={Cores.azul}
            onPress={() => router.push('(telas)/CadastrarPlantacao')}
            />
            <Botao texto='Visualizar Plantação' foto='eye-outline'
            cor={Cores.azul}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Plantação', id: '2', cor:Cores.azul } })}
            />
        
        </>
        }
        
        {outros &&
        <>
            <Botao texto='Cadastrar Cooperativa' foto='storefront-outline'
            cor={Cores.caramelo}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Cooperativa', id: '1' } })}
            />
            <Botao texto='Visualizar Cooperativas' foto='eye-outline'
            cor={Cores.caramelo}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Cooperativa', id: '3',cor:Cores.caramelo } })}
            />

            <Botao texto='Cadastrar Município' foto='business-outline'
            cor={Cores.verdeMusgo}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Município', id: '2' } })}
            />
            <Botao texto='Visualizar Município' foto='eye-outline'
            cor={Cores.verdeMusgo}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Município', id: '4',cor:Cores.verdeMusgo } })}
            />

            <Botao texto='Cadastrar Comunidade' foto='people-outline'
            cor={Cores.terracota}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Comunidade', id: '3' } })}
            />
            <Botao texto='Visualizar Comunidades' foto='eye-outline'
            cor={Cores.terracota}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Comunidade', id: '5',cor:Cores.terracota } })}
            />

            <Botao texto='Cadastrar Face de Exposição' foto='sunny-outline'
            cor={Cores.oliva}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Face de Exposição', id: '4' } })}
            />
            <Botao texto='Visualizar Face de Exposição' foto='eye-outline'
            cor={Cores.oliva}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Face de Exposição', id: '6',cor:Cores.oliva } })}
            />

            <Botao texto='Cadastrar Variedade' foto='eyedrop-outline'
            cor={Cores.vinho}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Variedade', id: '5' } })}
            />
            <Botao texto='Visualizar Variedade' foto='eye-outline'
            cor={Cores.vinho}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Variedade', id: '7',cor: Cores.vinho } })}
            />
        
        </>
        }     

        {funcao &&
          <>
            <Botao texto='Criar Banco' cor={Cores.azul} onPress={()=>handleCriarBanco()} />
            <Botao texto='Apagar Banco' cor={Cores.vermelho} onPress={() => deleteDatabase()} foto='trash-outline'/>
            <Botao texto='Importar' cor={Cores.vinho} onPress={() =>handleImportar()} foto='download-outline'/>
            <Carregando visible={loading}/>
            <Botao texto='Exportar' cor={Cores.caramelo} onPress={() =>handleExportar()} foto='share-outline'/>          
          
          </>
          
        }   

        {/* ⬇ MODAL DE PREFIXO */}
        <PrefixoModal
          visible={modalVisible}
          onConfirm={handlePrefixoConfirmado}
          onCancel={() => setModalVisible(false)}
        />
       
      </ViewCenter>
      
    </View>
  );
}

