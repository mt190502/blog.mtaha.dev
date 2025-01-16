+++
authors = ["Taha"]
title = "Fedora Bootstrap Guide"
description = "Installing Fedora With Systemdboot Without Using Anaconda Installer"
draft = false
date = 2024-12-21T12:00:00+03:00
[taxonomies]
tags = ["setup", "fedora", "linux", "bootstrap", "guide"]
[extra]
toc = true
toc_ordered = true
disclaimer = """
In this article I have chosen ubuntu for the live boot and fedora for the target.
You can use other distributions for live boot and target installation. If you use
a different distribution for the target, you need to check the bootstrap commands
for that distribution. For example: [debootstrap](https://pkgs.org/search/?q=debootstrap&on=files),
[pacstrap](https://pkgs.org/search/?q=pacstrap&on=files) and [dnf](https://pkgs.org/search/?q=dnf&on=files).
The parameters may differ depending on the tool you are using
"""
+++

- In linux distributions, the bootstrap process is used to install the base of a
distribution without a GUI installer (e.g. Calamares, Anaconda, etc.) using package
managers or other tools. This method can be done in many distributions. For example:
  - `pacstrap` for Arch Linux
  - `debootstrap` for Ubuntu/Debian
  - `dnf` for fedora
- So why choose this method?
- In some cases I have chosen this method for several reasons. For example:
  - Old hardware
  - Some hardware drivers not included in the distribution
  - Gui installer not working due to file system errors from an old installation
  and etc.
- Today in this article I will try to explain in detail the steps I take when using
this method.

<br>

## Step 1: Update Repositories in Live Environment

- The first step is to update the repositories in the live environment.

  ```bash
  sudo apt update
  ```

  - ![photo](/assets/Pasted%20image%2020241220102804.png)

<br>

## Step 2: Install DNF Package Manager in Live Environment

- In this article, we will install the dnf package manager in the live environment,
since we chose fedora for the target installation.

  ```bash
  sudo apt install dnf
  ```

  - ![photo](/assets/Pasted%20image%2020241220102859.png)

<br>

## Step 3: Prepare the Disk and Partitions

- The next step is to prepare the disk and partitions. First, you need to check the
disk you want to install the system on:

  ```bash
  lsblk
  ```

  - ![photo](/assets/Pasted%20image%2020241220103151.png)

- In my case, I will use `/dev/vda` disk. You can use `cfdisk` to create partitions
on the disk. You can do this by running the following command:
  
    ```bash
    cfdisk /dev/vda
    ```
  
- Select `gpt`
  - ![photo](/assets/Pasted%20image%2020241220103852.png)

- `cfdisk` will list the partitions on the disk. You can create a new
efi partition by selecting `New` and then set the size to `512M` and type to `EFI
System`.

  - ![photo](/assets/Pasted%20image%2020241220103904.png)
  - ![photo](/assets/Pasted%20image%2020241220103916.png)
  - ![photo](/assets/Pasted%20image%2020241220103928.png)
  - ![photo](/assets/Pasted%20image%2020241220103939.png)

- Create a new root partition by selecting `New` and pressing `Enter` to use
the remaining space.

  - ![photo](/assets/Pasted%20image%2020241220103950.png)
  - ![photo](/assets/Pasted%20image%2020241220104000.png)

- Finally, select `Write` and type `yes` to write the changes to the disk.
  
  - ![photo](/assets/Pasted%20image%2020241220104011.png)
  - ![photo](/assets/Pasted%20image%2020241220104019.png)

- After creating the partitions, check the partitions by running the following command:

  ```bash
  lsblk
  ```

  - ![photo](/assets/Pasted%20image%2020241220104041.png)

<br>

## Step 4: Format the Partitions

- The next step is to format the partitions:

  ```bash
  sudo mkfs.vfat -F32 /dev/vda1               # EFI Partition
  sudo mkfs.btrfs /dev/vda2                   # Root Partition
  ```

  - ![photo](/assets/Pasted%20image%2020241220104105.png)
  - ![photo](/assets/Pasted%20image%2020241220104127.png)

