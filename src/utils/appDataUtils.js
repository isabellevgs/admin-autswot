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

export async function buscarTermoUso() {
  try {
    const res = await api.get('/app-data/termoUso');
    return { termoUso: res.data.termoUso, erro: null };
  } catch (err) {
    return {
      termoUso: null,
      erro: extrairErroApi(err, 'Erro ao carregar o termo de uso.'),
    };
  }
}

export async function atualizarTermoUso(termoUso) {
  try {
    const res = await api.put('/app-data/termoUso', { termoUso });
    return { termoUso: res.data.termoUso, erro: null };
  } catch (err) {
    return {
      termoUso: null,
      erro: extrairErroApi(err, 'Erro ao salvar o termo de uso.'),
    };
  }
}

export async function buscarBloqueioAcesso() {
  try {
    const res = await api.get('/app-data/bloqueio-acesso');
    return {
      bloquearAcesso: res.data.bloquearAcesso,
      dataInicioAcesso: res.data.dataInicioAcesso,
      dataFimAcesso: res.data.dataFimAcesso,
      emailsComAcesso: res.data.emailsComAcesso,
      erro: null,
    };
  } catch (err) {
    return {
      bloquearAcesso: null,
      dataInicioAcesso: null,
      dataFimAcesso: null,
      emailsComAcesso: null,
      erro: extrairErroApi(err, 'Erro ao carregar a configuração de bloqueio de acesso.'),
    };
  }
}

export async function atualizarBloqueioAcesso(bloquearAcesso, dataInicioAcesso, dataFimAcesso, emailsComAcesso) {
  try {
    const res = await api.put('/app-data/bloqueio-acesso', {
      bloquearAcesso,
      dataInicioAcesso: bloquearAcesso ? dataInicioAcesso : null,
      dataFimAcesso: bloquearAcesso ? dataFimAcesso : null,
      emailsComAcesso: bloquearAcesso ? emailsComAcesso : [],
    });
    return {
      bloquearAcesso: res.data.bloquearAcesso,
      dataInicioAcesso: res.data.dataInicioAcesso,
      dataFimAcesso: res.data.dataFimAcesso,
      emailsComAcesso: res.data.emailsComAcesso,
      erro: null,
    };
  } catch (err) {
    return {
      bloquearAcesso: null,
      dataInicioAcesso: null,
      dataFimAcesso: null,
      emailsComAcesso: null,
      erro: extrairErroApi(err, 'Erro ao salvar a configuração de bloqueio de acesso.'),
    };
  }
}

export async function buscarUsuarioPorEmail(email) {
  try {
    const res = await api.get('/users/by-email', { params: { email } });
    const user = res.data.user;
    return {
      usuario: user ? { nome: user.name, dataCadastro: user.createdAt } : null,
      erro: null,
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return { usuario: null, erro: null };
    }
    return {
      usuario: null,
      erro: extrairErroApi(err, 'Erro ao buscar usuário.'),
    };
  }
}
