import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  buscarRegistrosGenericos,
  inserirPlantacao,
} from '../../database/database';

export default function CadastrarPlantacao() {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const [formSubmitted, setFormSubmitted] = useState(false); // NOVO

  const [facesRows, setFacesRows] = useState([]);
  const [facesOptions, setFacesOptions] = useState([]);
  const [produtoresOptions, setProdutoresOptions] = useState([]);
  const [variedadesOptions, setVariedadesOptions] = useState([]);
  const [comunidadesOptions, setComunidadesOptions] = useState([]);
  const [municipiosOptions, setMunicipiosOptions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const faces = await buscarRegistrosGenericos('face_exposicao');
        setFacesRows(faces);
        setFacesOptions(faces.map(f => f.nome_face_exposicao));

        const produtores = await buscarRegistrosGenericos('produtor');
        setProdutoresOptions(produtores.map(p => ({ label: p.nome_produtor, value: p.id_produtor.toString() })));

        const variedades = await buscarRegistrosGenericos('variedade');
        setVariedadesOptions(variedades.map(v => ({ label: v.nome_variedade, value: v.id_variedade.toString() })));

        const comunidades = await buscarRegistrosGenericos('comunidade');
        setComunidadesOptions(comunidades.map(c => ({ label: c.nome_comunidade, value: c.id_comunidade.toString() })));

        const municipios = await buscarRegistrosGenericos('municipio');
        setMunicipiosOptions(municipios.map(m => ({ label: m.nome_municipio, value: m.id_municipio.toString() })));
      } catch (e) {
        console.error('Erro ao carregar opções:', e);
        Alert.alert('Erro', 'Não foi possível carregar dados iniciais.');
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
  const [produtor, setProdutor] = useState(null);
  const [variedade, setVariedade] = useState(null);
  const [comunidade, setComunidade] = useState(null);
  const [municipio, setMunicipio] = useState(null);
  const [facesSelecionadas, setFacesSelecionadas] = useState([]);

  const pegarLocalizacao = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permissão negada');
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setLatitude(loc.coords.latitude.toFixed(6));
    setLongitude(loc.coords.longitude.toFixed(6));
    setAltitude(loc.coords.altitude?.toFixed(2) ?? 'N/A');
  };

  const abrirMapa = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permissão negada');
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setMapRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMapVisible(true);
  };

  const selecionarLocalizacao = e => {
    const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(lon.toFixed(6));
    setAltitude('N/A');
    setMapVisible(false);
  };

  const handleSalvar = async () => {
    setFormSubmitted(true); // ATIVA ERROS

    if (!nomePropriedade.trim() || !nomeTalhao.trim() || !produtor || !variedade || !comunidade || !municipio) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const facesIds = facesSelecionadas
        .map(nome => facesRows.find(f => f.nome_face_exposicao === nome))
        .filter(Boolean)
        .map(f => f.id_face_exposicao);

      const newId = await inserirPlantacao({
        id_produtor: parseInt(produtor.value, 10),
        id_variedade: parseInt(variedade.value, 10),
        id_comunidade: parseInt(comunidade.value, 10),
        id_municipio: parseInt(municipio.value, 10),
        nome_plantacao: nomePropriedade.toUpperCase(),
        latitude,
        longitude,
        altitude_media: altitude,
        nome_talhao: nomeTalhao.toUpperCase(),
        faces: facesIds,
      });

      if (newId) {
        setNomePropriedade('');
        setNomeTalhao('');
        setProdutor(null);
        setVariedade(null);
        setComunidade(null);
        setMunicipio(null);
        setFacesSelecionadas([]);
        setMesesSelecionados([]);
        setLatitude('');
        setLongitude('');
        setAltitude('');
        setFormSubmitted(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde, paddingBottom: RFValue(30) }}>
      <HeaderTitle texto='Cadastrar Plantação' voltar='true' home='true' />
      <ViewCenter>
        <Label
          label='Nome da propriedade'
          input
          onChangeText={setNomePropriedade}
          value={nomePropriedade}
          required
          showError={formSubmitted}
        />
        <Label
          label='Nome do Talhão'
          input
          onChangeText={setNomeTalhao}
          value={nomeTalhao}
          required
          showError={formSubmitted}
        />
        <Label
          label="Face de Exposição"
          selectableInput
          options={facesOptions}
          mainIconName="compass-outline"
          value={facesSelecionadas}
          onChangeText={setFacesSelecionadas}
        />
        <Label
          label='Produtor'
          dropdown
          data={produtoresOptions}
          value={produtor}
          onChangeText={setProdutor}
          required
          showError={formSubmitted}
        />
        <Label
          label='Variedade'
          dropdown
          data={variedadesOptions}
          value={variedade}
          onChangeText={setVariedade}
          required
          showError={formSubmitted}
        />
        <Label
          label='Comunidade'
          dropdown
          data={comunidadesOptions}
          value={comunidade}
          onChangeText={setComunidade}
          required
          showError={formSubmitted}
        />
        <Label
          label='Município'
          dropdown
          data={municipiosOptions}
          value={municipio}
          onChangeText={setMunicipio}
          required
          showError={formSubmitted}
        />
        <Label
          label='Latitude'
          horizontal
          input
          value={latitude}
          onChangeText={setLatitude}
          
        />
        <Label
          label='Longitude'
          horizontal
          input
          value={longitude}
          onChangeText={setLongitude}
        />
        <Label
          label='Altitude'
          horizontal
          input
          value={altitude}
          onChangeText={setAltitude}
        />
        <Botao texto='Pegar localização' foto='pin-outline' onPress={pegarLocalizacao} />
        <Botao texto='Selecionar no mapa' foto='map-outline' onPress={abrirMapa} />

        <Label
          label="Meses de Colheita"
          selectableInput
          options={meses}
          value={mesesSelecionados}
          onChangeText={setMesesSelecionados}
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
                <Marker
                  coordinate={{
                    latitude: parseFloat(latitude) || mapRegion.latitude,
                    longitude: parseFloat(longitude) || mapRegion.longitude,
                  }}
                />
              </MapView>
            )}
            <TouchableOpacity
              onPress={() => setMapVisible(false)}
              style={{ padding: 15, backgroundColor: 'black' }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>
                Fechar mapa
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ViewCenter>
      <Botao texto='Salvar' onPress={handleSalvar} />
    </View>
  );
}
