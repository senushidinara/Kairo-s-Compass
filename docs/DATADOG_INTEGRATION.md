# Datadog Integration Guide for Kairo's Compass

## Overview

This document provides a comprehensive guide to the Datadog integration for Kairo's Compass, covering architecture, monitoring areas, alert configuration, dashboard access, and troubleshooting.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Monitoring Areas](#monitoring-areas)
3. [Dashboards](#dashboards)
4. [Monitors and Alerts](#monitors-and-alerts)
5. [Custom Metrics](#custom-metrics)
6. [Synthetic Tests](#synthetic-tests)
7. [APM and Distributed Tracing](#apm-and-distributed-tracing)
8. [Deployment Tracking](#deployment-tracking)
9. [Troubleshooting](#troubleshooting)
10. [Team Runbooks](#team-runbooks)

---

## Architecture Overview

Kairo's Compass uses Datadog for comprehensive observability across all platform layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  React UI    │  │  FastAPI     │  │  Cloud Fns   │      │
│  │  (Browser)   │  │  Backend     │  │  (Serverless)│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  dd-trace APM  │                        │
│                    │  hot-shots     │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Datadog Agent   │
                    │  (StatsD/APM)    │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   GCP          │  │   Kafka/        │  │   PostgreSQL   │
│   Integration  │  │   Confluent     │  │   Monitoring   │
└────────────────┘  └─────────────────┘  └────────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Datadog Platform│
                    │  - Dashboards    │
                    │  - Monitors      │
                    │  - APM           │
                    │  - Logs          │
                    │  - Synthetics    │
                    └──────────────────┘
```

### Components

1. **Application Instrumentation**
   - `dd-trace`: Automatic APM tracing for Node.js/Python
   - `hot-shots`: StatsD client for custom metrics
   - Service: `services/datadog-integration.ts`

2. **Datadog Agent**
   - Deployed alongside applications
   - Collects metrics, traces, and logs
   - Forwards to Datadog platform

3. **Cloud Integrations**
   - GCP: Cloud Run, Cloud Functions, PostgreSQL
   - Kafka/Confluent: Stream processing metrics
   - External APIs: Weather, AIS data sources

4. **Datadog Platform**
   - Central monitoring and alerting
   - Dashboards for visualization
   - APM for distributed tracing
   - Synthetic tests for endpoint monitoring

---

## Monitoring Areas

### 1. Infrastructure Monitoring

#### Google Cloud Platform
- **Cloud Run Containers**
  - CPU and memory utilization
  - Request rate and latency
  - Container instance count
  - Cold start frequency

- **Cloud Functions**
  - Execution time and count
  - Error rates
  - Memory usage
  - Concurrent executions

- **PostgreSQL/PostGIS**
  - Query performance (P50, P95, P99)
  - Connection pool utilization
  - Database size and growth
  - Slow query identification
  - Replication lag

- **Redis Cache**
  - Hit/miss ratio
  - Memory utilization
  - Eviction rate
  - Connection count

**Key Metrics:**
- `system.cpu.user` - CPU utilization
- `system.mem.used` / `system.mem.total` - Memory usage
- `gcp.run.request.count` - GCP Cloud Run requests
- `kairo.db.connection_pool.*` - Database connections

### 2. Application Performance Monitoring (APM)

#### Endpoint Tracking
- Request rate by endpoint
- Response time distribution (P50, P75, P90, P95, P99)
- Error rate by status code
- Slow endpoint identification

#### Distributed Tracing
- End-to-end request traces
- Service dependency mapping
- Bottleneck identification
- Cross-service latency

#### Custom Business Metrics
- Route calculation time
- Fuel savings calculations
- Voyage optimization success rate
- Model prediction accuracy

**Key Metrics:**
- `trace.web.request.duration` - Request duration
- `trace.web.request.errors` - Request errors
- `kairo.route.calculation_time_ms` - Route calculation performance
- `kairo.api.requests` - API request count

### 3. Data Pipeline Observability

#### Confluent Kafka
- Consumer lag by topic and partition
- Message throughput
- Failed message count
- Partition rebalancing events

#### AIS Data Ingestion
- Message ingestion rate
- Data freshness (age of latest data)
- Parsing error rate
- Data quality metrics

#### ML Model Performance
- Prediction latency
- Model accuracy score
- Confidence distribution
- Feature processing time
- Vertex AI integration metrics

**Key Metrics:**
- `kairo.kafka.consumer_lag` - Kafka consumer lag
- `kairo.ais.messages_per_second` - AIS ingestion rate
- `kairo.ais.data_age_seconds` - Data freshness
- `kairo.current.accuracy_score` - Model accuracy

### 4. Security & Compliance

#### Authentication (Auth0)
- Login success/failure rate
- Token refresh frequency
- Session duration
- Failed authentication attempts

#### API Security
- Rate limit hits
- Unauthorized access attempts
- Suspicious request patterns
- DDoS detection metrics

#### GDPR Compliance
- Data access logging
- Data deletion requests
- Consent management
- Data retention tracking

**Key Metrics:**
- `kairo.auth.logins` - Authentication attempts
- `kairo.api.rate_limit_hits` - Rate limiting
- `kairo.security.unauthorized_attempts` - Security events

### 5. Business Metrics

#### Fuel Savings
- Total fuel saved (metric tons)
- Fuel savings percentage vs baseline
- Predicted vs actual savings accuracy
- Savings by route type and vessel

#### Environmental Impact
- CO₂ reduction (metric tons)
- Carbon credit equivalent
- Environmental score

#### Voyage Optimization
- Number of optimized voyages
- Optimization success rate
- Average time saved per voyage
- Port congestion prediction accuracy

#### Financial Metrics
- Cost savings (USD)
- Revenue impact
- Customer satisfaction scores

**Key Metrics:**
- `kairo.fuel_savings.percentage` - Fuel savings %
- `kairo.fuel_savings.total` - Total fuel saved
- `kairo.co2_reduction.total` - CO₂ reduction
- `kairo.cost_savings.total` - Cost savings
- `kairo.voyages.optimized` - Optimized voyage count

---

## Dashboards

### 1. Global Operations Dashboard

**URL:** `https://app.datadoghq.com/dashboard/global-operations`

**Purpose:** Real-time operational overview for mission control

**Widgets:**
- **Active Voyages Map:** Geomap showing vessel positions
- **System Health Score:** Overall platform health (0-100)
- **Active Voyages Count:** Current voyages in progress
- **Fuel Savings (24h):** Daily fuel savings metric
- **Voyage Status Distribution:** Breakdown by status
- **API Request Rate:** Real-time request volume
- **AIS Ingestion Rate:** Data pipeline health
- **Top Vessels by Savings:** Performance leaders
- **Route Latency Distribution:** Performance heatmap
- **Active Alerts:** Current system alerts

**Audience:** Operations team, Customer success, Management

**Refresh Rate:** 10 seconds (real-time)

### 2. System Performance Dashboard

**URL:** `https://app.datadoghq.com/dashboard/system-performance`

**Purpose:** Technical performance monitoring for engineering teams

**Widgets:**
- **P95 Latency Across Services:** Performance tracking
- **Error Rate by Service:** Error monitoring
- **Service Dependency Map:** Architecture visualization
- **CPU Utilization:** Resource usage
- **Memory Utilization:** Memory tracking
- **Database Connection Pool:** Connection monitoring
- **Database Query Performance:** Query latency (P50/P95/P99)
- **Cache Hit Rate:** Cache efficiency
- **GCP Cloud Run Instances:** Infrastructure scaling
- **Kafka Consumer Lag:** Data pipeline lag
- **API Response Distribution:** Detailed latency breakdown
- **Slowest Endpoints:** Performance bottlenecks
- **Endpoints with Most Errors:** Error hotspots

**Audience:** Engineering teams, DevOps, SRE

**Refresh Rate:** 30 seconds

### 3. Business Impact Dashboard

**URL:** `https://app.datadoghq.com/dashboard/business-impact`

**Purpose:** Business metrics and ROI tracking

**Widgets:**
- **Total Fuel Saved (MTD):** Monthly fuel savings
- **CO₂ Reduction (MTD):** Environmental impact
- **Cost Savings (MTD):** Financial impact
- **Voyages Optimized (MTD):** Volume metrics
- **Cumulative Fuel Savings Trend:** Historical savings
- **Cumulative CO₂ Reduction Trend:** Environmental trend
- **Fuel Savings % by Voyage:** Performance distribution
- **Optimization Success Rate:** Quality metric
- **Savings by Route Type:** Route analysis
- **Cost Savings by Customer:** Customer value
- **Top Performing Routes:** Best performers
- **Model Prediction Accuracy:** ML performance
- **Average ETA Accuracy:** Timing precision
- **Monthly Performance Summary:** Executive summary

**Audience:** Business operations, Executives, Sales, Marketing

**Refresh Rate:** 1 minute

---

## Monitors and Alerts

### Alert Severity Levels

| Priority | Description | Response Time | Notification |
|----------|-------------|---------------|--------------|
| P1 (Critical) | Service down, data loss risk | Immediate | PagerDuty + Slack |
| P2 (High) | Degraded performance, high error rate | 15 minutes | Slack + Email |
| P3 (Medium) | Warning thresholds, potential issues | 1 hour | Slack |
| P4 (Low) | Informational, trends | Next business day | Email |

### Configured Monitors

#### 1. Route Calculation Latency (P2)
- **Metric:** `kairo.route.calculation_time_ms`
- **Threshold:** Critical > 5000ms, Warning > 3000ms
- **Window:** Last 5 minutes
- **Action:** Check GCP instance performance, database queries
- **Notification:** @slack-nav-engineering, @pagerduty

#### 2. AIS Data Ingestion Gap (P1)
- **Metric:** `kairo.ais.data_age_seconds`
- **Threshold:** Critical > 120s, Warning > 90s
- **Window:** Last 5 minutes
- **Action:** Check Kafka pipeline, data sources
- **Notification:** @slack-data-engineering-critical, @pagerduty-critical

#### 3. High CPU Utilization (P2)
- **Metric:** `system.cpu.user`
- **Threshold:** Critical > 80%, Warning > 65%
- **Window:** Last 5 minutes
- **Action:** Check for resource-intensive operations, scale if needed
- **Notification:** @slack-infrastructure-alerts, @pagerduty

#### 4. Memory Pressure (P1)
- **Metric:** `system.mem.used / system.mem.total`
- **Threshold:** Critical > 90%, Warning > 75%
- **Window:** Last 5 minutes
- **Action:** Investigate memory leaks, increase capacity
- **Notification:** @slack-infrastructure-critical, @pagerduty-critical

#### 5. Database Connection Pool Saturation (P2)
- **Metric:** `kairo.db.connection_pool.used / kairo.db.connection_pool.total`
- **Threshold:** Critical > 95%, Warning > 85%
- **Window:** Last 5 minutes
- **Action:** Check for connection leaks, increase pool size
- **Notification:** @slack-database-alerts, @pagerduty

#### 6. Fuel Savings Deviation (P2)
- **Metric:** `|kairo.fuel_savings.actual - kairo.fuel_savings.predicted| / kairo.fuel_savings.predicted`
- **Threshold:** Critical > 5%, Warning > 3%
- **Window:** Last 1 hour
- **Action:** Review ML model performance, data quality
- **Notification:** @slack-ml-engineering, @slack-business-ops

#### 7. Route Optimization Success Rate (P2)
- **Metric:** `kairo.route.optimization_success_rate`
- **Threshold:** Critical < 95%, Warning < 97%
- **Window:** Last 1 hour
- **Action:** Check external APIs, database, input validation
- **Notification:** @slack-nav-engineering, @slack-customer-success

#### 8. Port Congestion Prediction Accuracy (P3)
- **Metric:** `kairo.port.congestion_prediction_accuracy`
- **Threshold:** Critical < 80%, Warning < 85%
- **Window:** Last 24 hours
- **Action:** Review prediction model, historical data
- **Notification:** @slack-ml-engineering, @slack-operations

---

## Custom Metrics

### Recording Metrics in Application Code

The `DatadogIntegration` service provides convenient methods for recording custom metrics:

```typescript
import { datadogIntegration } from './services/datadog-integration';

// Record route calculation
datadogIntegration.recordRouteCalculation(
  durationMs,
  success,
  { vessel_type: 'container_ship', route_type: 'transpacific' }
);

// Record fuel savings
datadogIntegration.recordFuelSavings(
  percentageSaved,
  totalSaved,
  predicted,
  actual,
  { voyage_id: '12345', vessel_id: 'IMO9876543' }
);

// Record voyage optimization
datadogIntegration.recordVoyageOptimized('voyage_12345', {
  customer_id: 'cust_123'
});

// Measure execution time
const result = await datadogIntegration.measureTime(
  'route.processing_time_ms',
  async () => {
    return await processRoute(data);
  },
  { route_type: 'transpacific' }
);
```

### Metric Naming Convention

Follow the `kairo.<category>.<metric_name>` pattern:

- `kairo.route.*` - Route calculation metrics
- `kairo.fuel_savings.*` - Fuel savings metrics
- `kairo.voyages.*` - Voyage-related metrics
- `kairo.ais.*` - AIS data pipeline metrics
- `kairo.db.*` - Database metrics
- `kairo.cache.*` - Cache metrics
- `kairo.kafka.*` - Kafka metrics
- `kairo.api.*` - API metrics
- `kairo.port.*` - Port-related metrics
- `kairo.current.*` - Ocean current/weather metrics

### Metric Types

- **Gauge:** Current value (e.g., active voyages, CPU usage)
- **Counter:** Cumulative count (e.g., total requests, errors)
- **Histogram:** Distribution of values (e.g., latency, processing time)
- **Rate:** Events per second (e.g., requests/second)

---

## Synthetic Tests

### Configured Tests

#### 1. API Health Check
- **Type:** API test
- **Endpoint:** `GET /health`
- **Frequency:** Every 1 minute
- **Locations:** 12 global regions
- **Assertions:**
  - Status code: 200
  - Response time < 500ms
  - Body contains "healthy"
- **Tags:** `health-check`, `critical-path`

#### 2. Route Calculation E2E
- **Type:** API test
- **Endpoint:** `POST /api/v1/routes/calculate`
- **Frequency:** Every 5 minutes
- **Locations:** 4 strategic regions
- **Assertions:**
  - Status code: 200
  - Response time < 5000ms
  - Valid route returned
  - Fuel savings > 0%
- **Tags:** `e2e-tests`, `route-calculation`

### Test Locations

- North America: us-east-1, us-west-2, ca-central-1
- Europe: eu-west-1, eu-central-1
- Asia Pacific: ap-northeast-1, ap-southeast-1, ap-southeast-2
- South America: sa-east-1
- Azure: eastus, westeurope
- GCP: us-central1

---

## APM and Distributed Tracing

### Enabling APM

Add to application startup:

```typescript
// tracer.ts
import tracer from 'dd-trace';

tracer.init({
  service: process.env.DD_SERVICE || 'kairo-compass',
  env: process.env.DD_ENV || 'production',
  version: process.env.DD_VERSION || '1.0.0',
  logInjection: true,
  analytics: true,
});

export default tracer;
```

### Trace Visualization

Access traces in Datadog:
1. Go to **APM → Traces**
2. Filter by service: `kairo-api`
3. View flamegraphs for request breakdown
4. Identify slow operations

### Custom Spans

```typescript
import tracer from './tracer';

const span = tracer.startSpan('route.calculation');
span.setTag('vessel.type', vesselType);

try {
  const result = await calculateRoute(data);
  span.setTag('result.success', true);
  return result;
} catch (error) {
  span.setTag('error', true);
  span.setTag('error.message', error.message);
  throw error;
} finally {
  span.finish();
}
```

---

## Deployment Tracking

### Automatic Deployment Events

Deployments are automatically tracked via GitHub Actions workflow:
- Deployment timestamp
- Environment (dev/staging/prod)
- Version/commit SHA
- Deployment status (success/failure)

### Viewing Deployments in Datadog

1. **Event Stream:**
   ```
   https://app.datadoghq.com/event/stream?query=deployment:true service:kairo-compass
   ```

2. **Deployment Overlay on Dashboards:**
   - Deployment markers appear as vertical lines on graphs
   - Hover to see deployment details

3. **Correlating with Performance:**
   - Compare metrics before/after deployment
   - Identify regressions introduced by specific commits

---

## Troubleshooting

### Common Issues

#### Metrics Not Appearing

**Problem:** Custom metrics not visible in Datadog

**Solutions:**
1. Verify Datadog agent is running: `service datadog-agent status`
2. Check agent logs: `/var/log/datadog/agent.log`
3. Validate StatsD configuration in code
4. Confirm firewall allows port 8125 (UDP)
5. Check metric name follows convention

#### High Latency in Traces

**Problem:** APM shows high latency but application feels fast

**Solutions:**
1. Check for clock skew between services
2. Verify network latency between services
3. Review trace sampling rate
4. Check for instrumentation overhead

#### Synthetic Tests Failing

**Problem:** Synthetic tests fail but application is accessible

**Solutions:**
1. Verify test assertions are correct
2. Check endpoint authentication
3. Review test locations and network paths
4. Validate response format matches expectations
5. Check for rate limiting on test traffic

#### Monitor Alert Fatigue

**Problem:** Too many false positive alerts

**Solutions:**
1. Adjust alert thresholds based on baselines
2. Increase evaluation window
3. Require multiple failures before alerting
4. Use anomaly detection instead of static thresholds
5. Implement alert muting during deployments

---

## Team Runbooks

### Route Calculation Latency Alert

**Alert:** Route calculation exceeding 5 seconds

**Investigation Steps:**
1. Check current load: Dashboard → System Performance
2. Review recent deployments: Event Stream
3. Check database performance: Query duration metrics
4. Verify external API status: Weather API, AIS feed
5. Review APM traces for slow spans

**Remediation:**
- If database: Optimize queries, add indexes
- If external API: Implement caching, add fallbacks
- If load: Scale GCP Cloud Run instances
- If code regression: Rollback deployment

**Escalation:** Nav Engineering team lead after 30 minutes

---

### AIS Data Ingestion Gap Alert

**Alert:** AIS data older than 2 minutes

**Investigation Steps:**
1. Check Kafka consumer lag: `kairo.kafka.consumer_lag`
2. Verify Confluent Cloud status
3. Check AIS data source connectivity
4. Review error logs in Cloud Functions
5. Validate data transformation pipeline

**Remediation:**
- If consumer lag: Increase consumer instances
- If source down: Switch to backup feed
- If parsing errors: Fix transformation logic
- If Kafka down: Contact Confluent support

**Escalation:** Data Engineering team lead immediately (P1)

---

### High CPU/Memory Utilization Alert

**Alert:** Resource utilization exceeding thresholds

**Investigation Steps:**
1. Identify resource-intensive processes
2. Check for infinite loops or memory leaks
3. Review recent code changes
4. Analyze APM traces for slow operations
5. Check for external service timeouts

**Remediation:**
- If transient: Monitor for auto-recovery
- If sustained: Scale horizontally
- If memory leak: Restart instances, deploy fix
- If code issue: Rollback or hotfix

**Escalation:** Infrastructure team after 15 minutes

---

### Fuel Savings Deviation Alert

**Alert:** Actual savings differ from predicted by >5%

**Investigation Steps:**
1. Compare recent voyages: Predicted vs Actual
2. Check ML model version and deployment date
3. Verify input data quality: Weather, currents, AIS
4. Review vessel adherence to recommended routes
5. Check for external factors: Weather events, port delays

**Remediation:**
- If model issue: Retrain or rollback model
- If data quality: Fix data pipeline
- If route adherence: Contact operations team
- If external factors: Document and adjust

**Escalation:** ML Engineering team lead after 1 hour

---

## Best Practices

### 1. Metric Design
- Use consistent naming conventions
- Tag metrics appropriately (environment, service, customer)
- Choose correct metric types (gauge vs counter vs histogram)
- Avoid high cardinality tags (e.g., user IDs, timestamps)

### 2. Alert Configuration
- Set meaningful thresholds based on SLOs
- Avoid alert fatigue with appropriate sensitivity
- Include actionable information in alert messages
- Define clear escalation paths

### 3. Dashboard Design
- Group related metrics together
- Use appropriate visualization types
- Include context (SLO lines, deployment markers)
- Design for target audience (technical vs business)

### 4. Incident Response
- Use deployment markers to identify changes
- Correlate metrics across dashboards
- Document findings in Datadog notebooks
- Update runbooks based on learnings

---

## Additional Resources

- **Datadog Documentation:** https://docs.datadoghq.com/
- **Internal Wiki:** [Link to team wiki]
- **Slack Channels:**
  - `#nav-engineering` - General engineering
  - `#sre` - Infrastructure and reliability
  - `#data-engineering` - Data pipeline
  - `#ml-engineering` - Machine learning
- **On-Call Schedule:** [Link to PagerDuty]

---

**Last Updated:** 2024-12-14
**Maintained By:** Navigation Engineering Team & SRE
**Version:** 1.0.0
