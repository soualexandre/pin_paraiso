
-----

# **Consulta de CEPS - Paraíso do Tocantins**

### **Visão Geral do Projeto**

Esta é uma aplicação web para consulta dos novos Códigos de Endereçamento Postal (CEPs) de Paraíso do Tocantins. A ferramenta foi desenvolvida para facilitar a busca por endereços e seus respectivos CEPs, oferecendo duas formas de pesquisa intuitivas: uma **barra de busca textual** e uma **interação visual através de um mapa** interativo.

O objetivo é fornecer uma solução ágil e acessível para moradores, empresas, entregadores e qualquer pessoa que precise de informações de CEPs atualizadas na cidade.

-----

### **Funcionalidades Principais**

  * **Busca por CEP ou Endereço:** Digite o nome de uma rua, bairro ou o CEP na barra de pesquisa para obter resultados instantâneos.
  * **Consulta por Mapa:** Clique em uma rua ou área no mapa interativo para visualizar os CEPS associados àquele local, facilitando a navegação e a exploração visual.

-----

### **Tecnologias Utilizadas**

O projeto foi construído utilizando um conjunto de tecnologias modernas e eficientes:

  * **Frontend:**
      * **Next.Js:** Framework React para renderização no lado do servidor (SSR) e geração de páginas estáticas.
      * **Tailwind CSS:** Framework de CSS utilitário para estilização rápida e responsiva.
  * **Banco de Dados:**
      * **SQLite:** Banco de dados relacional leve e embutido, ideal para armazenar os dados de CEPs localmente.
  * **API:**
      * **Google Maps JavaScript API:** Utilizada para renderizar o mapa interativo e gerenciar os eventos de clique e navegação.

-----

### **Como Executar o Projeto**

Siga os passos abaixo para ter a aplicação rodando na sua máquina.

#### **Pré-requisitos**

  * **Node.ts** (versão 18 ou superior)
  * **Chave de API do Google Maps:** Você precisará de uma chave para utilizar a API do Google Maps.

#### **Instalação e Configuração**

1.  **Clone o repositório:**

    ```bash
    git clone [URL_DO_REPOSITORIO]
    cd projeto-ceps
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure a chave da API:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione a sua chave da API do Google Maps:

    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
    ```

4.  **Configure o banco de dados:**
    O banco de dados de CEPs está no arquivo `cepe.db`. Se precisar, você pode popular a base de dados com os dados iniciais usando o script `seed.ts`.

    ```bash
    node database/seed.ts
    ```

5.  **Inicie a aplicação:**

    ```bash
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:3000`.

-----

### **Contribuição**

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou novas funcionalidades. Para isso, por favor, abra uma *issue* ou envie um *pull request*.

### **Autor**

  * Alexandre Souza dos Santos 

-----