- Then check filesystems:

  ```bash
  lsblk -f
  ```

  - ![photo](/assets/Pasted%20image%2020241220104428.png)

<br>

## Step 5: Mount the BTRFS Partition and Create Subvolumes

- The next step is to mount the btrfs partition and create subvolumes. You can
do this by running the following commands:

  ```bash
  #~ mount the btrfs partition
  sudo mount /dev/vda2 /mnt

  #~ check the mount
  mount | grep '/mnt'
  ```

  - ![photo](/assets/Pasted%20image%2020241220104503.png)

- Then create subvolumes:

  ```bash
  #~ change directory and create subvolumes
  cd /mnt
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@ 
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@snapshots
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@without
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@without/opt
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@without/root
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@without/srv
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@without/usr
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@without/usr/local
  sudo btrfs su cr fedora-$(date +%Y-%m-%d)/@without/var
  ```

  - ![photo](/assets/Pasted%20image%2020241220104750.png)

- After creating the subvolumes, unmount the btrfs partition and remount with
this flags:

  ```bash
  #~ change directory 
  cd /

  #~ unmount the btrfs partition
  sudo umount /mnt

  #~ mount the btrfs partition with subvolumes
  sudo mount -o rw,noatime,compress=zstd:1,space_cache=v2,subvol=fedora-$(date +%Y-%m-%d)/@ /dev/vda2 /mnt
  ```

  - ![photo](/assets/Pasted%20image%2020241220104908.png)

- Finally, mount the other subvolumes:

  ```bash
  #~ create folders for the another subvolumes
  sudo mkdir -p /mnt/{boot/efi,opt,root,srv,usr/local,var}

  #~ mount the btrfs partition with subvolumes
  sudo mount -o rw,noatime,compress=zstd:1,space_cache=v2,subvol=fedora-$(date +%Y-%m-%d)/@without/opt /dev/vda2 /mnt/opt
  sudo mount -o rw,noatime,compress=zstd:1,space_cache=v2,subvol=fedora-$(date +%Y-%m-%d)/@without/root /dev/vda2 /mnt/root
  sudo mount -o rw,noatime,compress=zstd:1,space_cache=v2,subvol=fedora-$(date +%Y-%m-%d)/@without/srv /dev/vda2 /mnt/srv
  sudo mount -o rw,noatime,compress=zstd:1,space_cache=v2,subvol=fedora-$(date +%Y-%m-%d)/@without/usr/local /dev/vda2 /mnt/usr/local
  sudo mount -o rw,noatime,compress=zstd:1,space_cache=v2,subvol=fedora-$(date +%Y-%m-%d)/@without/var /dev/vda2 /mnt/var
  sudo mount /dev/vda1 /mnt/boot/efi
  ```

  - ![photo](/assets/Pasted%20image%2020241220105119.png)

<br>

## Step 6: Generate Fstab File for New Installation

- The next step is to generate the fstab file for the new installation. The fstab
file is a system configuration file that contains information about disk partitions
and their mount points. It is used by the system to mount the partitions automatically
at boot time. You can do this by running the following commands:

  ```bash
  sudo apt install -y arch-install-scripts
  ```

  - ![photo](/assets/Pasted%20image%2020241220105140.png)

- Then create etc folder and generate fstab file:

  ```bash
  #~ create etc folder
  sudo mkdir -p /mnt/etc

  #~ generate fstab file
  genfstab -U /mnt | sudo tee /mnt/etc/fstab
  ```

  - ![photo](/assets/Pasted%20image%2020241220105312.png)

<br>

## Step 7: Bootstrap Fedora Installation

- The next step is to bootstrap the fedora installation by running the following
commands:

  ```bash
  #~ create /etc/yum.repos.d folder
  sudo mkdir -p /etc/yum.repos.d

  #~ create fedora.repo file
  sudo nano /etc/yum.repos.d/fedora.repo
  ```

  - ![photo](/assets/Pasted%20image%2020241220105721.png)

