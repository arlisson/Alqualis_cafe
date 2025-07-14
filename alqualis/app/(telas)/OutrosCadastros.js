import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { useLocalSearchParams } from 'expo-router';
import {
  inserirGenerico,
  buscarRegistroGenericoPorId,
  atualizarGenerico
} from '../../database/database';

// 🔹 Função utilitária para mapear id → nome da tabela
const getNomeTabelaPorId = (id) => {
  const map = {
    '1': 'cooperativa',
    '2': 'municipio',
    '3': 'comunidade',
    '4': 'face_exposicao',
    '5': 'variedade',
  };
  return map[id] || null;
};

export default function OutrosCadastros() {
  const { label, id, id_cadastro, titulo } = useLocalSearchParams();
  const [nome, setNome] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

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
    '5': {
      table: 'variedade',
      field: 'nome_variedade',
      success: 'Variedade cadastrada com sucesso!',
    },
  };

  const config = cadastroMap[id];

  // 🔸 Carrega dados se for edição
  useEffect(() => {
    const carregarDados = async () => {
      if (!id_cadastro || !config) return;

      const nomeTabela = getNomeTabelaPorId(id);
      if (!nomeTabela) return;

      const registro = await buscarRegistroGenericoPorId(nomeTabela, Number(id_cadastro));
      console.log(registro)
      if (registro && config.field) {
        setNome(registro[config.field] || '');
      }
    };

    carregarDados();
  }, [id, id_cadastro]);

  const handleSalvar = async () => {
    setFormSubmitted(true);

    if (!nome.trim()) {
      Alert.alert('Atenção!', 'O nome não pode estar vazio.');
      return;
    }

    if (!config) {
      Alert.alert('Erro', 'Tipo de cadastro inválido.');
      return;
    }

    try {
      const payload = { [config.field]: nome.toUpperCase() };
      const resultId = await inserirGenerico(
        config.table,
        payload,
        config.success
      );
      if (resultId) {
        console.log(`✅ ${label} cadastrado(a) com ID: ${resultId}`);
        setNome('');
        setFormSubmitted(false);
      }
    } catch (error) {
      console.error(`❌ Erro ao cadastrar ${label}:`, error);
      Alert.alert('Erro', `Não foi possível cadastrar ${label}.`);
    }
  };

  const handleAtualizar = async () => {
  setFormSubmitted(true);

  if (!nome.trim()) {
    Alert.alert('Atenção!', 'O nome não pode estar vazio.');
    return;
  }

  if (!config || !id_cadastro) {
    Alert.alert('Erro', 'Informações de edição inválidas.');
    return;
  }

  try {
    const sucesso = await atualizarGenerico(
      config.table,
      config.field,
      nome.toUpperCase(),
      Number(id_cadastro),
      `${titulo} atualizado com sucesso!`
    );

    if (sucesso) {
      console.log(`✅ ${titulo} atualizado(a) com ID: ${id_cadastro}`);
      setFormSubmitted(false);
    }

  } catch (error) {
    console.error(`❌ Erro ao atualizar ${titulo}:`, error);
    Alert.alert('Erro', `Não foi possível atualizar ${titulo}.`);
  }
};


  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde }}>
      {titulo &&
      <HeaderTitle texto={`Editar ${titulo}`} voltar="true" home="true" />
      }
       {!titulo &&
      <HeaderTitle texto={`Cadastrar ${label}`} voltar="true" home="true" />
      }     
      <ViewCenter>
        <Label
          label="Nome"
          input={true}
          onChangeText={setNome}
          value={nome}
          required
          showError={formSubmitted}
          verificarDuplicado={{
            tabela: config?.table,
            campo: config?.field,
          }}
          mensagemDuplicadoPersonalizada={`Já existe um(a) ${label?.toLowerCase()} com esse nome.`}
        />
      </ViewCenter>
      {!id_cadastro &&
        <Botao texto='Salvar' onPress={handleSalvar} /> 
      }     
      
      {id_cadastro &&
      <>
        <Botao texto='Editar' onPress={handleAtualizar} cor={Cores.azul} foto = 'create-outline'/> 
        <Botao texto='Excluir' onPress={()=>console.log('calma calabreso')} cor={Cores.vermelho} foto='trash-outline' /> 
      </>
      }  
    </View>
  );
}
