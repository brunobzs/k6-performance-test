const fs = require('fs');
const Handlebars = require('handlebars');

const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Performance Test Report</h1>
        
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Summary</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-600">Total Requests</p>
                    <p class="text-2xl font-bold">{{metrics.iterations}}</p>
                </div>
                <div class="p-4 bg-green-50 rounded-lg">
                    <p class="text-sm text-gray-600">Success Rate</p>
                    <p class="text-2xl font-bold">{{successRate}}%</p>
                </div>
                <div class="p-4 bg-yellow-50 rounded-lg">
                    <p class="text-sm text-gray-600">Avg Response Time</p>
                    <p class="text-2xl font-bold">{{avgResponseTime}}ms</p>
                </div>
                <div class="p-4 bg-red-50 rounded-lg">
                    <p class="text-sm text-gray-600">Error Rate</p>
                    <p class="text-2xl font-bold">{{errorRate}}%</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Thresholds</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full table-auto">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="px-6 py-3 text-left">Metric</th>
                            <th class="px-6 py-3 text-left">Threshold</th>
                            <th class="px-6 py-3 text-left">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each thresholds}}
                        <tr class="border-t">
                            <td class="px-6 py-4">{{name}}</td>
                            <td class="px-6 py-4">{{threshold}}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full {{#if passed}}bg-green-100 text-green-800{{else}}bg-red-100 text-red-800{{/if}}">
                                    {{#if passed}}PASSED{{else}}FAILED{{/if}}
                                </span>
                            </td>
                        </tr>
                        {{/each}}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-4">Detailed Metrics</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {{#each detailedMetrics}}
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-semibold mb-2">{{name}}</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-gray-600">Average</p>
                            <p class="font-medium">{{avg}}</p>
                        </div>
                        <div>
                            <p class="text-gray-600">Median</p>
                            <p class="font-medium">{{med}}</p>
                        </div>
                        <div>
                            <p class="text-gray-600">P95</p>
                            <p class="font-medium">{{p95}}</p>
                        </div>
                        <div>
                            <p class="text-gray-600">Max</p>
                            <p class="font-medium">{{max}}</p>
                        </div>
                    </div>
                </div>
                {{/each}}
            </div>
        </div>
    </div>
</body>
</html>
`;

function processResults(jsonResults) {
  const results = JSON.parse(jsonResults);

  // Calcular métricas
  const successRate = ((1 - (results.metrics.errors || 0)) * 100).toFixed(2);
  const avgResponseTime = (results.metrics.http_req_duration.avg || 0).toFixed(2);
  const errorRate = ((results.metrics.errors || 0) * 100).toFixed(2);

  // Processar thresholds
  const thresholds = Object.entries(results.thresholds || {}).map(([name, data]) => ({
    name,
    threshold: data.threshold,
    passed: data.ok
  }));

  // Processar métricas detalhadas
  const detailedMetrics = Object.entries(results.metrics || {})
    .filter(([name]) => name !== 'errors')
    .map(([name, data]) => ({
      name,
      avg: data.avg?.toFixed(2) || 'N/A',
      med: data.med?.toFixed(2) || 'N/A',
      p95: data.p95?.toFixed(2) || 'N/A',
      max: data.max?.toFixed(2) || 'N/A'
    }));

  return {
    metrics: results.metrics,
    successRate,
    avgResponseTime,
    errorRate,
    thresholds,
    detailedMetrics
  };
}

// Ler argumentos da linha de comando
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Usage: node generate-report.js <input-json> <output-html>');
  process.exit(1);
}

// Ler arquivo JSON e gerar relatório
const jsonResults = fs.readFileSync(inputFile, 'utf8');
const data = processResults(jsonResults);

// Compilar template e gerar HTML
const compiledTemplate = Handlebars.compile(template);
const html = compiledTemplate(data);

// Salvar arquivo HTML
fs.writeFileSync(outputFile, html);
console.log(`Report generated: ${outputFile}`);