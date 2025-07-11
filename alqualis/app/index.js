import React from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import HeaderTitle from '../components/personalizados/headerTtitle';
import Cores from '../constants/Cores';
import Botao from '../components/personalizados/Botao';
import ViewCenter from '../components/personalizados/ViewCenter'
import { router } from 'expo-router';

export default function Index() {  
  
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto='Gestão do Café' />
      <ViewCenter>
        <Botao texto='Cadastrar Produtor' foto='person-add-outline' onPress={() => router.push('(telas)/CadastrarProdutor')}/>
        <Botao texto='Visualizar Produtor' foto='eye-outline'/>
        <Botao texto='Cadastrar Plantação' foto='leaf-outline' onPress={() => router.push('(telas)/CadastrarPlantacao')}/>
        <Botao texto='Visualizar Plantação' foto='eye-outline'/>
        <Botao texto='Cadastrar Cooperativa' foto='storefront-outline' 
        onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Cooperativa',id:'1'}})} />
        
        <Botao texto='Visualizar Cooperativas' foto='eye-outline'/>
        <Botao texto='Cadastrar Município' foto='business-outline'onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Município',id:'2'}})}/>

        <Botao texto='Visualizar Município' foto='eye-outline'/>
        <Botao texto='Cadastrar Comunidade' foto='people-outline'onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Comunidade',id:'3'}})}/>       

        <Botao texto='Visualizar Comunidades' foto='eye-outline'/>

        <Botao texto='Cadastrar Face de Exposição' foto='sunny-outline'onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Face de Exposição',id:'4'}})}/>

      </ViewCenter>
      
    </View>
  );
}

