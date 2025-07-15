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
         <Botao texto='Gestão do Produtor' foto='person-outline'
          cor={Cores.marrom}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{produtor:true, titulo:'Gestão do Produtor'}})}
          />
          <Botao texto='Gestão da Plantação' foto='leaf-outline'
          cor={Cores.azul}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{plantacao:true, titulo:'Gestão da Plantação'}})}
          />
          <Botao texto='Outras Gestões' foto='file-tray-stacked-outline'
          cor={Cores.oliva}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{outros:true, titulo:'Outras Gestões'}})}
          />

        <Botao texto='Criar Banco' cor={Cores.azul} onPress={()=>handleCriarBanco()} />
        <Botao texto='Apagar Banco' cor={Cores.vermelho} onPress={() => deleteDatabase()} foto='trash-outline'/>
      </ViewCenter>
      
    </View>
  );
}

