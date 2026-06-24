# ================================================================
# Root Outputs — informasi penting setelah terraform apply
# ================================================================

output "alb_dns_name" {
  description = "DNS publik Load Balancer — gunakan ini sebagai base URL API"
  value       = module.alb.alb_dns_name
}

output "rds_endpoint" {
  description = "Endpoint koneksi database RDS"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "Nama ECS Cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Nama ECS Service"
  value       = module.ecs.service_name
}

output "ecr_repository_url" {
  description = "URL ECR repository untuk push Docker image"
  value       = module.ecs.ecr_repository_url
}

output "vpc_id" {
  description = "ID VPC yang dibuat"
  value       = module.vpc.vpc_id
}
