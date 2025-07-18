import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import { Alert } from "react-native";
import {
  inserirGenerico,
  inserirProdutor,
  inserirPlantacao,
} from "../database/database";

export const ImportarPlanilhaExcel = async (setLoading, prefixoCodigo = "CDANF") => {
  const cache = {
    comunidade: {},
    municipio: {},
    cooperativa: {},
    variedade: {},
    face_exposicao: {},
  };

  let houveErros = false;

  const colunasEsperadas = [
    "Nome do Produtor",
    "CPF",
    "Comunidade",
    "Município",
    "Cooperativa",
    "Variedade",
    "Talhão",
    "Latitude",
    "Longitude",
    "Altitude média",
    "Face de exposição",
    "Meses de Colheita",
  ];

  Alert.alert(
    "Atenção",
    `A planilha deve conter exatamente os seguintes nomes de colunas:\n\n- ${colunasEsperadas.join(
      "\n- "
    )}`,
    [
      {
        text: "Entendi",
        onPress: async () => {
          try {
            setLoading(true);

            const result = await DocumentPicker.getDocumentAsync({
              type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
              copyToCacheDirectory: true,
            });

            if (!result.assets || result.assets.length === 0) {
              Alert.alert("Cancelado", "Nenhum arquivo foi selecionado.");
              setLoading(false);
              return;
            }

            const fileUri = result.assets[0].uri;
            const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            const workbook = XLSX.read(fileBase64, { type: "base64" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            for (let i = 0; i < data.length; i++) {
              try {
                const row = data[i];
                const nome_produtor = row["Nome do Produtor"]?.trim().toUpperCase();
                const cpf_produtor = row["CPF"]?.replace(/\D/g, '') || "";
                const codigo_produtor = `${prefixoCodigo}${(i + 1).toString().padStart(2, "0")}`;

                const nome_comunidade = row["Comunidade"]?.trim().toUpperCase();
                const nome_municipio = row["Município"]?.trim().toUpperCase();
                const nome_cooperativa = row["Cooperativa"]?.trim().toUpperCase();
                const nome_variedade = row["Variedade"]?.trim().toUpperCase();
                const nome_talhao = row["Talhão"]?.trim().toUpperCase();
                const latitude = row["Latitude"]?.toString().trim().toUpperCase();
                const longitude = row["Longitude"]?.toString().trim().toUpperCase();
                const altitude = row["Altitude média"]?.toString().trim().toUpperCase();
                const face_exposicao = row["Face de exposição"]?.trim().toUpperCase();
                const meses_colheita_raw = row["Meses de Colheita"]?.trim().toUpperCase();

                const meses_colheita = meses_colheita_raw
                  ? meses_colheita_raw.split(",").map(m => m.trim().toUpperCase())
                  : [];

                const buscarOuInserir = async (tabela, coluna, valor) => {
                  if (!valor) return null;
                  const chave = valor.toLowerCase();
                  if (cache[tabela][chave]) return cache[tabela][chave];

                  const id = await inserirGenerico(
                    tabela,
                    { [coluna]: valor },
                    `${valor} inserido com sucesso em ${tabela}!`,
                    false
                  );
                  if (id) cache[tabela][chave] = id;
                  return id;
                };

                const id_comunidade = await buscarOuInserir("comunidade", "nome_comunidade", nome_comunidade);
                const id_municipio = await buscarOuInserir("municipio", "nome_municipio", nome_municipio);
                const id_variedade = await buscarOuInserir("variedade", "nome_variedade", nome_variedade);
                const id_cooperativa = await buscarOuInserir("cooperativa", "nome_cooperativa", nome_cooperativa);
                const id_face = await buscarOuInserir("face_exposicao", "nome_face_exposicao", face_exposicao);

                const id_produtor = await inserirProdutor({
                  nome_produtor,
                  cpf_produtor,
                  codigo_produtor,
                  id_cooperativa,
                  mensagem: false,
                });

                if (!id_produtor) {
                  houveErros = true;
                  continue;
                }

                const id_plantacao = await inserirPlantacao({
                  id_produtor,
                  id_variedade,
                  id_comunidade,
                  id_municipio,
                  nome_plantacao: nome_talhao || `Plantação ${i + 1}`,
                  latitude,
                  longitude,
                  altitude_media: altitude,
                  nome_talhao,
                  meses_colheita,
                  faces: id_face ? [id_face] : [],
                  mensagem: false,
                });

                if (!id_plantacao) {
                  houveErros = true;
                }
              } catch (linhaErro) {
                console.warn(`Erro ao processar linha ${i + 1}:`, linhaErro);
                houveErros = true;
              }
            }

            Alert.alert(
              "Importação Finalizada",
              houveErros
                ? "Alguns dados foram importados com falhas."
                : "Todos os dados foram importados com sucesso!"
            );

          } catch (erroFinal) {
            console.error("Erro ao importar planilha:", erroFinal);
            Alert.alert("Erro", `Falha ao importar a planilha. ${erroFinal}`);
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
};
