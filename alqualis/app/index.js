import React from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import HeaderTitle from '../components/personalizados/headerTtitle';
import Cores from '../constants/Cores';
import Botao from '../components/personalizados/Botao';
import ViewCenter from '../components/personalizados/ViewCenter'
import { router } from 'expo-router';
import {createDatabase,
  deleteDatabase
} from '../database/database';

export default function Index() {  

  const handleCriarBanco = async () => {
    try {
      // Se você quiser mostrar algum feedback extra:
      // Alert.alert("Aguarde", "Criando o banco de dados…");

      await createDatabase(true);
      // Opcional: faça algo após a criação, como navegar ou recarregar dados
    } catch (error) {
      // A própria createDatabase já exibe um Alert em caso de erro,
      // mas abaixo você poderia tratar logs adicionais:
      console.error("Erro ao criar banco na UI:", error);
    }
  };
  
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto='Gestão do Café' />
      <ViewCenter>
        <Botao texto='Cadastrar Produtor' foto='person-add-outline' onPress={() => router.push('(telas)/CadastrarProdutor')}/>
        <Botao texto='Visualizar Produtor' foto='eye-outline' onPress={() => router.push({
          pathname:'(telas)/Visualizar',
          params:{titulo:'Produtor', id:'1'}})}/>

        <Botao texto='Cadastrar Plantação' foto='leaf-outline' onPress={() => router.push('(telas)/CadastrarPlantacao')}/>
        <Botao texto='Visualizar Plantação' foto='eye-outline' onPress={() => router.push({
          pathname:'(telas)/Visualizar',
          params:{titulo:'Plantação', id:'2'}})}/>

        <Botao texto='Cadastrar Cooperativa' foto='storefront-outline' 
        onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Cooperativa',id:'1'}})} />        
        <Botao texto='Visualizar Cooperativas' foto='eye-outline' onPress={() => router.push({
          pathname:'(telas)/Visualizar',
          params:{titulo:'Cooperativa', id:'3'}})}/>

        <Botao texto='Cadastrar Município' foto='business-outline'onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Município',id:'2'}})}/>
        <Botao texto='Visualizar Município' foto='eye-outline' onPress={() => router.push({
          pathname:'(telas)/Visualizar',
          params:{titulo:'Município', id:'4'}})}/>

        <Botao texto='Cadastrar Comunidade' foto='people-outline'onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Comunidade',id:'3'}})}/>   
        <Botao texto='Visualizar Comunidades' foto='eye-outline'  onPress={() => router.push({
          pathname:'(telas)/Visualizar',
          params:{titulo:'Comunidade', id:'5'}})}/>

        <Botao texto='Cadastrar Face de Exposição' foto='sunny-outline'onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Face de Exposição',id:'4'}})}/>
        <Botao texto='Visualizar Face de Exposição' foto='eye-outline'  onPress={() => router.push({
          pathname:'(telas)/Visualizar',
          params:{titulo:'Face de Exposição', id:'6'}})}/>

          <Botao texto='Cadastrar Variedade' foto='eyedrop-outline'onPress={() => router.push({
          pathname:'(telas)/OutrosCadastros',
          params:{label:'Variedade',id:'5'}})}/>
        <Botao texto='Visualizar Variedade' foto='eye-outline'  onPress={() => router.push({
          pathname:'(telas)/Visualizar',
          params:{titulo:'Variedade', id:'7'}})}/>

        <Botao texto='Criar Banco' cor={Cores.azul} onPress={()=>handleCriarBanco()} />
        <Botao texto='Apagar Banco' cor={Cores.vermelho} onPress={() => deleteDatabase()} foto='trash-outline'/>
      </ViewCenter>
      
    </View>
  );
}

