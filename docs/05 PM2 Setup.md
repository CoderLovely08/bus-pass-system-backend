# PM2 Setup for Node.js Applications

### Step 1: Install PM2

- Install PM2 globally:
```bash
sudo npm install -g pm2
```

### Step 2: Start Your Application with PM2

- Start your application using PM2:
```bash
pm2 start app.js
```


### Step 3: Save the PM2 Configuration

- Save the PM2 configuration:
```bash
pm2 save
```

*Note: This will create a PM2 configuration file in the root directory of your project.*


### Step 4: Monitor Your Application

- Check the status of your application:
```bash
pm2 status
```

- Restart your application:
```bash
pm2 restart app.js
```


### Step 5: Check Logs

- Check the logs of your application:
```bash
pm2 logs app.js
```

### Step 6: Autostart on Server Restart

- Create a systemd service file:
```bash
sudo pm2 startup
```

This returns a command that you need to run to enable the startup script.

```bash
sudo pm2 save
```