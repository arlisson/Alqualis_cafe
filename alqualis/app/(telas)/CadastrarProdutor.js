import React, {useState} from 'react';
import {
  View, Text, StyleSheet,
  TextInput
} from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter'
import Label from '../../components/personalizados/Label';
export default function CadastrarProdutor() {

  const [nomeProdutor,setNomeProdutor] = useState('');
  const [cpfProdutor,setCpfProdutor] = useState('');
  const [codigoProdutor,setCodigoProdutor] = useState('');
  const [cooperativa, setCooperativa] = useState('');


  const handleSalvar =()=>{
    console.log(`Nome Produtor: ${nomeProdutor}\n
      Cpf Produtor: ${cpfProdutor}\n
      Codigo Produtor: ${codigoProdutor}\n
      Cooperativa: ${cooperativa.label} - ${cooperativa.value}`)
  };

  const data = [
    { label: 'Cooperativa 1', value: '1' },
    { label: 'Cooperativa 2', value: '2' },
    { label: 'Cooperativa 3', value: '3' },
    { label: 'Cooperativa 4', value: '4' },
    { label: 'Cooperativa 5', value: '5' },
    { label: 'Cooperativa 6', value: '6' },
    { label: 'Cooperativa 7', value: '7' },
    { label: 'Cooperativa 8', value: '8' },
  ];
  
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto='Cadastrar Produtor' voltar='true' home='true' />
      <ViewCenter>
        <Label label='Nome' input='true' onChangeText={setNomeProdutor} value = {nomeProdutor}/>
        <Label label='CPF' input='true' onChangeText={setCpfProdutor} value={cpfProdutor}/>
        <Label label='Código' input='true' onChangeText={setCodigoProdutor} value = {codigoProdutor}/>
        <Label
          label='Cooperativa'
          dropdown={true}
          data={data} 
          value={cooperativa}         
          onChangeText={setCooperativa}
        />
                
      </ViewCenter>
      <Botao texto='Salvar'onPress={()=>handleSalvar()}/>
      
    </View>
  );
}

