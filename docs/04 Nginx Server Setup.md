# Server Setup for Node.js Applications

### Step 1: Install Nginx
- Run the following commands to install Nginx on your server:
```bash
sudo apt update
sudo apt install nginx -y
```

- Once installed, start and enable Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

- Verify Nginx is running:
```bash
sudo systemctl status nginx
```

*Note: Visit the server's IP address in your browser to ensure Nginx is working.*

### Step 2: Configure Nginx

- Create a new configuration file for your domain:
```bash
sudo nano /etc/nginx/sites-available/domain or subdomain.example.com
```

- Add the following configuration:
```bash
server {
    listen 80;
    server_name subdomain.example.com;

    location / {
        proxy_pass http://localhost:4000; # Change 4000 to your Node.js app port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```

- Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/domain or subdomain.example.com /etc/nginx/sites-enabled/
```

- Test the configuration:
```bash
sudo nginx -t
```

- Restart Nginx:
```bash
sudo systemctl restart nginx
```


### Step 3: Configure SSL

- Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

- Obtain and install the SSL certificate:
```bash
sudo certbot --nginx -d subdomain.example.com
```

