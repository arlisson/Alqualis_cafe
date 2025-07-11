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
import { useLocalSearchParams } from 'expo-router';

export default function OutrosCadastros() {

  const {label,id} = useLocalSearchParams();

  const [nome,setNome] = useState('');
 

  const handleSalvar =()=>{
    if(parseInt(id)===1){
      console.log(`Nome da ${label}: ${nome}`)
    }else if(parseInt(id)===2){
      console.log(`Nome do ${label}: ${nome}`)
    }else if(parseInt(id)===3){
      console.log(`Nome da ${label}: ${nome}`)
    }else{
      console.log(`Nome da ${label}: ${nome}`)
    }

    
    
  };

   
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto={`Cadastrar ${label}`} voltar='true' home='true' />
      <ViewCenter>
        <Label label='Nome' input='true' onChangeText={setNome} value = {nome}/>
         
                
      </ViewCenter>
      <Botao texto='Salvar'onPress={()=>handleSalvar()}/>
      
    </View>
  );
}

