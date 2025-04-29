# Subdomain Setup

### Steps
1. Login to your domain provider
2. Create a subdomain
3. Create a DNS record

### - Create a subdomain
- Create an A record for the subdomain
- Point it to the server's IP address

Example:
```
If your main domain is example.com and you want to create a subdomain called api

Record Type: A
Host: api
Value: 192.168.1.100  (This is the server's IP address)
```