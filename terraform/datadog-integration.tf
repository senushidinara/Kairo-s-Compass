terraform {
  required_version = ">= 1.0"
  
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.30"
    }
  }
}

provider "datadog" {
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
  api_url = var.datadog_site
}

# GCP Integration
resource "datadog_integration_gcp" "main" {
  project_id     = var.gcp_project_id
  client_email   = var.gcp_client_email
  private_key_id = var.gcp_private_key_id
  private_key    = var.gcp_private_key
  host_filters   = "service:kairo-compass"
  
  automute               = true
  cspm_resource_collection_enabled = true
}

# GCP Service Account for Datadog (requires setup in GCP)
resource "datadog_integration_gcp_sts" "main" {
  client_email = var.gcp_client_email
}

# Datadog API Key for application instrumentation
resource "datadog_api_key" "kairo_api" {
  name = "kairo-compass-api-key"
}

# Datadog Application Key for automation
resource "datadog_application_key" "kairo_app" {
  name = "kairo-compass-app-key"
}

# Service Level Objectives (SLOs)
resource "datadog_service_level_objective" "api_availability" {
  name        = "Kairo API Availability"
  type        = "monitor"
  description = "99.9% availability for Kairo's Compass API"
  
  thresholds {
    timeframe = "7d"
    target    = 99.9
    warning   = 99.95
  }
  
  thresholds {
    timeframe = "30d"
    target    = 99.9
    warning   = 99.95
  }
  
  monitor_ids = [
    datadog_monitor.route_calculation_latency.id,
  ]
  
  tags = [
    "service:kairo-api",
    "team:nav-engineering",
    "slo:availability"
  ]
}

resource "datadog_service_level_objective" "route_calculation_performance" {
  name        = "Route Calculation Performance"
  type        = "metric"
  description = "95% of route calculations complete within 3 seconds"
  
  query {
    numerator   = "sum:kairo.route.calculation_time_ms{*}.rollup(sum).fill(zero) < 3000"
    denominator = "sum:kairo.route.calculations.total{*}.rollup(sum).fill(zero)"
  }
  
  thresholds {
    timeframe = "7d"
    target    = 95.0
    warning   = 97.0
  }
  
  thresholds {
    timeframe = "30d"
    target    = 95.0
    warning   = 97.0
  }
  
  tags = [
    "service:kairo-api",
    "team:nav-engineering",
    "slo:performance"
  ]
}

# Notification channels
resource "datadog_integration_slack_channel" "nav_engineering" {
  account_name = var.slack_account_name
  channel_name = "#nav-engineering"
  display {
    message  = true
    notified = true
    snapshot = false
    tags     = true
  }
}

resource "datadog_integration_pagerduty" "main" {
  schedules = [var.pagerduty_schedule_url]
  subdomain = var.pagerduty_subdomain
  api_token = var.pagerduty_api_token
}

# Outputs
output "datadog_api_key_id" {
  description = "Datadog API Key ID"
  value       = datadog_api_key.kairo_api.id
  sensitive   = true
}

output "datadog_app_key_id" {
  description = "Datadog Application Key ID"
  value       = datadog_application_key.kairo_app.id
  sensitive   = true
}

output "gcp_integration_status" {
  description = "GCP Integration Status"
  value       = datadog_integration_gcp.main.project_id
}
