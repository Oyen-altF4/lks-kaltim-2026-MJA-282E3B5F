# ================================================================
# Root Terraform — Orchestrates all modules
# Target: AWS (ECS Fargate + RDS PostgreSQL + ALB)
# ================================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend S3 untuk menyimpan state (aktifkan setelah bucket dibuat)
  # backend "s3" {
  #   bucket         = "nama-bucket-terraform-state"
  #   key            = "api-proyek/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ── Module: VPC & Networking ──────────────────────────────────────
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

# ── Module: RDS PostgreSQL ────────────────────────────────────────
module "rds" {
  source = "./modules/rds"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  app_security_group  = module.ecs.app_security_group_id
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  db_instance_class   = var.db_instance_class
}

# ── Module: Application Load Balancer ────────────────────────────
module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  container_port    = var.container_port
}

# ── Module: ECS Fargate ───────────────────────────────────────────
module "ecs" {
  source = "./modules/ecs"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  alb_target_group   = module.alb.target_group_arn
  alb_security_group = module.alb.security_group_id
  container_port     = var.container_port
  container_image    = var.container_image
  task_cpu           = var.task_cpu
  task_memory        = var.task_memory
  desired_count      = var.desired_count

  env_vars = {
    PORT           = tostring(var.container_port)
    DB_HOST        = module.rds.db_endpoint
    DB_PORT        = "5432"
    DB_NAME        = var.db_name
    DB_USER        = var.db_username
    DB_PASS        = var.db_password
    JWT_SECRET     = var.jwt_secret
    JWT_EXPIRES_IN = var.jwt_expires_in
  }
}
