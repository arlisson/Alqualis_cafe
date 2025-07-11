import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter'
import Label from '../../components/personalizados/Label';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import { buscarRegistrosGenericos,
  inserirProdutor
 } from '../../database/database';

export default function CadastrarProdutor() {

  const [nomeProdutor,setNomeProdutor] = useState('');
  const [cpfProdutor,setCpfProdutor] = useState('');
  const [codigoProdutor,setCodigoProdutor] = useState('');
  const [cooperativa, setCooperativa] = useState(null);
   // Estado para armazenar as opções vindas do banco
  const [cooperativasOptions, setCooperativasOptions] = useState([]);

  // Carrega as cooperativas ao montar o componente
  useEffect(() => {
    (async () => {
      try {
        const rows = await buscarRegistrosGenericos('cooperativa');
        // rows: [{ id_cooperativa, nome_cooperativa }, ...]
        const opts = rows.map(r => ({
          label: r.nome_cooperativa,
          value: r.id_cooperativa.toString(),  // sempre string para o dropdown
        }));
        setCooperativasOptions(opts);
      } catch (error) {
        console.error('Erro ao carregar cooperativas:', error);
      }
    })();
  }, []);

  const handleSalvar = async () => {
    // só tenta acessar label/value se houver cooperativa
    console.log(
      `Nome Produtor: ${nomeProdutor}\n` +
      `Cpf Produtor: ${cpfProdutor}\n` +
      `Codigo Produtor: ${codigoProdutor}\n` +
      `Cooperativa: ${cooperativa ? cooperativa.label + ' - ' + cooperativa.value : 'Nenhuma'}`
    );

    if (!nomeProdutor.trim()) {
      Alert.alert('Erro', 'Nome do produtor é obrigatório.');
      return;
    }

    try {
      const payload = {
        nome_produtor: nomeProdutor,
        cpf_produtor: cpfProdutor?.trim() || null,
        codigo_produtor: codigoProdutor?.trim() || null,
        // se cooperativa for null, id_cooperativa será null
        id_cooperativa: cooperativa ? parseInt(cooperativa.value, 10) : null,
      };

      const newId = await inserirProdutor(payload);
      if (newId) {
        console.log(`Produtor cadastrado com ID: ${newId}`);
        // limpa campos
        setNomeProdutor('');
        setCpfProdutor('');
        setCodigoProdutor('');
        setCooperativa(null);
      }
    } catch (error) {
      console.error('❌ Erro ao cadastrar produtor:', error);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto='Cadastrar Produtor' voltar='true' home='true' />
      <ViewCenter>
        <Label label='Nome' input='true' onChangeText={setNomeProdutor} value = {nomeProdutor}/>
        <Label label='CPF' input='true' onChangeText={setCpfProdutor} value={cpfProdutor} mask={'cpf'}/>
        <Label label='Código' input='true' onChangeText={setCodigoProdutor} value = {codigoProdutor}/>
        <Label
          label='Cooperativa/Associação'
          dropdown={true}
          data={cooperativasOptions} 
          value={cooperativa}         
          onChangeText={setCooperativa}
          
        />
        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setCooperativa(null)} style={styles.checkbox}>
            <Ionicons
              name={cooperativa ? 'square-outline' : 'checkbox-outline'}
              size={RFValue(20)}
              color="#000"
            />
            <Text style={styles.checkboxLabel}>Não é associado à cooperativa/associação</Text>
          </TouchableOpacity>
        </View>

                
      </ViewCenter>
      <Botao texto='Salvar'onPress={()=>handleSalvar()}/>
      
    </View>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: RFValue(14),
  },
});
