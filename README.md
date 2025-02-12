# Testes de Performance - HTTPBin

Este projeto contém testes de performance automatizados para a API HTTPBin usando k6, uma ferramenta moderna de testes de carga e performance.

## 📋 Pré-requisitos

- [k6](https://k6.io/docs/getting-started/installation) instalado
- Node.js (opcional, para executar scripts auxiliares)
- Docker (opcional, para execução em container)

## 🛠️ Instalação

### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### MacOS
```bash
brew install k6
```

### Windows
```bash
choco install k6
```

## 📊 Estrutura do Projeto

```
├── scripts/
│   └── httpbin-test.js     # Script principal de testes
├── results/                # Diretório para resultados dos testes
└── README.md
```

## 🚀 Executando os Testes

### Execução Básica
```bash
k6 run scripts/httpbin-test.js
```

### Com Exportação de Resultados
```bash
k6 run --out json=results/result.json scripts/httpbin-test.js
```

### Com Monitoramento em Tempo Real (requer Grafana + InfluxDB)
```bash
k6 run --out influxdb=http://localhost:8086/k6 scripts/httpbin-test.js
```

## 📈 Cenários de Teste

O script inclui os seguintes grupos de teste:

1. **GET Requests**
    - GET básico
    - GET com parâmetros de query

2. **POST Requests**
    - POST com payload JSON
    - POST com form data

3. **Status Codes**
    - Testes de diferentes códigos de status (200, 404, 500)

4. **Response Formats**
    - Respostas JSON
    - Respostas XML

5. **Authentication**
    - Autenticação básica

## ⚙️ Configurações de Carga

O teste é executado com as seguintes etapas:
- 30s: Rampa de subida para 5 VUs
- 1m: Manutenção de 5 VUs
- 2m: Aumento gradual para 10 VUs
- 1m: Manutenção de 10 VUs
- 30s: Rampa de descida

## 📊 Métricas e Thresholds

- **Tempo de Resposta**: 95% das requisições < 1s
- **GET Requests**: 95% < 800ms
- **Taxa de Erro**: < 10%
- **Taxa de Sucesso**: > 95%

## 📝 Resultados

Os resultados são gerados em diferentes formatos:
- Sumário no console
- Arquivo JSON com métricas detalhadas
- Dashboard Grafana (quando configurado)

## 🔍 Monitoramento em Tempo Real

Para monitoramento em tempo real, configure:

1. InfluxDB:
```bash
docker run -d --name influxdb -p 8086:8086 influxdb:1.8
```

2. Grafana:
```bash
docker run -d --name grafana -p 3000:3000 grafana/grafana
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ✨ Reconhecimentos

- [k6](https://k6.io/) - Framework de testes de performance
- [HTTPBin](https://httpbin.org/) - Serviço para testes HTTP