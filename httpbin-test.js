import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import encoding from 'k6/encoding';

// Métricas customizadas
const errorRate = new Rate('errors');
const successRate = new Rate('success_rate');
const waitingTime = new Trend('waiting_time');

// Configurações do teste
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Rampa de subida para 5 VUs
    { duration: '1m', target: 5 },    // Mantém 5 VUs por 1 minuto
    { duration: '2m', target: 10 },   // Aumenta para 10 VUs em 2 minutos
    { duration: '1m', target: 10 },   // Mantém 10 VUs por 1 minuto
    { duration: '30s', target: 0 },   // Rampa de descida
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requisições devem completar em 1s
    'http_req_duration{type:GET}': ['p(95)<800'],  // GET requests mais rápidos
    errors: ['rate<0.1'],              // Taxa de erro menor que 10%
    success_rate: ['rate>0.95'],       // Taxa de sucesso maior que 95%
  },
};

const BASE_URL = 'https://httpbin.org';

// Dados para testes
const testData = {
  message: 'Test message',
  number: 123,
  boolean: true
};

export default function() {
  group('GET Requests', () => {
    // GET básico
    const getResponse = http.get(`${BASE_URL}/get`);
    check(getResponse, {
      'status é 200': (r) => r.status === 200,
      'tem headers': (r) => r.json().headers !== undefined,
    });
    waitingTime.add(getResponse.timings.waiting);

    // GET com parâmetros
    const getParamsResponse = http.get(`${BASE_URL}/get?param1=value1&param2=value2`);
    check(getParamsResponse, {
      'status é 200': (r) => r.status === 200,
      'parâmetros corretos': (r) => {
        const args = r.json().args;
        return args.param1 === 'value1' && args.param2 === 'value2';
      },
    });
  });

  group('POST Requests', () => {
    // POST com JSON
    const postResponse = http.post(
      `${BASE_URL}/post`,
      JSON.stringify(testData),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(postResponse, {
      'status é 200': (r) => r.status === 200,
      'dados JSON corretos': (r) => {
        const json = r.json();
        return json.json.message === testData.message;
      },
    });

    // POST com form data
    const formData = {
      field1: 'value1',
      field2: 'value2',
    };
    const formResponse = http.post(`${BASE_URL}/post`, formData);
    check(formResponse, {
      'status é 200': (r) => r.status === 200,
      'form data correto': (r) => {
        const form = r.json().form;
        return form.field1 === 'value1' && form.field2 === 'value2';
      },
    });
  });

  group('Status Codes', () => {
    // Testa diferentes códigos de status
    const codes = [200, 404, 500];
    codes.forEach(code => {
      const response = http.get(`${BASE_URL}/status/${code}`);
      check(response, {
        [`retorna status ${code}`]: (r) => r.status === code,
      });
    });
  });

  group('Response Formats', () => {
    // Testa diferentes formatos de resposta
    const jsonResponse = http.get(`${BASE_URL}/json`);
    check(jsonResponse, {
      'resposta JSON válida': (r) => r.status === 200 && r.json() !== null,
    });

    const xmlResponse = http.get(`${BASE_URL}/xml`);
    check(xmlResponse, {
      'resposta XML válida': (r) => r.status === 200 && r.headers['Content-Type'].includes('application/xml'),
    });
  });

  group('Authentication', () => {
    // Teste de autenticação básica
    const credentials = encoding.b64encode('user:pass');
    const authResponse = http.get(`${BASE_URL}/basic-auth/user/pass`, {
      headers: { 'Authorization': `Basic ${credentials}` },
    });
    check(authResponse, {
      'autenticação bem sucedida': (r) => r.status === 200,
    });
  });

  // Atualiza métricas
  successRate.add(1);
  errorRate.add(0);

  // Pausa entre iterações
  sleep(1);
}

// Função de tear-down após o teste
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Sumário no console
    'summary.json': JSON.stringify(data), // Exporta resultados em JSON
  };
}