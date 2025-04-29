# Deploy Key Setup

### Step 1: Generate SSH Key on Your Server

```bash
ssh-keygen -t rsa -b 4096 -C "github-deploy-key" -f ~/.ssh/github_deploy_key
```

### Step 2: Copy the Public Key to the Server

```bash
cat ~/.ssh/github_deploy_key.pub
```

### Step 3: Add the Public Key to your GitHub Repository

1. Go to your repository settings.
2. Navigate to the "Deploy Keys" section.
3. Click "Add Deploy Key".
4. Add the public key to your repository.

### Step 4: Configure SSH on Your Server
```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_deploy_key
echo "Host github.com
    IdentityFile ~/.ssh/github_deploy_key
    StrictHostKeyChecking no" >> ~/.ssh/config
```

### Step 5: Test the Connection
```bash
ssh -T git@github.com
```

*If successful, you should see:*
```
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```
