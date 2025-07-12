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
import {
  buscarRegistrosGenericos,
  buscarProdutoresCooperativa,
  buscarPlantacoesDetalhadas, // import da nova função
} from '../../database/database';

export default function Visualizar() {
  const { titulo, id } = useLocalSearchParams();
  const tabelas = {
    1: 'produtor',
    // 2: plantacao  ← agora trataremos separadamente
    3: 'cooperativa',
    4: 'municipio',
    5: 'comunidade',
    6: 'face_exposicao',
  };

  const [header, setHeader] = useState([]);
  const [data, setData]     = useState([]);
  const [busca, setBusca]   = useState('');

  const formatHeader = (col) => {
    if (col === 'id') return 'Id';
    if (col.startsWith('id_')) return 'Id';
    return col
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const carregarDados = async () => {
    const tipo = parseInt(id, 10);

    if (tipo === 1) {
      // PRODUTOR + cooperativa, já existente
      let regs = await buscarProdutoresCooperativa();
      regs = regs.map(item => ({
        ...item,
        cooperativa:
          item.cooperativa && item.cooperativa.trim() !== ''
            ? item.cooperativa
            : 'Não participa',
        cpf_produtor:
          item.cpf_produtor && item.cpf_produtor.trim() !== ''
            ? item.cpf_produtor
            : 'Não informado',
      }));
      if (regs.length) {
        const cols = Object.keys(regs[0]);
        setHeader(cols.map(formatHeader));
        setData(regs.map(r => cols.map(c => (r[c] ?? '').toString())));
      } else {
        setHeader([]);
        setData([]);
      }

    } else if (tipo === 2) {
      // PLANTAÇÃO detalhada: usa GROUP_CONCAT de faces etc.
      const regs = await buscarPlantacoesDetalhadas();
      if (regs.length) {
        const cols = Object.keys(regs[0]);
        setHeader(cols.map(formatHeader));
        setData(regs.map(r => cols.map(c => (r[c] ?? '').toString())));
      } else {
        setHeader([]);
        setData([]);
      }

    } else {
      // demais tabelas genéricas
      const nomeTabela = tabelas[tipo];
      if (!nomeTabela) return;
      const regs = await buscarRegistrosGenericos(nomeTabela);
      if (regs.length) {
        const cols = Object.keys(regs[0]);
        setHeader(cols.map(formatHeader));
        setData(regs.map(r => cols.map(c => (r[c] ?? '').toString())));
      } else {
        setHeader([]);
        setData([]);
      }
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  const handlePress = (row) => {
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
          input
          onChangeText={setBusca}
          value={busca}
        />
        <Tabela
          header={header}
          data={data}
          onRowPress={handlePress}
          hiddenColumns={[0]}  // esconde o ID
        />
      </ViewCenter>
    </View>
  );
}