- Then add the following lines to the `fedora.repo` file:

  ```bash
  [fedora]
  name=Fedora $releasever - $basearch
  #baseurl=http://download.example/pub/fedora/linux/releases/$releasever/Everything/$basearch/os/
  metalink=https://mirrors.fedoraproject.org/metalink?repo=fedora-$releasever&arch=$basearch
  enabled=1
  countme=1
  metadata_expire=7d
  repo_gpgcheck=0
  type=rpm
  gpgcheck=0
  #gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-$releasever-$basearch
  skip_if_unavailable=False
  ```

  - ![photo](/assets/Pasted%20image%2020241220110023.png)

- Then bootstrap the fedora installation:

  ```bash
  sudo dnf --installroot=/mnt --releasever=41 --forcearch=x86_64 --setopt=fastestmirror=True group install "Core"
  ```

  - ![photo](/assets/Pasted%20image%2020241220110757.png)
  - ![photo](/assets/Pasted%20image%2020241220110819.png)
  - ![photo](/assets/Pasted%20image%2020241220110945.png)

<br>

## Step 8: Chroot into the New Installation

- The next step is to chroot into the new installation. The `chroot` command
changes the apparent root directory for the current running process and its
children. This allows you to work within the new installation as if it were the
root filesystem. First, you need to mount the filesystems:

  ```bash
  #~ change directory
  cd /mnt

  #~ remove etc/resolv.conf symlink for bind mount
  sudo rm -f etc/resolv.conf

  #~ touch resolv.conf file
  sudo touch etc/resolv.conf

  #~ mount the filesystems
  for f in dev etc/resolv.conf proc sys sys/firmware/efi/efivars; do
    sudo mount --bind /$f $f
  done
  ```

  - ![photo](/assets/Pasted%20image%2020241220111128.png)

- Then chroot into the new installation:

  ```bash
  #~ chroot into the new installation
  sudo chroot /mnt

  #~ update the system
  dnf --releasever=41 --setopt=fastermirror=True --refresh update
  ```

  - ![photo](/assets/Pasted%20image%2020241220111346.png)

<br>

## Step 9: Install 'Standard' group

- The next step is to install the `Standard` group, which includes essential packages
for a basic Fedora system. You can do this by running the following command:

  ```bash
  dnf --releasever=41 --setopt=fastermirror=True group install core standard
  ```

  - ![photo](/assets/Pasted%20image%2020241220112003.png)
  - ![photo](/assets/Pasted%20image%2020241220112050.png)
  - ![photo](/assets/Pasted%20image%2020241220112730.png)

- Then check fedora version from rpm command:
  
    ```bash
    rpm -e %fedora
    ```
  
  - ![photo](/assets/Pasted%20image%2020241220112744.png)

<br>

## Step 10: Change dnf Configuration

- The next step is to change the dnf configuration. You can do this by running
the following commands:

  ```bash
  vi /etc/dnf/dnf.conf
  ```

- Then append the following lines to the `dnf.conf` file:

  ```bash
  gpgcheck=True
  installonly_limit=3                #~ keep 3 versions of the kernel packages
  clean_requirements_on_remove=True
  best=True
  skip_if_unavailable=True
  fastestmirror=True                 #~ find the fastest mirror
  max_parallel_downloads=10          #~ download 10 packages at the same time 
  ```

  - ![photo](/assets/Pasted%20image%2020241220112835.png)

<br>

## Step 11: Set the Zones, Locale and Etc

- The next step is to set the zones, locale and etc. You can do this by running
the following commands:

  ```bash
  #~ install the locale packages
  dnf install -y langpacks-{en,tr}* glibc-all-langpacks
  ```

  - ![photo](/assets/Pasted%20image%2020241220173958.png)

