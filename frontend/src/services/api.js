import axios from 'axios'                          // Importa o axios para fazer chamadas HTTP

/*const api = axios.create({                         // Cria uma instância configurada do axios
    baseURL: 'http://localhost:8000',              // Endereço da API do backend
})*/

const api = axios.create({
  baseURL: 'http://192.168.18.42:8000',  // ← IP do seu computador
})

export default api                                 // Exporta para usar em qualquer tela