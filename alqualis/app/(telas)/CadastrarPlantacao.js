import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { RFValue } from 'react-native-responsive-fontsize';
import { buscarRegistrosGenericos } from '../../database/database';

export default function CadastrarPlantacao() {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const [facesOptions, setFacesOptions] = useState([]);       // ← options dinâmicas
 // Carrega as faces de exposição do banco na montagem
  useEffect(() => {
    (async () => {
      try {
        // retorna [{ id_face_exposicao, nome_face_exposicao }, …]
        const rows = await buscarRegistrosGenericos('face_exposicao');
        // mapeia só o nome pra passar ao Label
        const nomes = rows.map(r => r.nome_face_exposicao);
        setFacesOptions(nomes);
      } catch (e) {
        console.error('Erro ao carregar faces de exposição:', e);
      }
    })();
  }, []);

  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [mesesSelecionados, setMesesSelecionados] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('');
  const [nomePropriedade, setNomePropriedade] = useState('');
  const [nomeTalhao, setNomeTalhao] = useState('');

  const [produtor, setProdutor] = useState(null);            // Ex: { label: 'João', value: '1' }
  const [variedade, setVariedade] = useState(null);          // Ex: { label: 'BRS Capiaçu', value: 'capiaçu' }
  const [comunidade, setComunidade] = useState(null);        // Ex: { label: 'Comunidade A', value: 'a' }
  const [municipio, setMunicipio] = useState(null);          // Ex: { label: 'Município X', value: 'x' }
  
  const [facesSelecionadas, setFacesSelecionadas] = useState([]);



  /**
   * Pega a localização atual do usuário usando GPS e preenche latitude, longitude e altitude.
   */
  const pegarLocalizacao = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização nas configurações do dispositivo.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude.toFixed(6));
      setLongitude(location.coords.longitude.toFixed(6));
      setAltitude(location.coords.altitude?.toFixed(2) || 'N/A');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização.');
      console.error(error);
    }
  };

  /**
   * Solicita permissão e abre o modal com o mapa centrado na localização atual do usuário.
   */
  const abrirMapa = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita o acesso à localização nas configurações.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMapVisible(true);
  };

  /**
   * Define a localização escolhida ao clicar no mapa e fecha o modal.
   * @param {Object} e - Evento de clique no mapa.
   */
  const selecionarLocalizacao = (e) => {
    const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(lon.toFixed(6));
    setAltitude('N/A');
    setMapVisible(false);
  };
  
  

  const handleSalvar = () => {
  console.log('--- Dados da Plantação ---');
  console.log(`Nome da Propriedade: ${nomePropriedade}`);
  console.log(`Nome do Talhão: ${nomeTalhao}`);
  console.log(`Face de Exposição: ${facesSelecionadas}`);

  console.log(`Produtor: ${produtor?.label || 'N/A'} (value: ${produtor?.value || 'N/A'})`);
  console.log(`Variedade Plantada: ${variedade?.label || 'N/A'} (value: ${variedade?.value || 'N/A'})`);
  console.log(`Comunidade: ${comunidade?.label || 'N/A'} (value: ${comunidade?.value || 'N/A'})`);
  console.log(`Município: ${municipio?.label || 'N/A'} (value: ${municipio?.value || 'N/A'})`);
  
  console.log(`Latitude: ${latitude}`);
  console.log(`Longitude: ${longitude}`);
  console.log(`Altitude: ${altitude}`);
  console.log(`Meses de Colheita: ${mesesSelecionados}`);
};



  const dadosProdutores = [
    { label: 'Cooperativa 1', value: '1' },
    { label: 'Cooperativa 2', value: '2' },
    { label: 'Cooperativa 3', value: '3' },   
  ];
    const dadosVariedades = [
    { label: 'Cooperativa 1', value: '1' },
    { label: 'Cooperativa 2', value: '2' },
    { label: 'Cooperativa 3', value: '3' },   
  ];

  const dadosComunidades = [
    { label: 'Cooperativa 1', value: '1' },
    { label: 'Cooperativa 2', value: '2' },
    { label: 'Cooperativa 3', value: '3' },   
  ];

    const dadosMunicipios = [
    { label: 'Cooperativa 1', value: '1' },
    { label: 'Cooperativa 2', value: '2' },
    { label: 'Cooperativa 3', value: '3' },   
  ];



  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde, paddingBottom: RFValue(30) }}>
      <HeaderTitle texto='Cadastrar Plantação' voltar='true' home='true' />
      <ViewCenter>
        <Label label='Nome da propriedade' input={true} value={nomePropriedade} onChangeText={setNomePropriedade} />
        <Label label='Nome do Talhão' input={true} value={nomeTalhao} onChangeText={setNomeTalhao} />

        <Label
          label="Face de Exposição"
          selectableInput
          options={facesOptions}
          mainIconName="compass-outline"
          value={facesSelecionadas}
          onChangeText={(valArray) => setFacesSelecionadas(valArray)} // agora o componente atualiza seu estado real
        />

        <Label label='Produtor' dropdown={true} value={produtor} onChangeText={setProdutor} data={dadosProdutores} />
        <Label label='Variedade Plantada' dropdown={true} value={variedade} onChangeText={setVariedade} data={dadosVariedades} />
        <Label label='Comunidade' dropdown={true} value={comunidade} onChangeText={setComunidade} data={dadosComunidades} />
        <Label label='Município' dropdown={true} value={municipio} onChangeText={setMunicipio} data={dadosMunicipios} />


        <Label label='Latitude' input={true} horizontal={true} value={latitude} onChangeText={setLatitude} />
        <Label label='Longitude' input={true} horizontal={true} value={longitude} onChangeText={setLongitude} />
        <Label label='Altitude' input={true} horizontal={true} value={altitude} onChangeText={setAltitude} />

        <Botao texto='Pegar localização' foto='pin-outline' onPress={pegarLocalizacao} />
        <Botao texto='Selecionar no mapa' foto='map-outline' onPress={abrirMapa} />    

        <Label
          label="Meses de Colheita"
          selectableInput
          options={meses}
          value={mesesSelecionados}
          onChangeText={(valArray) => setMesesSelecionados(valArray)} // agora o componente atualiza seu estado real
          mainIconName="calendar-outline"
        />   

        <Modal visible={mapVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            {mapRegion && (
              <MapView
                style={{ flex: 1 }}
                initialRegion={mapRegion}
                onPress={selecionarLocalizacao}
              >
                <Marker coordinate={{
                  latitude: parseFloat(latitude) || mapRegion.latitude,
                  longitude: parseFloat(longitude) || mapRegion.longitude,
                }} />
              </MapView>
            )}
            <TouchableOpacity onPress={() => setMapVisible(false)} style={{ padding: 15, backgroundColor: 'black' }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>Fechar mapa</Text>
            </TouchableOpacity>
          </View>
        </Modal>      


      </ViewCenter>
      <Botao texto='Salvar' onPress={()=>handleSalvar()}/>
    </View>
  );
}