- Then set the timezone, locale and vconsole:

  ```bash
  #~ set the timezone (replace Europe/Istanbul with your timezone)
  ln -sf /usr/share/zoneinfo/Europe/Istanbul /etc/localtime

  #~ set the locale (replace en_US.UTF-8 with your locale)
  echo 'LANG=en_US.UTF-8' > /etc/locale.conf
  
  #~ set the vconsole (replace us with your keymap)
  echo 'KEYMAP=us' > /etc/vconsole.conf
  echo 'FONT=eurlatgr' >> /etc/vconsole.conf

  #~ set hostname
  echo 'yourhostname' > /etc/hostname
  ```

  - ![photo](/assets/Pasted%20image%2020241220174305.png)

<br>

## Step 12: Replace Bootloader to Systemd-boot from Grub

- In this step, we will use systemd-boot as the boot loader. systemd-boot is a
simple UEFI boot manager that provides an easy and efficient way to manage boot
entries. You can do this by running the following commands:

  ```bash
  #~ remove grub protection
  rm -f /etc/dnf/protected.d/grub*

  #~ remove grub packages
  dnf remove grub*

  #~ install systemd-boot
  dnf install -y systemd-boot-unsigned sdubby
  ```

  - ![photo](/assets/Pasted%20image%2020241220113529.png)
  - ![photo](/assets/Pasted%20image%2020241220113559.png)

- Then install systemd-boot to the disk:

  ```bash
  bootctl install
  ```

  - ![photo](/assets/Pasted%20image%2020241220113626.png)

<br>

## Step 13: Install Kernel Packages

- The next step is to install the kernel packages. You can do this by running the
following commands:

  ```bash
  dnf install -y kernel{,-core,-devel,-modules,-modules-extra,-headers}
  ```

  - ![photo](/assets/Pasted%20image%2020241220113722.png)
  - ![photo](/assets/Pasted%20image%2020241220114015.png)

<br>

## Step 14: Set Passwords and Create Users

- The next step is to set passwords and create users. You can do this by running
the following commands:

  ```bash
  #~ set the root password
  passwd

  #~ create a new user
  useradd -mG wheel -c User user

  #~ set the user password
  passwd user
  ```

  - ![photo](/assets/Pasted%20image%2020241220114129.png)

<br>

## Step 15: Exit and Reboot

- Once you have completed the installation, you can exit the chroot and reboot:

  ```bash
  #~ exit the chroot
  exit

  #~ unmount the filesystems
  cd
  sudo umount -lf /mnt
  ```

  - ![photo](/assets/Pasted%20image%2020241220114607.png)
  - ![photo](/assets/Pasted%20image%2020241220114628.png)

<br>

## Step 16: Fix Selinux Contexts

- We have installed Fedora from live media. Therefore, the selinux contexts are
not set correctly. Immediately after rebooting the system, press the up key repeatedly
after the BIOS screen. When the boot menu appears, press e to temporarily edit
the boot entry. Add selinux=0 to the end of the line:

  - ![photo](/assets/Pasted%20image%2020241220115239.png)

- Then press `Enter` to boot the system. After booting the system, login with the
root user and change selinux mode to `permissive` by running the following command:

  ```bash
  touch /.autorelabel
  vi /etc/selinux/config
  ```

- Then change the `SELINUX` line to `permissive`:

  - ![photo](/assets/Pasted%20image%2020241220173247.png)

- Reboot the system and selinux contexts will be fixed automatically.

  - ![photo](/assets/Pasted%20image%2020241220115425.png)

- After rebooting the system, change the selinux mode to `enforcing` back.
  - ![photo](/assets/Pasted%20image%2020241220173327.png)

---

## Conclusion

- Installing Fedora with DNF using the bootstrap method without a GUI installer
is an effective method for those who want a minimal and customized system. This
process allows you to build a lightweight, efficient, and fully controllable operating
system by adding only the components you need. At the same time, it gives you a deeper
understanding of [Linux FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard).
The results achieved in this way both enrich the learning process and provide an
experience aimed at advanced users.
