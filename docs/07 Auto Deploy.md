# Auto Deploy Script

### Step 1: Add Action Secrets

**Note**: Add the following secrets to the repository:

- `EC2_HOST` - The IP address of the server
- `EC2_USER_NAME` - The username to connect to the server
- `EC2_SSH_KEY` - The SSH key to connect to the server

### Step 2: Create a github action workflow file

1. Create a new file in the `.github/workflows` directory called `deploy.yaml`.
2. Add the following code to the file:

```yaml
name: Deploy Application

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Connect to Server via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER_NAME }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            eval "$(ssh-agent -s)"
            ssh-add ~/.ssh/github_deploy_key

            # Ensure Git uses SSH instead of HTTPS
            git config --global user.name "github-actions"
            git config --global user.email "github-actions@github.com"
            git config --global url."git@github.com:".insteadOf "https://github.com/"

            # Navigate to the project folder
            cd /path/to/your/project

            # Install dependencies
            npm install

            # Pull the latest changes
            git pull origin main

            # Restart the server
            pm2 restart all
```
