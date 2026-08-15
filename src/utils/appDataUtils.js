import api from '../services/api';
import { extrairErroApi } from './api-errors';

export async function buscarTcle() {
  try {
    const res = await api.get('/app-data/tcle');
    return { tcle: res.data.tcle, erro: null };
  } catch (err) {
    return {
      tcle: null,
      erro: extrairErroApi(err, 'Erro ao carregar o termo de consentimento.'),
    };
  }
}

export async function atualizarTcle(tcle) {
  try {
    const res = await api.put('/app-data/tcle', { tcle });
    return { tcle: res.data.tcle, erro: null };
  } catch (err) {
    return {
      tcle: null,
      erro: extrairErroApi(err, 'Erro ao salvar o termo de consentimento.'),
    };
  }
}
