variable "db_username"      { type = string; sensitive = true }
variable "db_password"      { type = string; sensitive = true }
variable "container_image"  { type = string }
variable "jwt_secret"       { type = string; sensitive = true }
