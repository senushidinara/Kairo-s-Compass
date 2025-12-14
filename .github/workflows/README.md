# GitHub Actions Workflows Documentation

This directory contains GitHub Actions workflows for Kairo's Compass, including comprehensive Datadog integration for monitoring, testing, and deployment tracking.

## Workflows Overview

### 1. Datadog Synthetic Tests (`datadog-synthetics.yml`)

**Purpose:** Run Datadog synthetic tests to verify application health and functionality across multiple stages of the deployment pipeline.

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Manual workflow dispatch with environment selection

**Jobs:**

#### Pre-deployment Checks
- Checks out code
- Sets up Node.js environment
- Installs dependencies
- Runs production build
- Archives build artifacts

#### Run Synthetic Tests
- Executes health check tests
- Runs end-to-end (E2E) tests
- Validates critical path functionality
- Tests are environment-specific (development, staging, production)

#### Post-deployment Verification
- Waits for deployment stabilization (60 seconds)
- Verifies deployment health with synthetic tests
- Sends success notifications
- Only runs on pushes to `main` branch

**Required Secrets:**
- `DD_API_KEY`: Datadog API Key
- `DD_APP_KEY`: Datadog Application Key

**Usage:**
```bash
# Automatic trigger on push/PR
git push origin main

# Manual trigger with environment selection
# Go to Actions → Run Datadog Synthetic tests → Run workflow
# Select environment: development, staging, or production
```

---

### 2. Datadog Deployment Tracking (`datadog-deployment-tracking.yml`)

**Purpose:** Track deployments in Datadog with detailed metadata for correlation with performance metrics and incident analysis.

**Triggers:**
- Push to `main`, `staging`, or `develop` branches
- Release publication
- Manual workflow dispatch

**Features:**
- Automatically determines environment based on branch
- Captures commit information (SHA, message, author)
- Sends deployment events to Datadog
- Creates deployment markers for dashboard correlation
- Tracks deployment metrics
- Updates deployment status (success/failure)

**Deployment Event Data:**
- Deployment timestamp
- Environment (development/staging/production)
- Version/commit SHA
- Git commit details
- Repository information
- Deployment status

**Datadog Integration Points:**

1. **Deployment Events** - Visible in Datadog Event Stream
   ```
   https://app.datadoghq.com/event/stream?query=deployment:true service:kairo-compass
   ```

2. **Deployment Markers** - Overlays on dashboards and graphs
   - Metric: `kairo.deployment.marker`
   - Tags: service, environment, version, git_commit

3. **Deployment Metrics**
   - Metric: `kairo.deployment.count`
   - Tracks deployment frequency by environment

**Environment Mapping:**
- `main` branch → `production`
- `staging` branch → `staging`
- `develop` branch → `development`
- Manual dispatch → User-selected environment

**Required Secrets:**
- `DD_API_KEY`: Datadog API Key

**Usage:**
```bash
# Automatic deployment tracking
git push origin main  # Tracks production deployment

# Manual deployment tracking
# Go to Actions → Datadog Deployment Tracking → Run workflow
# Specify environment and version
```

---

## CI/CD Integration Points

### Datadog Synthetic Tests
The synthetic tests workflow integrates with the deployment pipeline to ensure:
- **Pre-deployment validation:** Code builds successfully before testing
- **Environment-specific testing:** Tests run against the correct environment
- **Post-deployment verification:** Deployments are healthy before considering them complete

### Deployment Correlation
Deployment tracking enables:
- **Performance correlation:** Match performance changes to specific deployments
- **Incident investigation:** Identify which deployment introduced an issue
- **Deployment frequency metrics:** Track team velocity and deployment patterns
- **Rollback identification:** Quickly identify what changed during incidents

---

## Setup Instructions

### 1. Configure Secrets

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Required For |
|------------|-------------|--------------|
| `DD_API_KEY` | Datadog API Key | Both workflows |
| `DD_APP_KEY` | Datadog Application Key | Synthetic tests only |

To get these keys:
1. Log in to Datadog
2. Go to **Organization Settings → API Keys**
3. Create or copy existing API key
4. Go to **Organization Settings → Application Keys**
5. Create or copy existing Application key

### 2. Configure Datadog Synthetic Tests

Before running the synthetic tests workflow, create synthetic tests in Datadog:

