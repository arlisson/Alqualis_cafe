import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { useLocalSearchParams } from 'expo-router';
import { inserirGenerico } from '../../database/database';

export default function OutrosCadastros() {
  const { label, id } = useLocalSearchParams();
  const [nome, setNome] = useState('');

  // Map de ID → tabela, campo e mensagem de sucesso
  const cadastroMap = {
    '1': {
      table: 'cooperativa',
      field: 'nome_cooperativa',
      success: 'Cooperativa cadastrada com sucesso!',
    },
    '2': {
      table: 'municipio',
      field: 'nome_municipio',
      success: 'Município cadastrado com sucesso!',
    },
    '3': {
      table: 'comunidade',
      field: 'nome_comunidade',
      success: 'Comunidade cadastrada com sucesso!',
    },
    '4': {
      table: 'face_exposicao',
      field: 'nome_face_exposicao',
      success: 'Face de exposição cadastrada com sucesso!',
    },
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção!', 'O nome não pode estar vazio.');
      return;
    }

    const config = cadastroMap[id];
    if (!config) {
      Alert.alert('Erro', 'Tipo de cadastro inválido.');
      return;
    }

    try {
      const payload = { [config.field]: nome };
      const resultId = await inserirGenerico(
        config.table,
        payload,
        config.success
      );
      if (resultId) {
        console.log(`✅ ${label} cadastrado(a) com ID: ${resultId}`);
        setNome('');
      }
    } catch (error) {
      console.error(`❌ Erro ao cadastrar ${label}:`, error);
      Alert.alert('Erro', `Não foi possível cadastrar ${label}.`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde }}>
      <HeaderTitle texto={`Cadastrar ${label}`} voltar="true" home="true" />
      <ViewCenter>
        <Label label="Nome" input="true" onChangeText={setNome} value={nome} validateOnProp={true} />
      </ViewCenter>
      <Botao texto="Salvar" onPress={handleSalvar} />
    </View>
  );
}
