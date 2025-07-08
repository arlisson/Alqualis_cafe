import React from 'react';
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
  
  
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto='Cadastrar Produtor' voltar='true' home='true' />
      <ViewCenter>
        <Label label='Nome' input='true'/>
        <Label label='CPF' input='true'/>
        <Label label='Código' input='true'/>
        <Label label='Cooperativa' dropdown='true'/>
        
      </ViewCenter>
      <Botao texto='Salvar'/>
      
    </View>
  );
}

