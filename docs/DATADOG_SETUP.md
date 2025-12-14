# Datadog Setup Guide for Kairo's Compass

This guide provides step-by-step instructions for setting up Datadog monitoring for Kairo's Compass.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Datadog Account Setup](#datadog-account-setup)
3. [Secret Configuration](#secret-configuration)
4. [GCP Integration Setup](#gcp-integration-setup)
5. [Application Instrumentation](#application-instrumentation)
6. [Synthetic Test Configuration](#synthetic-test-configuration)
7. [Monitor Deployment](#monitor-deployment)
8. [Dashboard Setup](#dashboard-setup)
9. [Terraform Deployment](#terraform-deployment)
10. [Verification](#verification)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Datadog account with admin access
- [ ] GCP project with appropriate permissions
- [ ] GitHub repository admin access
- [ ] Node.js 18+ installed (for local testing)
- [ ] Terraform 1.0+ installed (for IaC deployment)
- [ ] Access to production environment

---

## Datadog Account Setup

### Step 1: Create or Access Datadog Account

1. Go to [https://www.datadoghq.com/](https://www.datadoghq.com/)
2. Sign up or log in to your organization
3. Note your Datadog site:
   - US1: `datadoghq.com`
   - US3: `us3.datadoghq.com`
   - US5: `us5.datadoghq.com`
   - EU: `datadoghq.eu`
   - AP1: `ap1.datadoghq.com`

### Step 2: Generate API Keys

#### Create API Key

1. Navigate to **Organization Settings** → **API Keys**
2. Click **New Key**
3. Name: `kairo-compass-api-key`
4. Click **Create Key**
5. **Copy the key immediately** (it won't be shown again)
6. Save it securely (you'll need it later)

#### Create Application Key

1. Navigate to **Organization Settings** → **Application Keys**
2. Click **New Key**
3. Name: `kairo-compass-app-key`
4. Scopes: Select all necessary permissions
   - `synthetics_read`
   - `synthetics_write`
   - `monitors_read`
   - `monitors_write`
   - `events_read`
   - `metrics_read`
   - `dashboards_read`
5. Click **Create Key**
6. **Copy the key immediately**
7. Save it securely

---

## Secret Configuration

### GitHub Secrets

Add secrets to your GitHub repository for CI/CD workflows:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add the following secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `DD_API_KEY` | Your Datadog API key | Required for all Datadog integrations |
| `DD_APP_KEY` | Your Datadog Application key | Required for Synthetics and API operations |

**Steps for each secret:**
1. Click **New repository secret**
2. Name: Enter the secret name from table
3. Value: Paste the key from Datadog
4. Click **Add secret**

### Environment Variables

For local development and deployment:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your keys:
   ```bash
   # Datadog Configuration
   DATADOG_API_KEY=your_actual_api_key_here
   DATADOG_APP_KEY=your_actual_app_key_here
   DATADOG_SITE=datadoghq.com  # or your specific site
   
   # Datadog Service Configuration
   DD_SERVICE=kairo-compass
   DD_ENV=production  # or development, staging
   DD_VERSION=1.0.0
   
   # Datadog Tags
   DD_TAGS=team:nav-engineering,service:kairo-api,project:kairo-compass
   ```

3. **Never commit `.env` to git** - it's already in `.gitignore`

---

## GCP Integration Setup

### Step 1: Create GCP Service Account

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**

**Service Account Details:**
- Name: `datadog-integration`
- ID: `datadog-integration`
- Description: `Service account for Datadog monitoring integration`

**Grant Permissions:**
Add the following roles:
- `Compute Viewer`
- `Monitoring Viewer`
- `Cloud Asset Viewer`
- `Cloud Functions Viewer` (if using Cloud Functions)
- `Cloud Run Viewer` (if using Cloud Run)
- `Cloud SQL Viewer` (if using Cloud SQL)

5. Click **Create and Continue**
6. Click **Done**

### Step 2: Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Click **Create**
6. Save the downloaded JSON file securely

### Step 3: Configure Datadog GCP Integration

#### Via Datadog UI:

1. Log in to Datadog
2. Go to **Integrations** → **Google Cloud Platform**
3. Click **Install Integration**
4. Upload the service account JSON file
5. Or manually enter:
   - Project ID: `your-gcp-project-id`
   - Client Email: From JSON file
   - Private Key: From JSON file
6. Configure host filters (optional):
   ```
   service:kairo-compass
   ```
7. Enable **Automute** for scheduled maintenance
8. Enable **CSPM Resource Collection** for security monitoring
9. Click **Install Integration**

#### Via Terraform:

Update `terraform/variables.tf` with your GCP details:

```hcl
# terraform.tfvars
gcp_project_id     = "your-gcp-project-id"
gcp_client_email   = "datadog-integration@your-project.iam.gserviceaccount.com"
gcp_private_key_id = "key-id-from-json"
gcp_private_key    = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Note:** Never commit `terraform.tfvars` with sensitive data. Use Terraform Cloud or environment variables instead.

---

## Application Instrumentation

### Step 1: Install Dependencies

```bash
cd /home/runner/work/Kairo-s-Compass/Kairo-s-Compass
npm install hot-shots dd-trace --save
```

### Step 2: Initialize Datadog Tracer

Create `tracer.ts` in your application root:

```typescript
// tracer.ts
import tracer from 'dd-trace';

tracer.init({
  service: process.env.DD_SERVICE || 'kairo-compass',
  env: process.env.DD_ENV || 'production',
  version: process.env.DD_VERSION || '1.0.0',
  logInjection: true,
  analytics: true,
  runtimeMetrics: true,
  profiling: process.env.DD_PROFILING_ENABLED === 'true',
  plugins: true,
});

export default tracer;
```

### Step 3: Import Tracer at Application Start

Update your main application file (e.g., `index.ts` or `server.ts`):

```typescript
// IMPORTANT: Import tracer FIRST, before any other imports
import './tracer';

// Now import other modules
import express from 'express';
import { datadogIntegration } from './services/datadog-integration';

const app = express();

// Your application code...
```

### Step 4: Add Custom Metrics

Use the Datadog integration service throughout your application:

```typescript
import { datadogIntegration } from './services/datadog-integration';

// Example: Record route calculation
async function calculateRoute(request: RouteRequest): Promise<Route> {
  const startTime = Date.now();
  let success = true;
  
  try {
    const route = await performCalculation(request);
    
    // Record fuel savings
    datadogIntegration.recordFuelSavings(
      route.fuelSavingsPercentage,
      route.fuelSavedTons,
      route.predictedSavings,
      route.actualSavings,
      {
        vessel_type: request.vesselType,
        route_type: request.routeType,
      }
    );
    
    return route;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    datadogIntegration.recordRouteCalculation(duration, success);
  }
}
```

### Step 5: Deploy Datadog Agent

#### For Docker/Kubernetes:

```yaml
# docker-compose.yml or kubernetes deployment
datadog-agent:
  image: gcr.io/datadoghq/agent:latest
  environment:
    - DD_API_KEY=${DD_API_KEY}
    - DD_SITE=${DD_SITE}
    - DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true
    - DD_APM_ENABLED=true
    - DD_APM_NON_LOCAL_TRAFFIC=true
  ports:
    - "8126:8126"  # APM
    - "8125:8125/udp"  # StatsD
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - /proc/:/host/proc/:ro
    - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
```

#### For GCP Cloud Run:

Add Datadog agent as a sidecar or use Datadog's serverless integration:

```bash
# Install Datadog Lambda/Serverless layer
gcloud beta run services update kairo-api \
  --set-env-vars="DD_API_KEY=${DD_API_KEY},DD_SITE=${DD_SITE},DD_SERVICE=kairo-api"
```

---

## Synthetic Test Configuration

### Step 1: Create API Health Check Test

1. Go to Datadog → **Synthetic Tests** → **New Test**
2. Select **HTTP Test**
3. Configure:

**Define request:**
- Name: `Kairo's Compass - API Health Check`
- Method: `GET`
- URL: `https://api.kairos-compass.com/health`
- Advanced Options:
  - Timeout: 30 seconds
  - Headers: `User-Agent: Datadog Synthetics`

**Define assertions:**
- Status code: `is` `200`
- Response time: `less than` `500 ms`
- Body: `contains` `healthy`

**Select locations:**
Select 12 locations from different regions:
- US: us-east-1, us-west-2
- Europe: eu-west-1, eu-central-1
- Asia: ap-northeast-1, ap-southeast-1, ap-southeast-2
- Others: ca-central-1, sa-east-1, etc.

**Set test frequency:**
- Run: Every `1 minute`

**Define alert conditions:**
- Alert if: `2` locations fail for `2` minutes
- Renotify: Every `0` minutes (only once)
- Notification message: Use template from `datadog/synthetics/api-health-check.json`

**Tags:**
```
service:kairo-api
team:sre
category:health-check
env:production
slo:availability
```

4. Click **Create Test**

### Step 2: Create Route Calculation E2E Test

1. Create another **HTTP Test**
2. Configure:

**Define request:**
- Name: `Kairo's Compass - Route Calculation E2E`
- Method: `POST`
- URL: `https://api.kairos-compass.com/api/v1/routes/calculate`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{SYNTHETICS_API_TOKEN}}`
- Body: Use JSON from `datadog/synthetics/route-calculation-e2e.json`

**Define assertions:**
- Status code: `is` `200`
- Response time: `less than` `5000 ms`
- Body: `contains` `optimized_route`
- Body: `contains` `fuel_savings`
- JSONPath: `$.fuel_savings.percentage` `greater than` `0`

**Select locations:**
Select 4 strategic locations

**Set test frequency:**
- Run: Every `5 minutes`

**Tags:**
```
service:kairo-api
team:nav-engineering
category:e2e-test
env:production
feature:route-calculation
slo:functionality
```

3. Click **Create Test**

### Step 3: Configure API Token for Synthetic Tests

1. Create a dedicated API token for synthetic tests
2. Store in **Synthetic Tests** → **Settings** → **Global Variables**
3. Name: `SYNTHETICS_API_TOKEN`
4. Value: Your API token
5. Secure: Check the box

---

## Monitor Deployment

### Option 1: Manual Creation in Datadog UI

Create each monitor from the JSON files in `datadog/monitors/`:

1. Go to **Monitors** → **New Monitor**
2. Select **Metric** (or appropriate type)
3. Copy configuration from JSON files
4. Adapt the query, thresholds, and message
5. Add tags
6. Click **Create**

### Option 2: Import via Datadog API

Use the Datadog API to import monitors:

```bash
# Example: Create route calculation latency monitor
curl -X POST "https://api.datadoghq.com/api/v1/monitor" \
-H "Content-Type: application/json" \
-H "DD-API-KEY: ${DD_API_KEY}" \
-H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
-d @datadog/monitors/route-calculation-latency.json
```

### Option 3: Use Terraform (Recommended)

See [Terraform Deployment](#terraform-deployment) section below.

---

## Dashboard Setup

### Option 1: Import via Datadog UI

1. Go to **Dashboards** → **New Dashboard**
2. Click **Import Dashboard JSON**
3. Upload one of the dashboard files:
   - `datadog/dashboards/global-operations.json`
   - `datadog/dashboards/system-performance.json`
   - `datadog/dashboards/business-impact.json`
4. Review and adjust widgets if needed
5. Click **Import**

### Option 2: Import via Datadog API

```bash
# Example: Create global operations dashboard
curl -X POST "https://api.datadoghq.com/api/v1/dashboard" \
-H "Content-Type: application/json" \
-H "DD-API-KEY: ${DD_API_KEY}" \
-H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
-d @datadog/dashboards/global-operations.json
```

### Option 3: Create Manually

Follow the dashboard specifications in the JSON files to create widgets manually.

---

## Terraform Deployment

### Step 1: Initialize Terraform

```bash
cd terraform

# Initialize Terraform
terraform init
```

### Step 2: Configure Variables

Create `terraform.tfvars`:

```hcl
# Datadog Configuration
datadog_api_key = "your_api_key"
datadog_app_key = "your_app_key"
datadog_site    = "https://api.datadoghq.com"

# GCP Configuration
gcp_project_id     = "your-project-id"
gcp_client_email   = "datadog-integration@your-project.iam.gserviceaccount.com"
gcp_private_key_id = "key-id"
gcp_private_key    = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Notification Configuration
slack_account_name     = "your-workspace"
pagerduty_subdomain    = "your-subdomain"
pagerduty_api_token    = "your-token"
pagerduty_schedule_url = "https://your-subdomain.pagerduty.com/schedules/..."

# Environment
environment = "production"
```

**Security Note:** Never commit `terraform.tfvars` with secrets!

### Step 3: Plan Deployment

```bash
terraform plan
```

Review the planned changes:
- GCP integration
- Monitor creation
- Dashboard setup
- SLO configuration

### Step 4: Apply Configuration

```bash
terraform apply
```

Type `yes` to confirm.

### Step 5: Verify Outputs

```bash
terraform output
```

You should see:
- Datadog API key ID
- Monitor IDs
- Integration status

---

## Verification

### Step 1: Verify Agent Connection

Check that the Datadog agent is connected:

1. Go to **Infrastructure** → **Host Map**
2. Look for your hosts/containers
3. Verify they appear with correct tags

### Step 2: Verify Metrics

Check that custom metrics are reporting:

1. Go to **Metrics** → **Explorer**
2. Search for `kairo.*`
3. Verify metrics appear:
   - `kairo.route.calculation_time_ms`
   - `kairo.fuel_savings.percentage`
   - `kairo.voyages.optimized`

**Note:** It may take 5-10 minutes for first metrics to appear.

### Step 3: Verify APM Traces

Check that traces are being collected:

1. Go to **APM** → **Services**
2. Look for `kairo-compass` or `kairo-api`
3. Click on the service
4. Verify traces appear
5. Check service map shows dependencies

### Step 4: Verify Monitors

1. Go to **Monitors** → **Manage Monitors**
2. Filter by tag: `service:kairo-api`
3. Verify all monitors are created
4. Check that they show data (may be in "No Data" state initially)

### Step 5: Verify Synthetic Tests

1. Go to **Synthetic Tests**
2. Find your created tests
3. Click **Run Test Now**
4. Verify tests pass
5. Check test results show correct metrics

### Step 6: Verify Dashboards

1. Go to **Dashboards**
2. Open each created dashboard:
   - Global Operations
   - System Performance
   - Business Impact
3. Verify widgets load data (may take time for first data)
4. Adjust time range if needed

### Step 7: Test End-to-End Flow

1. Trigger a deployment (push to main)
2. Verify GitHub Actions workflow runs
3. Check Datadog Event Stream for deployment event
4. Verify deployment marker appears on dashboards
5. Check that synthetic tests run automatically
6. Confirm metrics continue to flow

---

## Troubleshooting Setup

### No Metrics Appearing

**Check:**
1. Agent status: `service datadog-agent status`
2. Agent logs: `/var/log/datadog/agent.log`
3. Network connectivity to Datadog
4. API key is correct
5. Firewall allows port 8125 (UDP) and 8126 (TCP)

**Solution:**
```bash
# Restart agent
service datadog-agent restart

# Check agent info
datadog-agent status
```

### APM Not Working

**Check:**
1. Tracer initialized before other imports
2. `DD_TRACE_ENABLED=true` environment variable
3. Agent APM receiver is running
4. Application can connect to agent port 8126

**Solution:**
```bash
# Verify APM configuration
curl http://localhost:8126/info

# Check trace-agent logs
journalctl -u datadog-agent -f | grep trace-agent
```

### Synthetic Tests Failing

**Check:**
1. Test URL is accessible publicly
2. Authentication configured correctly
3. Response format matches assertions
4. Timeout is sufficient

**Solution:**
- Test endpoint manually: `curl -v https://your-endpoint.com`
- Review test results for specific failure reason
- Adjust assertions based on actual response

### GitHub Actions Workflow Failing

**Check:**
1. Secrets are configured in GitHub
2. Secret names match workflow file
3. API/App keys have correct permissions

**Solution:**
1. Re-create secrets in GitHub
2. Test keys manually with curl
3. Check workflow logs for specific error

---

## Next Steps

After successful setup:

1. [ ] Configure notification channels (Slack, PagerDuty)
2. [ ] Adjust alert thresholds based on baseline metrics
3. [ ] Create team-specific dashboards
4. [ ] Set up on-call schedules
5. [ ] Document team runbooks
6. [ ] Train team on Datadog usage
7. [ ] Set up log management (optional)
8. [ ] Configure security monitoring (optional)

---

## Support and Resources

### Internal Support
- Slack: `#sre`, `#devops`
- Email: sre@kairos-compass.com

### Datadog Resources
- [Datadog Documentation](https://docs.datadoghq.com/)
- [Datadog Support](https://help.datadoghq.com/)
- [Datadog Community](https://community.datadoghq.com/)
- [Datadog API Reference](https://docs.datadoghq.com/api/)

### Training
- [Datadog Learning Center](https://learn.datadoghq.com/)
- Internal training sessions (check calendar)

---

**Setup Checklist:**

- [ ] Datadog account created
- [ ] API and Application keys generated
- [ ] GitHub secrets configured
- [ ] `.env` file created and configured
- [ ] GCP service account created
- [ ] GCP integration configured in Datadog
- [ ] Application dependencies installed
- [ ] Datadog tracer initialized
- [ ] Custom metrics implemented
- [ ] Datadog agent deployed
- [ ] Synthetic tests created
- [ ] Monitors deployed
- [ ] Dashboards created
- [ ] Terraform applied (if using IaC)
- [ ] All verifications passed
- [ ] Team trained on Datadog usage

---

**Document Version:** 1.0.0
**Last Updated:** 2024-12-14
**Maintained By:** SRE Team
