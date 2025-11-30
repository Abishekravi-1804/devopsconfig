variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "devops-config-generator"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "Ubuntu AMI ID (update based on region)"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS in us-east-1
}

variable "key_name" {
  description = ""
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Change this to your IP for security!
}

variable "aws_access_key" {
  description = "AWS Access Key for Bedrock"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Key for Bedrock"
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