1. Go to **Datadog → Synthetic Tests**
2. Create tests for your application
3. Tag tests appropriately:
   - `health-check` - Basic health endpoints
   - `e2e-tests` - End-to-end functionality tests
   - `critical-path` - Critical user journeys
   - `env:production`, `env:staging`, `env:development` - Environment tags

### 3. Customize Notification Channels

Update the workflow files to use your team's notification channels:
- Replace `@slack-*` mentions with your Slack channel integrations
- Replace `@pagerduty-*` mentions with your PagerDuty integrations

---

## Workflow Best Practices

### For Synthetic Tests:
1. **Tag consistently:** Use standardized tags for test organization
2. **Test environments:** Create separate test configurations per environment
3. **Monitor critical paths:** Focus on user-facing functionality
4. **Set appropriate thresholds:** Balance alerting fatigue with coverage

### For Deployment Tracking:
1. **Use semantic versioning:** Tag releases with proper version numbers
2. **Write descriptive commit messages:** They appear in Datadog events
3. **Track all environments:** Deploy to staging before production
4. **Review deployment markers:** Use them to correlate with performance changes

---

## Troubleshooting

### Synthetic Tests Failing

**Issue:** Tests fail on workflow run but pass manually in Datadog

**Solutions:**
- Check that test tags match the workflow query
- Verify secrets are correctly configured
- Ensure tests are enabled and active in Datadog
- Check test locations match your application endpoints

**Issue:** "No tests found" error

**Solutions:**
- Verify test search query in workflow file
- Confirm tests have the correct tags in Datadog
- Check test status (paused tests are not run)

### Deployment Tracking Not Appearing

**Issue:** Deployment events not visible in Datadog

**Solutions:**
- Verify `DD_API_KEY` secret is set correctly
- Check API key has permissions to send events
- Review workflow run logs for API errors
- Confirm Datadog API endpoint is correct (check `datadoghq.com` vs `datadoghq.eu`)

---

## Integration with Other Systems

### Datadog Dashboards
Use deployment markers to overlay on graphs:
```
Events: deployment:true service:kairo-compass env:production
```

### Datadog Monitors
Correlate alerts with deployments:
- Check if alert triggered after deployment
- Use deployment events in runbooks
- Set up deployment-based muting windows

### APM and Traces
Connect deployment data with traces:
- Filter traces by version tag
- Compare trace performance before/after deployment
- Identify regression introduced by specific commit

---

## Extending the Workflows

### Adding New Test Categories
Edit `datadog-synthetics.yml` to add new test runs:
```yaml
- name: Run Datadog Synthetic tests - New Category
  uses: DataDog/synthetics-ci-github-action@v1.4.0
  with:
    api_key: ${{secrets.DD_API_KEY}}
    app_key: ${{secrets.DD_APP_KEY}}
    test_search_query: 'tag:new-category tag:env:production'
```

### Adding Custom Deployment Metadata
Edit `datadog-deployment-tracking.yml` to include additional metadata:
```yaml
- name: Send custom metrics
  run: |
    curl -X POST "https://api.datadoghq.com/api/v1/series" \
    -H "Content-Type: application/json" \
    -H "DD-API-KEY: ${{ secrets.DD_API_KEY }}" \
    -d '{"series": [{"metric": "custom.metric", "points": [[...]], "tags": [...]}]}'
```

---

## Monitoring Workflow Health

Track workflow execution in Datadog:

### Workflow Metrics
- Create custom metrics for workflow success/failure
- Track workflow duration
- Monitor deployment frequency

### Recommended Monitors
1. **Synthetic Test Failure Rate** - Alert when tests fail consistently
2. **Deployment Frequency** - Track deployment cadence
3. **Workflow Duration** - Detect slow CI/CD pipeline

---

## Additional Resources

- [Datadog Synthetics Documentation](https://docs.datadoghq.com/synthetics/)
- [Datadog CI/CD Integration](https://docs.datadoghq.com/continuous_integration/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Datadog Events API](https://docs.datadoghq.com/api/latest/events/)
- [Datadog Metrics API](https://docs.datadoghq.com/api/latest/metrics/)

---

## Support

For issues or questions:
- **Datadog Integration:** Contact the SRE team or DevOps
- **Workflow Issues:** Check GitHub Actions logs and workflow runs
- **Test Configuration:** Review Datadog Synthetic Tests documentation
