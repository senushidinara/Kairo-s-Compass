terraform {
  required_version = ">= 1.0"
  
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.30"
    }
  }
}

# Route Calculation Latency Monitor
resource "datadog_monitor" "route_calculation_latency" {
  name    = "Route Calculation Latency"
  type    = "metric alert"
  message = <<-EOT
    ## Route Calculation Performance Alert
    
    Route calculation is taking longer than 5 seconds.
    
    **Current Status:**
    - Average latency: {{value}}ms
    - Threshold: 5000ms
    - Service: {{service.name}}
    - Environment: {{env}}
    
    **Impact:**
    - Degraded user experience
    - Potential timeout issues
    - Route optimization delays
    
    **Action Items:**
    1. Check GCP Cloud Run instance performance
    2. Review database query performance
    3. Verify AIS data ingestion pipeline
    4. Check for external API latency
    
    {{#is_alert}}
    @slack-nav-engineering-alerts
    @pagerduty-critical
    {{/is_alert}}
    
    {{#is_warning}}
    @slack-nav-engineering
    {{/is_warning}}
  EOT

  query = "avg(last_5m):avg:kairo.route.calculation_time_ms{*} > 5000"

  monitor_thresholds {
    critical = 5000
    warning  = 3000
  }

  notify_no_data    = true
  no_data_timeframe = 10
  
  require_full_window = false
  notify_audit        = true
  include_tags        = true
  
  priority = 2

  tags = [
    "service:kairo-api",
    "team:nav-engineering",
    "category:performance",
    "impact:high",
    "terraform:true"
  ]
}

# AIS Data Ingestion Gap Monitor
resource "datadog_monitor" "ais_data_ingestion" {
  name    = "AIS Data Ingestion Gap"
  type    = "metric alert"
  message = <<-EOT
    ## AIS Data Ingestion Alert
    
    AIS data ingestion has a gap exceeding 2 minutes.
    
    **Current Status:**
    - Data age: {{value}}s
    - Threshold: 120s
    - Pipeline: {{pipeline.name}}
    - Environment: {{env}}
    
    **Impact:**
    - Stale vessel position data
    - Inaccurate route calculations
    - Degraded real-time tracking
    
    {{#is_alert}}
    @slack-data-engineering-critical
    @pagerduty-critical
    {{/is_alert}}
  EOT

  query = "avg(last_5m):avg:kairo.ais.data_age_seconds{*} > 120"

  monitor_thresholds {
    critical = 120
    warning  = 90
  }

  notify_no_data    = true
  no_data_timeframe = 5
  evaluation_delay  = 60
  
  priority = 1

  tags = [
    "service:kairo-data-pipeline",
    "team:data-engineering",
    "category:data-quality",
    "impact:critical",
    "terraform:true"
  ]
}

# CPU Utilization Monitor
resource "datadog_monitor" "cpu_utilization" {
  name    = "High CPU Utilization"
  type    = "metric alert"
  message = <<-EOT
    ## CPU Utilization Alert
    
    CPU utilization has exceeded 80% for 5 minutes.
    
    **Current Status:**
    - CPU usage: {{value}}%
    - Threshold: 80%
    - Instance: {{host.name}}
    - Service: {{service.name}}
    
    {{#is_alert}}
    @slack-infrastructure-alerts
    @pagerduty
    {{/is_alert}}
  EOT

  query = "avg(last_5m):avg:system.cpu.user{service:kairo-api} > 0.8"

  monitor_thresholds {
    critical = 0.8
    warning  = 0.65
  }

  require_full_window = true
  
  priority = 2

  tags = [
    "service:kairo-api",
    "team:infrastructure",
    "category:resource",
    "resource:cpu",
    "terraform:true"
  ]
}

# Memory Pressure Monitor
resource "datadog_monitor" "memory_pressure" {
  name    = "Memory Pressure"
  type    = "metric alert"
  message = <<-EOT
    ## Memory Pressure Alert
    
    Memory utilization has exceeded 90%.
    
    **Current Status:**
    - Memory usage: {{value}}%
    - Threshold: 90%
    - Instance: {{host.name}}
    
    {{#is_alert}}
    @slack-infrastructure-critical
    @pagerduty-critical
    {{/is_alert}}
  EOT

  query = "avg(last_5m):avg:system.mem.used{service:kairo-api} / avg:system.mem.total{service:kairo-api} > 0.9"

  monitor_thresholds {
    critical = 0.9
    warning  = 0.75
  }

  require_full_window = true
  
  priority = 1

  tags = [
    "service:kairo-api",
    "team:infrastructure",
    "category:resource",
    "resource:memory",
    "terraform:true"
  ]
}

# Database Connection Pool Monitor
resource "datadog_monitor" "db_connection_pool" {
  name    = "Database Connection Pool Saturation"
  type    = "metric alert"
  message = <<-EOT
    ## Database Connection Pool Alert
    
    Database connection pool is at 95% capacity.
    
    **Current Status:**
    - Pool utilization: {{value}}%
    - Threshold: 95%
    - Database: {{database.name}}
    
    {{#is_alert}}
    @slack-database-alerts
    @pagerduty
    {{/is_alert}}
  EOT

  query = "avg(last_5m):avg:kairo.db.connection_pool.used{*} / avg:kairo.db.connection_pool.total{*} > 0.95"

  monitor_thresholds {
    critical = 0.95
    warning  = 0.85
  }

  notify_no_data      = true
  no_data_timeframe   = 10
  require_full_window = false
  
  priority = 2

  tags = [
    "service:kairo-api",
    "team:database",
    "category:resource",
    "resource:database",
    "terraform:true"
  ]
}

# Fuel Savings Deviation Monitor
resource "datadog_monitor" "fuel_savings_deviation" {
  name    = "Fuel Savings Deviation"
  type    = "metric alert"
  message = <<-EOT
    ## Fuel Savings Deviation Alert
    
    Actual fuel savings deviate from predictions by more than 5%.
    
    **Current Status:**
    - Deviation: {{value}}%
    - Threshold: 5%
    
    {{#is_alert}}
    @slack-ml-engineering
    @slack-business-ops
    {{/is_alert}}
  EOT

  query = "avg(last_1h):abs(avg:kairo.fuel_savings.actual{*} - avg:kairo.fuel_savings.predicted{*}) / avg:kairo.fuel_savings.predicted{*} > 0.05"

  monitor_thresholds {
    critical = 0.05
    warning  = 0.03
  }

  notify_no_data      = true
  no_data_timeframe   = 120
  require_full_window = true
  
  priority = 2

  tags = [
    "service:kairo-ml",
    "team:ml-engineering",
    "category:business-metrics",
    "metric:fuel-savings",
    "terraform:true"
  ]
}

# Route Optimization Success Rate Monitor
resource "datadog_monitor" "route_optimization_success" {
  name    = "Route Optimization Success Rate"
  type    = "metric alert"
  message = <<-EOT
    ## Route Optimization Success Rate Alert
    
    Route optimization success rate has fallen below 95%.
    
    **Current Status:**
    - Success rate: {{value}}%
    - Threshold: 95%
    
    {{#is_alert}}
    @slack-nav-engineering
    @slack-customer-success
    {{/is_alert}}
  EOT

  query = "avg(last_1h):avg:kairo.route.optimization_success_rate{*} < 0.95"

  monitor_thresholds {
    critical = 0.95
    warning  = 0.97
  }

  notify_no_data      = true
  no_data_timeframe   = 60
  require_full_window = true
  
  priority = 2

  tags = [
    "service:kairo-api",
    "team:nav-engineering",
    "category:business-metrics",
    "metric:success-rate",
    "terraform:true"
  ]
}

# Port Congestion Prediction Accuracy Monitor
resource "datadog_monitor" "port_congestion_accuracy" {
  name    = "Port Congestion Prediction Accuracy"
  type    = "metric alert"
  message = <<-EOT
    ## Port Congestion Prediction Accuracy Alert
    
    Port congestion prediction accuracy has fallen below 80%.
    
    **Current Status:**
    - Accuracy: {{value}}%
    - Threshold: 80%
    
    {{#is_alert}}
    @slack-ml-engineering
    @slack-operations
    {{/is_alert}}
  EOT

  query = "avg(last_1d):avg:kairo.port.congestion_prediction_accuracy{*} < 0.8"

  monitor_thresholds {
    critical = 0.8
    warning  = 0.85
  }

  notify_no_data      = true
  no_data_timeframe   = 1440
  require_full_window = true
  
  priority = 3

  tags = [
    "service:kairo-ml",
    "team:ml-engineering",
    "category:business-metrics",
    "metric:prediction-accuracy",
    "terraform:true"
  ]
}

# Outputs
output "monitor_ids" {
  description = "Map of monitor names to IDs"
  value = {
    route_calculation_latency    = datadog_monitor.route_calculation_latency.id
    ais_data_ingestion          = datadog_monitor.ais_data_ingestion.id
    cpu_utilization             = datadog_monitor.cpu_utilization.id
    memory_pressure             = datadog_monitor.memory_pressure.id
    db_connection_pool          = datadog_monitor.db_connection_pool.id
    fuel_savings_deviation      = datadog_monitor.fuel_savings_deviation.id
    route_optimization_success  = datadog_monitor.route_optimization_success.id
    port_congestion_accuracy    = datadog_monitor.port_congestion_accuracy.id
  }
}
