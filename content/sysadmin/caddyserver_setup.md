---
author: Taha
title: "Caddyserver Setup"
description: "Guide to Install Caddy Server on Server"
draft: false
date: 2024-11-06T13:00:00+03:00
tags: ["caddy", "webserver", "setup", "guide"]
---

## Introduction

- Caddy webserver is a modern, open-source web server with automatic HTTPS written
in Go. It is designed to be easy to use and configure, making it an excellent
choice for hosting websites and web applications. In this guide, we will show you
how to install and configure Caddy on your server. You can download the latest
version of Caddy from the [official GitHub page](https://github.com/caddyserver/caddy/releases).

<br>

## Step 1: Install Required Packages

- Before installing Caddy, you need to install the required packages on your server.
You can install the packages with the following commands:

  - For Debian/Ubuntu:

    ```bash
    sudo apt update
    sudo apt install -y curl wget tar jq
    ```

  - For CentOS/RHEL:

    ```bash
    sudo yum update
    sudo yum install -y curl wget tar jq
    ```

  - For Arch Linux:

    ```bash
    sudo pacman -Syyu
    sudo pacman -S curl wget tar jq
    ```

<br>

## Step 2: Download Caddy Tarball

- I prefer to download Caddy as a binary because it supports adding custom Caddy
extensions. If you install the latest version. You can download the latest version
of Caddy with the following command.

  - For x86_64:

    ```bash
    CADDY_LATEST_VERSION="$(curl -fsSL https://api.github.com/repos/caddyserver/caddy/tags | jq -r '.[].name' | sort -Vr | grep -vE 'beta|prerelease' | head -n 1)"
    cd $(mktemp -d)
    wget -q "https://github.com/caddyserver/caddy/releases/download/${CADDY_LATEST_VERSION}/caddy_${CADDY_LATEST_VERSION//v/}_linux_amd64.tar.gz"
    ```

  - For ARM:

    ```bash
    CADDY_LATEST_VERSION="$(curl -fsSL https://api.github.com/repos/caddyserver/caddy/tags | jq -r '.[].name' | sort -Vr | grep -vE 'beta|prerelease' | head -n 1)"
    cd $(mktemp -d)
    wget -q "https://github.com/caddyserver/caddy/releases/download/${CADDY_LATEST_VERSION}/caddy_${CADDY_LATEST_VERSION//v/}_linux_arm64.tar.gz"
    ```

  - For x86_64 (if you using fish shell)

    ```bash
    set CADDY_LATEST_VERSION (curl -fsSL https://api.github.com/repos/caddyserver/caddy/tags | jq -r '.[].name' | sort -Vr | grep -vE 'beta|prerelease' | head -n 1)
    cd (mktemp -d)
    wget -q "https://github.com/caddyserver/caddy/releases/download/$CADDY_LATEST_VERSION/caddy_$(string replace -a v '' $CADDY_LATEST_VERSION)_linux_amd64.tar.gz"
    ```

  - For ARM (if you using fish shell)

    ```bash
    set CADDY_LATEST_VERSION (curl -fsSL https://api.github.com/repos/caddyserver/caddy/tags | jq -r '.[].name' | sort -Vr | grep -vE 'beta|prerelease' | head -n 1)
    cd (mktemp -d)
    wget -q "https://github.com/caddyserver/caddy/releases/download/$CADDY_LATEST_VERSION/caddy_$(string replace -a v '' $CADDY_LATEST_VERSION)_linux_arm64.tar.gz"
    ```

    - ![photo](/assets/Pasted%20image%2020241106141252.png)

<br>

## Step 3: Extract Caddy Tarball

- In this folder, extract the downloaded tarball with the following command:

  ```bash
  tar -xzf caddy_*.tar.gz
  ```

  - ![photo](/assets/Pasted%20image%2020241106141445.png)

<br>

## Step 4: Move Caddy Binary to /usr/local/bin

- After extracting the tarball, move the Caddy binary to the `/usr/local/bin`
directory and make it executable with the following commands:

  ```bash
  sudo mv caddy /usr/local/bin
  sudo chmod +x /usr/local/bin/caddy
  ```

- Note: You must restore file context for the caddy binary with the following
command if you are using SELinux:

  ```bash
  sudo restorecon -vR /usr/local/bin/caddy
  ```

- You can check the caddy version with the following command:

  ```bash
  caddy version
  ```

  - ![photo](/assets/Pasted%20image%2020241106150428.png)

<br>

## Step 5: Download Caddy Service Files

- To run Caddy as a service, you need to create a systemd service file. You can
download the service file with the following command:

  ```bash
  sudo wget -q https://raw.githubusercontent.com/caddyserver/dist/master/init/caddy.service -O /etc/systemd/system/caddy.service
  sudo wget -q https://raw.githubusercontent.com/caddyserver/dist/master/init/caddy-api.service -O /etc/systemd/system/caddy-api.service
  ```

  - ![photo](/assets/Pasted%20image%2020241106142228.png)

<br>

## Step 6: Change Default Binary Path in Caddy Service Files

- We have installed the Caddy binary into the `/usr/local/bin` directory. You need
to change the path in the Caddy service files to point to the correct location.
Open the service files with the following command:

  ```bash
  sudo sed -i 's|/usr/bin/caddy|/usr/local/bin/caddy|g' /etc/systemd/system/caddy.service
  sudo sed -i 's|/usr/bin/caddy|/usr/local/bin/caddy|g' /etc/systemd/system/caddy-api.service
  ```

- To verify the changes, you can use the following command:

  ```bash
  cat /etc/systemd/system/caddy* | grep ^Exec
  ```

  - ![photo](/assets/Pasted%20image%2020241106142553.png)

<br>

## Step 7: Create Caddy User, Group and Log Files Directory

- To run Caddy securely, you need to create a special user and group for Caddy.
You can create a Caddy user and group with the following commands:

  ```bash
  sudo groupadd --system caddy
  sudo useradd --system --gid caddy --create-home --home-dir /var/lib/caddy --shell /usr/sbin/nologin --comment "Caddy Web Server" caddy
  ```

- If your application uses the `www-data` user, you can add the caddy user to the
`www-data` group and vice versa with the following commands:

  ```bash
  sudo usermod -aG www-data caddy
  sudo usermod -aG caddy www-data
  ```

- Create a log directory for Caddy with the following command:

  ```bash
  sudo mkdir -p /var/log/caddy
  sudo chown -R caddy:caddy /var/log/caddy
  ```

- To verify the changes, you can use the following command:

  ```bash
  ls -l /var/log/caddy
  cat /etc/passwd | grep caddy
  ```

  - ![photo](/assets/Pasted%20image%2020241106142758.png)

<br>

## Step 8: Add Cloudflare DNS module to Caddy

- To use the Cloudflare DNS module with Caddy, you need to download the module
with the following command:
- Note: If you are not using Cloudflare, you can skip this step.

  ```bash
  sudo caddy add-package github.com/caddy-dns/cloudflare
  ```

  - ![photo](/assets/Pasted%20image%2020241106190446.png)

<br>

## Step 9: Create a Caddy Configuration File

- Use the following command to create a Caddy configuration file in the `/etc/caddy`
directory:

  ```bash
  sudo mkdir -p /etc/caddy
  sudo vim /etc/caddy/Caddyfile
  ```

- I prefer to use the following configuration file for Caddy:

  ```Caddyfile
  {
  #   http_port 8080    # HTTP port (default is 80)
  #   https_port 8443   # HTTPS port (default is 443)
  #   default_bind <IP> # Default IP to bind to (default is all interfaces)
  }

  # for logging
  (logger) {
      log {
          output file /var/log/caddy/{args[0]}.access.log
          format json {
              time_format wall
              time_local
          }
      }
    }

  # for php websites (requires php-fpm)
  (php-fpm) {
      php_fastcgi unix//run/php-fpm/www.sock {
          index index.php
          header_up remote_addr {remote}
          header_up remote_addr "^([^:]+):.*$" "$1"
          header_up X-Forwarded-For {remote}
          header_up X-Forwarded-For "^([^:]+):.*$" "$1"
          try_files {path} {path}/index.php =404
      }
      handle_errors {
          php_fastcgi unix//run/php-fpm/www.sock {
              try_files /customerror.php
              replace_status {err.status_code}
          }
      }
  }

  # for certificates (cloudflare example)
  (tls-cloudflare) {
      tls {
          dns cloudflare {file.{$CREDENTIALS_DIRECTORY}/cfapitoken}
          resolvers 1.1.1.1
      }
  }

  # for directly connections like http://serverip:80
  :80 :443 {
      import logger server-main
      respond "Hello, World!"
  }
  ```

- If you have configured a domain and DNS settings, you can append the following
configuration to the Caddyfile:

  ```Caddyfile
  yourdomain.com {
      import logger yourdomain
      import tls-cloudflare            # if you are not using Cloudflare, you can remove this line
      root * /var/www/yourdomain.com
      file_server
  }
  ```

- Note: If you are using Cloudflare, you will need to create a Cloudflare API token
and store it with [systemd creds](https://systemd.io/CREDENTIALS). You can create
a Cloudflare API token by following their [official documentation](https://developers.cloudflare.com/api/tokens/create).
After creating the API token, you can save it using the following command:

  ```bash
  systemd-ask-password -n | sudo systemd-creds encrypt --name=cfapitoken -p - -
  sudo systemctl edit caddy.service
  sudo systemctl edit caddy-api.service
  ```

  - ![photo](/assets/Pasted%20image%2020241106145046.png)

  - ![photo](/assets/Pasted%20image%2020241106145159.png)

- Save and exit the files by pressing `Esc` and typing `:wq`.

<br>

## Step 10: Enable and Start Caddy Service

- After creating the Caddy service files, you must enable and start the Caddy
service using the following commands:

  ```bash
  sudo systemctl enable --now caddy
  ```

- You can check the status of the Caddy service with the following command:

  ```bash
  sudo systemctl status caddy
  ```

- If you want to testing the Caddy server, you can open your browser and navigate
to `http://<server-ip>`. You can also use the following command:

  ```bash
  curl -I http://localhost
  ```

- You should see the following output:

  ```curl
  HTTP/1.1 200 OK
  Server: Caddy
  Date: Sun, 06 Nov 2024 13:00:00 GMT
  Content-Length: 13
  Content-Type: text/plain; charset=utf-8
  ```

  - ![photo](/assets/Pasted%20image%2020241106143607.png)

---

## Conclusion

- Congratulations! You have successfully installed and configured Caddy on your
server. You are now ready to host websites and web applications with Caddy.
