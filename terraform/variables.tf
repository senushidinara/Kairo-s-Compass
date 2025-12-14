# Datadog Configuration Variables
variable "datadog_api_key" {
  description = "Datadog API Key"
  type        = string
  sensitive   = true
}

variable "datadog_app_key" {
  description = "Datadog Application Key"
  type        = string
  sensitive   = true
}

variable "datadog_site" {
  description = "Datadog site (e.g., datadoghq.com, datadoghq.eu)"
  type        = string
  default     = "https://api.datadoghq.com"
}

# GCP Configuration Variables
variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "gcp_client_email" {
  description = "GCP Service Account Email for Datadog integration"
  type        = string
}

variable "gcp_private_key_id" {
  description = "GCP Service Account Private Key ID"
  type        = string
  sensitive   = true
}

variable "gcp_private_key" {
  description = "GCP Service Account Private Key"
  type        = string
  sensitive   = true
}

# Slack Configuration Variables
variable "slack_account_name" {
  description = "Slack workspace account name"
  type        = string
  default     = ""
}

# PagerDuty Configuration Variables
variable "pagerduty_subdomain" {
  description = "PagerDuty subdomain"
  type        = string
  default     = ""
}

variable "pagerduty_api_token" {
  description = "PagerDuty API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "pagerduty_schedule_url" {
  description = "PagerDuty schedule URL"
  type        = string
  default     = ""
}

# Environment Variables
variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

# Service Variables
variable "service_name" {
  description = "Service name"
  type        = string
  default     = "kairo-compass"
}

variable "team_name" {
  description = "Team responsible for the service"
  type        = string
  default     = "nav-engineering"
}

# Tags
variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    terraform   = "true"
    project     = "kairo-compass"
    managed_by  = "terraform"
  }
}
