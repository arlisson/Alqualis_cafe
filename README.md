# Alqualis\_cafe

# Etapas a serem feitas (21/05/2025 - 01/08/2025)

## 1. Levantamento de Requisitos (21/05/2025 - 04/06/2025)

* Entender o que o sistema precisa. **(Concluído)**

## 2. Modelagem de Dados (04/06/2025 - 18/06/2025)

* Dividir as tabelas do Excel em módulos **(Concluído)**;
* Validar os dados dos campos das tabelas **(Concluído)**;
* Criar modelo relacional do banco **(Concluído)**.

### Módulo 1: Gestão do Produtor de Café

#### Tabela: produtor

* id_produtor
* nome_produtor
* cpf_produtor
* codigo_produtor

#### Tabela: plantacao

* id_plantacao
* id_produtor
* id_comunidade
* id_municipio
* id_cooperativa
* id_variedade_plantada
* id_face_exposicao
* latitude
* longitude
* altitude_media
* meses_colheita
* nome_talhao

#### Tabela: comunidade

* id_comunidade
* nome_comunidade

#### Tabela: municipio

* id_municipio
* nome_municipio

#### Tabela: cooperativa

* id_cooperativa
* nome_cooperativa

#### Tabela: variedade

* id_variedade
* nome_variedade

#### Tabela: cooperativa_produtor

* id_cooperativa_produtor
* id_produtor
* id_cooperativa

#### Tabela: face_exposicao

* id_face_exposicao
* nome_face_exposicao

#### Tabela: face_exposicao_plantacao

* id_face_exposicao_plantacao
* id_face_exposicao
* id_plantacao

<p  align="center"><b>Imagem 1: Diagrama Entidade Relacionamento</b></p>

![](https://github.com/arlisson/Alqualis_cafe/blob/main/imagens_projeto/modelo_der.png)
O diagrama de entidade e relacionamento descreve como o banco de dados será modelado e implementado.

### Módulo 2: Exportar e Importar dados com Excel

* Exportar os dados registrados no sistema para uma planilha Excel **(Concluído)**.
* Importar dados para o sistema a partir de uma planilha Excel **(Concluído)**.

---

<p  align="center"><b>Tabela 1: Requisitos funcionais do sistema</b></p>

| Código | Requisito Funcional                                     | Descrição                                                                                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-01  | Cadastro de Produtor                                    | O sistema deve permitir o cadastro de produtores com nome e CPF.                                                                                                                                                                                                                                                 |
| RF-02  | Gerenciamento de Plantações                             | O sistema deve permitir o registro de plantações associadas a um produtor. Cada plantação deve conter localização (latitude, longitude, altitude média), face de exposição e meses de colheita. Deve ser possível associar cada plantação a uma comunidade, município, cooperativa e variedade de café plantada. |
| RF-03  | Associação de Produtores a Cooperativas                 | O sistema deve permitir a associação de um produtor a uma ou mais cooperativas e vice-versa.                                                                                                                                                                                                                     |
| RF-04  | Gerenciamento de Comunidades, Municípios e Cooperativas | O sistema deve permitir o cadastro e manutenção de comunidades, municípios e cooperativas.                                                                                                                                                                                                                       |
| RF-05  | Gerenciamento de Variedades e Faces de Exposição        | O sistema deve permitir o cadastro das diferentes variedades e faces de exposição do café.                                                                                                                                                                                                                       |
| RF-06  | Consulta                                                | O sistema deve permitir consultar todos os produtores cadastrados, filtrando por cooperativa, município, comunidade ou variedade plantada.                                                                                                                                                                       |
| RF-07  | Exportar dados para Excel                               | O sistema deve permitir a exportação dos dados para uma planilha Excel.                                                                                                                                                                                                                                          |
| RF-08  | Importar dados de Excel                                 | O sistema deve permitir a importação dos dados a partir de uma planilha Excel.                                                                                                                                                                                                                                   |

---

## 3. Protótipo de Telas (18/06/2025 - 02/07/2025)

* Modelar o protótipo de telas do projeto, e validar com o cliente. **(Concluído)**
  **Link para visualizar e editar o protótipo no FIGMA:**
  [Clique Aqui](https://www.figma.com/proto/iAs0NxRNm3doOgF2m3gNYg/AlQualis?node-id=0-1&t=Yktx113eMa7ivjLR-1)

## 4. Desenvolver o MVP (02/07/2025 - 01/08/2025)

* Desenvolver os módulos em forma de aplicação mobile, sempre validando com o cliente **(MVP Concluído)**.

# Documentação do Código
A documentação JsDoc pode ser encontrada [aqui](https://arlisson.github.io/Alqualis_cafe/alqualis/docs/)
