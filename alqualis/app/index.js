import React from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import HeaderTitle from '../components/personalizados/headerTtitle';
import Cores from '../constants/Cores';
import Botao from '../components/personalizados/Botao';
import ViewCenter from '../components/personalizados/ViewCenter'
export default function Index() {
  
  
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto=' Gestão do Café' />
      <ViewCenter>
        <Botao texto='Cadastrar Produtor' foto='person-add-outline'/>
        <Botao texto='Visualizar Produtor' foto='eye-outline'/>
        <Botao texto='Cadastrar Plantação' foto='leaf-outline'/>
        <Botao texto='Visualizar Plantação' foto='eye-outline'/>
        <Botao texto='Visualizar Cooperativas' foto='eye-outline'/>
        <Botao texto='Visualizar Município' foto='eye-outline'/>
        <Botao texto='Visualizar Comunidades' foto='eye-outline'/>
      </ViewCenter>
      
    </View>
  );
}

