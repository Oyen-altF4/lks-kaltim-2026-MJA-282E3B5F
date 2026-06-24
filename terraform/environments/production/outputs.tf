output "api_url"     { value = "http://${module.api_production.alb_dns_name}" }
output "ecr_url"     { value = module.api_production.ecr_repository_url }
output "ecs_cluster" { value = module.api_production.ecs_cluster_name }
