#!/bin/bash

# Initialize LocalStack S3 bucket for Strapi
echo "Initializing LocalStack S3 bucket..."

# Create the bucket
awslocal s3 mb s3://strapi-assets

# Set bucket ACL to private
awslocal s3api put-bucket-acl --bucket strapi-assets --acl private

echo "S3 bucket 'strapi-assets' created successfully!"