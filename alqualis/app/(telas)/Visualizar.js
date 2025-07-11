import React, { useState, useEffect } from 'react';
import {
  View,
} from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { useLocalSearchParams } from 'expo-router';
import Tabela from '../../components/personalizados/Tabela';
import { buscarRegistrosGenericos } from '../../database/database';

export default function Visualizar() {
  const { titulo, id } = useLocalSearchParams();
  const tabelas = {
    1: 'produtor',
    2: 'plantacao',
    3: 'cooperativa',
    4: 'municipio',
    5: 'comunidade',
    6: 'face_exposicao',
  };

  const [header, setHeader] = useState([]);
  const [data, setData] = useState([]);
  const [busca, setBusca] = useState('');

  // Função auxiliar para formatar o texto de cada coluna
  const formatHeader = (col) => {
    if (col === 'id') {
      return 'Id';
    }
    // remove prefixo “id_” e também capitaliza “Id” se for o caso
    if (col.startsWith('id_')) {
      return 'Id';
    }
    // para outros casos, separa por '_' e capitaliza cada parte
    return col
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const carregarDados = async () => {
    const nomeTabela = tabelas[id];
    if (!nomeTabela) return;

    const registros = await buscarRegistrosGenericos(nomeTabela);

    if (registros.length > 0) {
      // pega os nomes das colunas a partir da primeira linha
      const colunas = Object.keys(registros[0]);

      // transforma cada registro em array de strings
      const linhas = registros.map(item =>
        colunas.map(col => (item[col] != null ? item[col].toString() : ''))
      );

      // formata cada nome de coluna para exibição
      const headersFormatados = colunas.map(formatHeader);

      setHeader(headersFormatados);
      setData(linhas);
    } else {
      setHeader([]);
      setData([]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  const handlePress = (row) => {
    // row: array de { label, value }
    //console.log(row)
    console.log('--- Registro selecionado ---');
    row.forEach(({ label, value }) => {
      console.log(`${label}: ${value}`);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde }}>
      <HeaderTitle texto={`Visualizar ${titulo}`} voltar='true' home='true' />
      <ViewCenter>
        <Label
          label={`Buscar ${titulo}`}
          input='true'
          onChangeText={setBusca}
          value={busca}
        />
        <Tabela
          header={header}
          data={data}
          onRowPress={handlePress}
          hiddenColumns={[0]}
        />
      </ViewCenter>
    </View>
  );
}
