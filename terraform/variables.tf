# ================================================================
# Root Variables
# ================================================================

# ── General ──────────────────────────────────────────────────────
variable "project_name" {
  description = "Nama proyek, digunakan sebagai prefix semua resource"
  type        = string
  default     = "api-proyek"
}

variable "environment" {
  description = "Nama environment: production, staging, development"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment harus: production, staging, atau development"
  }
}

variable "aws_region" {
  description = "AWS region tempat resource akan dibuat"
  type        = string
  default     = "ap-southeast-1" # Singapore — terdekat dari Indonesia
}

# ── Networking ────────────────────────────────────────────────────
variable "vpc_cidr" {
  description = "CIDR block untuk VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Daftar availability zone yang digunakan"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

# ── Database ──────────────────────────────────────────────────────
variable "db_name" {
  description = "Nama database PostgreSQL"
  type        = string
  default     = "api_db"
}

variable "db_username" {
  description = "Username database"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Password database — gunakan terraform.tfvars atau env var, JANGAN hardcode"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Tipe instance RDS"
  type        = string
  default     = "db.t3.micro"
}

# ── Container / ECS ───────────────────────────────────────────────
variable "container_image" {
  description = "Docker image URI dari ECR (contoh: 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/api-proyek:latest)"
  type        = string
}

variable "container_port" {
  description = "Port yang di-expose oleh container"
  type        = number
  default     = 3000
}

variable "task_cpu" {
  description = "CPU units untuk ECS task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory dalam MB untuk ECS task"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Jumlah ECS task yang berjalan"
  type        = number
  default     = 1
}

# ── App Secrets ───────────────────────────────────────────────────
variable "jwt_secret" {
  description = "JWT secret key — simpan di tfvars atau AWS Secrets Manager"
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "Masa berlaku JWT token"
  type        = string
  default     = "7d"
}
