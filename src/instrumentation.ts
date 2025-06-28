import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

// -------- PROMETHEUS --------
const PROMETHEUS_PORT = 9464;
const PROMETHEUS_ENDPOINT = '/metrics';
const PROMETHEUS_HOST = '0.0.0.0';

const prometheusExporter = new PrometheusExporter({
  port: PROMETHEUS_PORT,
  endpoint: PROMETHEUS_ENDPOINT,
  host: PROMETHEUS_HOST,
});


// -------- TEMPO --------
const TEMPO_HOST = 'http://localhost';
const TEMPO_PORT = '4318';

const traceExporter = new OTLPTraceExporter({
  url: `${TEMPO_HOST}:${TEMPO_PORT}`
});

const sdk = new NodeSDK({
  traceExporter: traceExporter,
  metricReader: prometheusExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
