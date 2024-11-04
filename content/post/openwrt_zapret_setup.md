---
author: Taha
title: Bypassing Censorship with OpenWRT and Zapret
description: Using zapret to bypass censorship with OpenWRT
draft: false
tags:
  - openwrt
  - zapret
  - censorship
  - bypass
  - dpi
  - guide
date: 2024-11-04T19:06:00+03:00
---

<!--more-->

- Censorship has become a major issue affecting Internet freedom worldwide in today's digital age. Various tools and techniques have been developed to counteract these restrictions and allow users to access blocked content. One of these tools is Zapret. It is an independent DPI bypass tool written to combat the censorship imposed by Roskomnadzor in Russia.

# How to Install Zapret

- This guide will show you how to install and configure Zapret on your OpenWRT router to bypass censorship and access blocked content. If you are not using OpenWRT, you can follow the [this](https://notes.xeome.dev/notes/Using-zapret-to-bypass-censorship) guide to install Zapret on your computer.

# Step 1: Install Required Packages

- Open to your OpenWRT router's web interface and navigate to the "System" tab. Click on "Software" and search for the following packages:
  - `git`
  - `git-http`
  - `ncat`
  - `vim`

# Step 2: Connect to Your Router via SSH

- Open your terminal and connect to your OpenWRT router via SSH using the following command:
  ```bash
  ssh root@<router-ip>
  ```

# Step 3: Clone the Zapret Repository

- I recommended to clone the Zapret repository with the `--depth=1` flag to reduce the download size. First, navigate to the `/opt` directory and clone the repository using the following commands:

  ```bash
  cd /opt
  git clone --depth=1 https://github.com/bol-van/zapret.git
  cd zapret
  ```

- ![](/assets/Pasted%20image%2020241104204129.png)

# Step 4: Change DNS Server Settings

- Some ISPs use DNS poisoning in combination with dpi bypass to block access to certain websites. To bypass this, you need to change your DNS server settings to a healthy alternative. To change your DNS server settings, run the following command

  ```bash
  vim /etc/resolv.conf
  ```

- Press `i` to enter insert mode and convert all lines to comment lines. Add the following line to the last line.

  ```bash
  nameserver 1.1.1.1
  ```

- This is what the file should look like when you're done.

  - ![](/assets/Pasted%20image%2020241104204207.png)

- Save and exit the file by pressing `Esc` and typing `:wq`.

# Step 5: Run the install_prereq.sh Script to Install Prerequisites

- After cloning the repository and changing the DNS server settings, you need to install the prerequisites for Zapret. Run the following command to install the prerequisites:

  ```bash
    ./install_prereq.sh
  ```

- OpenWRT uses nftables by default. Select nftables in firewall questions.
- ![](/assets/Pasted%20image%2020241104204411.png)

# Step 6: Run the install_bin.sh Script to Install the Required Compatible Binaries

- Run the following command to install the required compatible binaries:

  ```bash
    ./install_bin.sh
  ```

- ![](/assets/Pasted%20image%2020241104204218.png)

# Step 7: Run the blockcheck.sh script to Find the Appropriate Zapret Parameters for your ISP

- Run the following command to get the best parameters for your ISP:

  ```bash
    ./blockcheck.sh
  ```

- The blockcheck.sh script asks for the address of a blocked site. Discord is blocked in my country, so I enter the address of a blocked subdomain. Enter the address and leave the other questions with their default answers.

- ![](/assets/Pasted%20image%2020241104204234.png)

- The script will give us the following parameters when the scan is finished. I have to censor these. Note the last line parameter.
- ![](/assets/Pasted%20image%2020241104210017.png)

# Step 7: Run the install_easy.sh Script to Install the Zapret Services

- Run the following command to install the Zapret services:

  ```bash
    ./install_easy.sh
  ```

- OpenWRT uses nftables, so we choose nftables here
- ![](/assets/Pasted%20image%2020241104204300.png)
- We activate nfqws
- ![](/assets/Pasted%20image%2020241104204840.png)
- Press Y to change the default nfqws parameters.
- ![](/assets/Pasted%20image%2020241104204311.png)
- Delete the selected fields and paste the parameter from step 6.
- ![](/assets/Pasted%20image%2020241104204722.png)
- If you set it right, you should see this.
- ![](/assets/Pasted%20image%2020241104204317.png)

# Step 8: Well Done! You can Test by Accessing the Blocked Websites

---

# References

- [Zapret GitHub Repository](https://github.com/bol-van/zapret)
- [Xeome's Notes on Using Zapret to Bypass Censorship](https://notes.xeome.dev/notes/Using-zapret-to-bypass-censorship)