# ================================================================
# Environment: Production
# Gunakan file ini sebagai root saat deploy ke production
# Cara: cd terraform/environments/production && terraform init && terraform apply
# ================================================================

module "api_production" {
  source = "../../"

  project_name    = "api-proyek"
  environment     = "production"
  aws_region      = "ap-southeast-1"

  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["ap-southeast-1a", "ap-southeast-1b"]

  db_name           = "api_db"
  db_username       = var.db_username
  db_password       = var.db_password
  db_instance_class = "db.t3.micro"

  container_image = var.container_image
  container_port  = 3000
  task_cpu        = 256
  task_memory     = 512
  desired_count   = 1

  jwt_secret     = var.jwt_secret
  jwt_expires_in = "7d"
}
