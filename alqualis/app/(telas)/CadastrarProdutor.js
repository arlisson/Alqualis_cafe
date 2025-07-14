// CadastrarProdutor.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import { buscarRegistrosGenericos,
  inserirProdutor, 
  buscarProdutorPorId} from '../../database/database';
import { useLocalSearchParams } from 'expo-router';

export default function CadastrarProdutor() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [codigo, setCodigo] = useState('');
  const [coop, setCoop] = useState(null);

  const [prodList, setProdList] = useState([]);
  const [coopOptions, setCoopOptions] = useState([]);
  const [lastCode, setLastCode] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const {id_produtor} = useLocalSearchParams();

  useEffect(() => {
    
  if (!id_produtor) return;

  (async () => {
    try {
      const produtor = await buscarProdutorPorId(Number(id_produtor));
      //console.log(produtor);
      if (produtor) {
        
        setNome(produtor[0].nome_produtor || '');
        setCpf(produtor[0].cpf_produtor || '');
        setCodigo(produtor[0].codigo_produtor || '');

        if (produtor[0].id_cooperativa && produtor[0].cooperativa) {
          setCoop({
            label: produtor[0].cooperativa,
            value: produtor[0].id_cooperativa.toString()
          });
                  
        } else {
          setCoop(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produtor:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do produtor.');
    }
  })();
}, [id_produtor]);


  useEffect(() => {
    (async () => {
      const prods = await buscarRegistrosGenericos('produtor');
      setProdList(prods);
      if (prods.length) {
        const last = prods.reduce((a, b) => (a.id_produtor > b.id_produtor ? a : b));
        setLastCode(last.codigo_produtor || '');
      }
      const coops = await buscarRegistrosGenericos('cooperativa');
      setCoopOptions(coops.map(r => ({ label: r.nome_cooperativa, value: r.id_cooperativa.toString() })));
    })();
  }, []);

  const handleSalvar = async () => {
  setFormSubmitted(true); // ativa exibição de erros nos Labels

  const nomeValido = nome.trim() !== '';
  const codigoValido = codigo.trim() !== '';

  if (!nomeValido || !codigoValido) {
    Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
    return;
  }

  try {
    const payload = {
      nome_produtor: nome.trim().toUpperCase(),
      cpf_produtor: cpf ? cpf.replace(/\D/g, '') : null,
      codigo_produtor: codigo.trim().toUpperCase(),
      id_cooperativa: coop ? parseInt(coop.value, 10) : null,
    };

    const id = await inserirProdutor(payload);

    if (id) {
      //Alert.alert('Sucesso', 'Produtor cadastrado!');

      // 🔁 Limpa formulário
      setNome('');
      setCpf('');
      setCodigo('');
      setCoop(null);
      setFormSubmitted(false);

      // 🔁 Atualiza dados
      const prods = await buscarRegistrosGenericos('produtor');
      setProdList(prods);
      if (prods.length) {
        const last = prods.reduce((a, b) => (a.id_produtor > b.id_produtor ? a : b));
        setLastCode(last.codigo_produtor || '');
      }
    }
  } catch {
    Alert.alert('Erro', 'Não foi possível cadastrar');
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde,paddingBottom: RFValue(30) }}>
      {id_produtor &&
        <HeaderTitle texto='Editar Produtor' voltar='true' home='true' />
      }
      {!id_produtor &&
        <HeaderTitle texto='Cadastrar Produtor' voltar='true' home='true' />
      }
      <ViewCenter>
        <Label
          label='Nome'
          input
          value={nome}
          onChangeText={setNome}
          required
          showError={formSubmitted}
        />
        <Label
          label='CPF'
          input
          value={cpf}
          onChangeText={setCpf}
          mask='cpf'
          showError={formSubmitted}          
          verificarDuplicado={{ tabela: 'produtor', campo: 'cpf_produtor' }}
        />
        <Label
          label='Código'
          input
          value={codigo}
          onChangeText={setCodigo}
          required
          showError={formSubmitted}          
          verificarDuplicado={{ tabela: 'produtor', campo: 'codigo_produtor' }}
        />
        <Text style={styles.lastCode}>
          Último código: {lastCode || 'Nenhum'}
        </Text>
        <Label
          label='Cooperativa/Associação'
          dropdown
          value={coop}
          onChangeText={setCoop}
          data={coopOptions}
        />
        <TouchableOpacity style={styles.checkbox} onPress={() => setCoop(null)}>
          <Ionicons name={coop ? 'square-outline' : 'checkbox-outline'} size={RFValue(20)} />
          <Text style={styles.checkboxLabel}>Não é associado</Text>
        </TouchableOpacity>
      </ViewCenter> 
      {!id_produtor &&
        <Botao texto='Salvar' onPress={handleSalvar} /> 
      }     
      
      {id_produtor &&
      <>
        <Botao texto='Editar' onPress={()=>console.log('sim')} cor={Cores.azul} foto = 'create-outline'/> 
        <Botao texto='Excluir' onPress={()=>console.log('calma calabreso')} cor={Cores.vermelho} foto='trash-outline' /> 
      </>
      }  
    </View>
  );
}

const styles = StyleSheet.create({
  lastCode: {
    marginLeft: '5%',
    marginVertical: RFValue(8),
    fontSize: RFValue(12),
    color: '#333',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: RFValue(16),
  },
  checkboxLabel: {
    marginLeft: RFValue(8),
    fontSize: RFValue(14),
  },
});
