import React, { useState, useEffect, useDeferredValue } from 'react';
import { View } from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { router, useLocalSearchParams } from 'expo-router';
import Tabela from '../../components/personalizados/Tabela';
import {
  buscarRegistrosGenericos,
  buscarRegistrosComFiltro,
  buscarProdutoresCooperativa,
  buscarPlantacoesDetalhadas,
} from '../../database/database';

export default function Visualizar() {
  const { titulo, id } = useLocalSearchParams();
  const tabelas = {
    1: 'produtor',
    2: 'plantacao',
    3: 'cooperativa',
    4: 'municipio',
    5: 'comunidade',
    6: 'face_exposicao',
    7:'variedade',
  };

  const [header, setHeader] = useState([]);
  const [data, setData] = useState([]);
  const [busca, setBusca] = useState('');
  const buscaAdiada = useDeferredValue(busca);

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
    const termoBusca = buscaAdiada.trim().toLowerCase();

    let registros = [];

    if (tipo === 1) {
      registros = await buscarProdutoresCooperativa();
      registros = registros.map((item) => ({
        ...item,
        cooperativa: item.cooperativa?.trim() || 'Não participa',
        cpf_produtor: item.cpf_produtor
          ? item.cpf_produtor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          : 'Não informado',
      }));

      if (termoBusca) {
        registros = registros.filter((r) =>
          Object.values(r).some((val) =>
            val?.toString().toLowerCase().includes(termoBusca)
          )
        );
      }

    } else if (tipo === 2) {
      registros = await buscarPlantacoesDetalhadas();

      if (termoBusca) {
        registros = registros.filter((r) =>
          Object.values(r).some((val) =>
            val?.toString().toLowerCase().includes(termoBusca)
          )
        );
      }

    } else {
      const nomeTabela = tabelas[tipo];
      if (!nomeTabela) return;

      registros = termoBusca
        ? await buscarRegistrosComFiltro(nomeTabela, termoBusca)
        : await buscarRegistrosGenericos(nomeTabela);
    }

    if (registros.length) {
      const colunas = Object.keys(registros[0]);
      setHeader(colunas.map(formatHeader));
      setData(registros.map(r => colunas.map(c => (r[c] ?? '').toString())));
    } else {
      setHeader([]);
      setData([]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id, buscaAdiada]);

  const handlePress = (row) => {
    console.log('--- Registro selecionado ---');
    row.forEach(({ label, value }) => {
      console.log(`${label}: ${value}`);
    });
    if(parseInt(id)===1){
      router.push({pathname:'(telas)/CadastrarProdutor',
        params:{id_produtor:row[0].value}
      })
    }
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
          hiddenColumns={[0]} // esconde o ID
        />
      </ViewCenter>
    </View>
  );
}
