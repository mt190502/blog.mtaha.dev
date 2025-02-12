---
authors: Taha
title: "Dual GPU Passthrough Guide"
description: "A step-by-step guide to setting up dual GPU passthrough on a Linux system."
draft: false
date: 2024-11-07T20:00:00+03:00
tags: ["dual-gpu", "gaming", "gpu", "guide", "hardware", "iommu", "kvm", "libvirt", "linux", "passthrough", "performance", "qemu", "tutorial", "vfio", "virtualization", "windows"]
---

## Introduction

- The latest advances in virtualization now make it possible to run multiple
operating systems simultaneously on high-performance computers. In this
guide, we'll show you how to use dual GPU migration to assign a powerful
graphics card to a Windows virtual machine running on a Linux system,
allowing you to run Windows and Linux seamlessly on the same machine.
- Passthrough allows a virtual machine (VM) to use the hardware directly,
which is a huge advantage, especially for gamers and users of
graphics-intensive applications. On a dual GPU system, you can assign one GPU
to the Linux host system and the other GPU to the Windows virtual machine to
maximize the graphics performance of both operating systems independently.

<br>

## Prerequisites

- 16 GB of RAM or more (8 GB for each system)
- A computer with UEFI compatible two GPUs (one for the host and one for the guest)
- A CPU with virtualization support (Intel VT-x or AMD-V)
- A Linux distribution with a recent kernel (5.0 or later)
- A Windows installation ISO

<br>

## Step 1: Enable IOMMU from BIOS

- IOMMU (Input/Output Memory Management Unit) is a feature that allows the system
to map device memory addresses to physical memory addresses. This is essential
for passthrough to work correctly. To enable IOMMU, you need to enable IOMMU
(AMD-Vi for AMD chipset, VT-d for Intel chipset)
- For Intel: ![photo](/assets/Pasted%20image%2020241106223102.png)
- For AMD: ![photo](/assets/Pasted%20image%2020241106223235.png)

<br>

## Step 2: Enable IOMMU in the Kernel

- To enable IOMMU in the kernel, you need to add the following kernel parameters
  to the bootloader configuration files.

- If you're using GRUB bootloader;
  - Open the GRUB configuration file:

    ```bash
    sudo vim /etc/default/grub
    ```

  - Add the following line to the `GRUB_CMDLINE_LINUX` parameter:

    ```bash
    GRUB_CMDLINE_LINUX="... intel_iommu=on iommu=pt"  # For Intel
    GRUB_CMDLINE_LINUX="... amd_iommu=on iommu=pt"    # For AMD
    ```

    ![photo](/assets/Pasted%20image%2020241107122734.png)
  - Update the GRUB configuration:

      ```bash
      sudo update-grub
      ```

      or

      ```bash
      sudo grub-mkconfig -o /boot/grub/grub.cfg
      ```

      or

      ```bash
      sudo grub2-mkconfig -o /boot/grub2/grub.cfg
      ```

- If you're using systemd-boot;
  - Open the default kernel command line file:

    ```bash
    sudo vim /etc/kernel/cmdline
    ```

  - Add the following line to the file:

    ```bash
    intel_iommu=on iommu=pt  # For Intel
    amd_iommu=on iommu=pt    # For AMD
    ```

    ![photo](/assets/Pasted%20image%2020241107123413.png)

  - And open the current kernel configuration file:

    ```bash
    sudo vim /boot/loader/entries/$(cat /etc/machine-id)-$(uname -r).conf
    ```

    or

    ```bash
    sudo vim /boot/efi/loader/entries/$(cat /etc/machine-id)-$(uname -r).conf
    ```

  - Add the following line to append the `options` line:

    ```bash
    intel_iommu=on iommu=pt  # For Intel
    amd_iommu=on iommu=pt    # For AMD
    ```

    ![photo](/assets/Pasted%20image%2020241107124236.png)

- Reboot the system to apply the changes.

<br>

## Step 3: Verify IOMMU Support

- To verify that IOMMU is enabled and working correctly, run the following command:

  ```bash
  sudo dmesg | grep -E 'DMAR|IOMMU'
  ```

  ![photo](/assets/Pasted%20image%2020241107124513.png)

- If you want to see the IOMMU groups, you can use the following script:

  ```bash
  vim lsiommu.sh
  ```

  - Add the following lines to the file:

    ```bash
    #!/bin/bash
    shopt -s nullglob
    for g in $(find /sys/kernel/iommu_groups/* -maxdepth 0 -type d | sort -V); do
        echo "IOMMU Group ${g##*/}:"
        for d in $g/devices/*; do
            echo -e "\t$(lspci -nns ${d##\*/})"
        done;
    done;
    ```

  - Save the file (esc + :wq) and make it executable:

    ```bash
    chmod +x lsiommu.sh
    ```

  - Run the script:

    ```bash
    ./lsiommu.sh
    ```

  - The output will show you the IOMMU groups and the devices in each group.

    ```bash
    ...
    IOMMU Group 10: 
    01:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere [Radeon RX 470/480/570/570X/580/580X/590] [1002:67df] (rev ef)
    01:00.1 Audio device [0403]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1002:aaf0]
    ...
    ```

    > [!warning] Warning
    >
    > You will see the GPU vendor ID and device ID in the output. You will require
     this information when configuring the virtual machine. This is an AMD GPU
     with the vendor ID `1002` and device ID `67df` (`[1002:67df]`).
     The audio device is also shown in the same group with the vendor ID `1002`
     and device ID `aaf0` (`[1002:aaf0]`).

<br>

## Step 4: Install Required Packages

- Install the required packages for this operation:

  - For Ubuntu/Debian:

    ```bash
    sudo apt install qemu-system-x86 libvirt-clients libvirt-daemon-system libvirt-daemon-config-network bridge-utils virt-manager ovmf inxi
    ```

  - For Fedora:

    ```bash
    sudo dnf install @virtualization inxi
    ```

  - For Arch:

    ```bash
    sudo pacman -S virt-manager qemu vde2 ebtables iptables-nft nftables dnsmasq bridge-utils ovmf inxi
    ```

<br>

## Step 5: Add your user to the libvirt groups

- Add your user to the libvirt and kvm groups with the following command:

  ```bash
  sudo usermod -aG libvirt,qemu,kvm $USER
  ```

  > [!note] Note
  >
  > If you're get `group x does not exist` error, remove group `x` from the
  command and try again.

<br>

## Step 6: Block the GPU Driver

- To stop the GPU driver loading at boot, you must blacklist the driver. Create
a new file in the /etc/modprobe.d/ directory with the following command to do this:

  ```bash
  sudo vim /etc/modprobe.d/blacklist.conf
  ```

- Add the following lines to file:

  - For NVIDIA:

    ```bash
    blacklist nouveau
    blacklist nvidia
    ```

  - For AMD or Radeon:

    ```bash
    blacklist amdgpu
    blacklist radeon
    ```

  - Now, append the GPU vendor ID and device ID to the file from the Step 3 output:

    ```bash
    options vfio-pci ids=1002:67df,1002:aaf0
    ```

    ![photo](/assets/Pasted%20image%2020241107125159.png)

  - Save the file and regenerate the initramfs:

    - For Ubuntu/Debian:

      ```bash
      sudo update-initramfs -c -k all
      ```

    - For Fedora:

      ```bash
      sudo dracut -fv
      ```

    - For Arch:

      ```bash
      sudo mkinitcpio -P
      ```

<br>

## Step 7: Enable and Start the Libvirt Service and Reboot

- Enable and start the libvirt service:

  ```bash
  sudo systemctl enable libvirtd
  ```

- Reboot the system to apply the changes.

  ```bash
  sudo reboot
  ```

<br>

## Step 8: Check the GPU Drivers

- After rebooting the system, check if the GPU driver is loaded by inxi command.
  Run the following command to check the GPU driver:

  ```bash
  inxi -G
  ```

  ![photo](/assets/Pasted%20image%2020241107131559.png)

  > [!warning] Warning
  >
  > If you don't see the vfio-pci driver in the output, go back to Step 6 and check
  the configuration file.

<br>

## Step 9: Download the Windows ISO File and VirtIO ISO Drivers

- Download the Windows installation ISO from the Microsoft website:
[Windows 10](https://www.microsoft.com/en-us/software-download/windows10iso),
[Windows 11](https://www.microsoft.com/en-us/software-download/windows11)
- Download the VirtIO drivers ISO from the [VirtIO GitHub Page](https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md).

<br>

## Step 10: Create a Windows Virtual Machine

- Open the Virtual Machine Manager (virt-manager) and click `Edit > Preferences`.
Now, enable the `Enable XML editing` option.

  ![photo](/assets/Pasted%20image%2020241107133023.png)

- Click `Edit > Connection Details`. Now, switch to the `Virtual Networks` tab.
Select the `default` adapter. Ensure that the `Autostart` option is enabled.

  ![photo](/assets/Pasted%20image%2020241107133125.png)

- Then close the settings window and click the `Create a new virtual machine` button.
- Select the `Local install media (ISO image or CDROM)` option and click the
Forward button.

  ![photo](/assets/Pasted%20image%2020241107132505.png)

- Click the Browse button and select the Windows ISO file. And click the Forward
button.

  ![photo](/assets/Pasted%20image%2020241107132536.png)

- Set the memory size to 8 GB or more and click Forward. If you have a CPU with
more than 4 cores, set the CPU core to 4 or more.

  ![photo](/assets/Pasted%20image%2020241107132549.png)

- Create a new disk image of at least 100 GB and click Forward.

  ![photo](/assets/Pasted%20image%2020241107132627.png)

- Name the virtual machine and select the Customise configuration before
installation option. Now, click the Finish button.

  ![photo](/assets/Pasted%20image%2020241107132720.png)

- Go to the Overview tab and click on Firmware. Select `UEFI x86_64:
/usr/share/edk2/ovmf/OVMF_CODE.secboot.fd` option.

  ![photo](/assets/Pasted%20image%2020241107132840.png)

- Go to the Memory tab, enable the `Enable shared memory` option.

  ![photo](/assets/Pasted%20image%2020241107133232.png)

- Select the `Virtio` option from the `Disk bus` menu in the `SATA Disk 1` tab.

  ![photo](/assets/Pasted%20image%2020241107133255.png)

- Select the `virtio` option from the `NIC` tab in the `Device model` section.

  ![photo](/assets/Pasted%20image%2020241107133356.png)

- Go to the `TPM` tab, click on `Advanced options` and select TPM version to `2.0`.

  ![photo](/assets/Pasted%20image%2020241107133504.png)

- Click the `Add Hardware` button and select `Storage`. Select the `CD-ROM`
device option from the `Device Type` menu.

  ![photo](/assets/Pasted%20image%2020241107133807.png)

- Click the `Manage` button.

  ![photo](/assets/Pasted%20image%2020241107133827.png)

- Click the `Browse Local` button. Select the VirtIO ISO file.

  ![photo](/assets/Pasted%20image%2020241107133856.png)

- In the `Boot Options` tab. Enable to SATA CDROM 1 option. Then move the SATA
CDROM 1 to the top of the boot order.

  ![photo](/assets/Pasted%20image%2020241107134223.png)

<br>

## Step 11: Setup Windows

- Start the virtual machine and install Windows as usual.
- Agree to the licence agreement and choose the custom installation option.

  ![photo](/assets/Pasted%20image%2020241107134934.png)

- Select the `Load driver` option.

  ![photo](/assets/Pasted%20image%2020241107135013.png)

- Select `OK`. Windows will find the VirtIO drivers automatically.

  ![photo](/assets/Pasted%20image%2020241107135040.png)

- Select `RedHat VirtIO SCSI controller` and click `Next`.

    > [!info] Info
    >
    > If you're installing Windows 10, you must select the `RedHat VirtIO
  SCSI controller (E:\amd64\w10\viostor.inf)` driver.

  ![photo](/assets/Pasted%20image%2020241107135112.png)

- Click `Next`. Setup will automatically set up the partitions.

  ![photo](/assets/Pasted%20image%2020241107135143.png)
  ![photo](/assets/Pasted%20image%2020241107135202.png)

- Once the installation is complete, the out-of-box experience (OOBE) will appear.
Since there is no network connection, we will press Shift+F10 and type the
following command.

  ```cmd
  OOBE\BYPASSNRO
  ```

  ![photo](/assets/Pasted%20image%2020241107140340.png)

- Once you have completed the reboot, you can proceed to set up Windows as usual.
Select the `I don't have internet` option.

  ![photo](/assets/Pasted%20image%2020241107140519.png)

- Select `Continue with limited setup` option.

  ![photo](/assets/Pasted%20image%2020241107140553.png)

- Type your username and password.

  ![photo](/assets/Pasted%20image%2020241107140627.png)

- Once you have made the necessary adjustments, simply press Next. The
installation will complete itself.

- After the installation is complete, you must install the VirtIO drivers from
the VirtIO ISO file. Open the file manager and navigate to the `virtio-win` disk.

  ![photo](/assets/Pasted%20image%2020241107141146.png)

- Run the `virtio-win-guest-tools` program. The program will install automatically
install the necessary files.

  ![photo](/assets/Pasted%20image%2020241107141027.png)

> [!info] Info
>
> The Windows update will install the GPU driver automatically, which will
cause the system to crash. You must disable the automatic updates from the Group
Policy Editor to prevent this.
>
> - <https://answers.microsoft.com/en-us/windows/forum/all/how-to-stop-windows-11-from-downloading-drivers/ccff88ed-76cf-4639-b6d7-391566f3d2d5>
> - <https://answers.microsoft.com/en-us/windows/forum/all/disable-driver-updates/63957b76-b55c-4c59-93f0-72835e9b2fff>

<br>

## Step 12: Setup ROM File

> [!warning] Warning
>
> For desktop GPUs, this step is not required with `465.xx` and `later` drivers.
For laptop GPUs, this step is not required with `500.xx` and `later` drivers.
Refer to the [NVIDIA Customer Help Page](https://nvidia.custhelp.com/app/answers/detail/a_id/5173/~/geforce-gpu-passthrough-for-windows-virtual-machine-(beta))
for more information

- If you're using Linux:

  - NVIDIA: Download [NVFlash](https://www.techpowerup.com/download/nvidia-nvflash/)
  and extract it to home folder. The file name should be `nvflash`.
  - AMD: Download [ATIFlash](https://www.techpowerup.com/download/ati-atiflash/)
  and extract it to home folder. The file name should be `amdvbflash`.

  - Make the `nvflash` or `amdvbflash` file executable.

    - NVIDIA: `chmod +x nvflash`
    - AMD: `chmod +x amdvbflash`

  - And extract the ROM file from the GPU.
    - NVIDIA: `sudo ./nvflash --save vbios.rom`
    - AMD: `sudo ./amdvbflash -s 0 vbios.rom`
      - Note for AMD: Use the `-s 0` option to specify the GPU number. If you have
      multiple GPUs, you can change the number to extract the ROM file from the
      desired GPU. To learn the GPU number, use the `sudo ./amdvbflash -i` command.

- If you're using Windows:

  - Install GPU-Z from the [GPU-Z website](https://www.techpowerup.com/download/techpowerup-gpu-z/).
  - Open the GPU-Z and click on the `Save to file` button to extract the ROM file.
    ![photo](/assets/Pasted%20image%2020241107161626.png)

- Patch the ROM file (only NVIDIA)

  > [!note] Note
  >
  > If you're using AMD GPU, you can skip this step.

  - If you're using Linux, install the `okteta` app.

    - Open the ROM file with the `okteta` app.
    - Press `Ctrl + F` and search for the `VIDEO` value.

      ![photo](/assets/Pasted%20image%2020241107161853.png)
      ![photo](/assets/Pasted%20image%2020241107161921.png)

    - Select before the `VIDEO` line and press the DELETE button to remove the
    selected value:

      ![photo](/assets/Pasted%20image%2020241107162046.png)

    - After the delete the value, the file should look like this:
      ![photo](/assets/Pasted%20image%2020241107162133.png)

  - If you're using Windows, install the `HxD` app.

- Copy the ROM file to the `/var/lib/libvirt/vgabios` directory.

  ```bash
  sudo mkdir -p /var/lib/libvirt/vgabios
  sudo cp vbios.rom /var/lib/libvirt/vgabios
  ```

- Change permissions of the ROM file.

  ```bash
  sudo chown $USER:$USER /var/lib/libvirt/vgabios/vbios.rom
  sudo chmod 644 /var/lib/libvirt/vgabios/vbios.rom
  ```

> [!note] Note
>
> If you're using Fedora, you need to change the secontext of the ROM file.
>
> ```bash
> sudo restorecon -vR /var/lib/libvirt/vgabios/vbios.rom
>  ```

<br>

## Step 13: Setup shared memory

- Open `virt-manager` and click on the newly created virtual machine. Next, click
on Overview and then XML.
- Add the following lines to xml file:

  ```xml
  <memoryBacking>
    <source type="memfd"/>
    <access mode="shared"/>
  </memoryBacking>
  ```

  ![photo](/assets/Pasted%20image%2020241107141645.png)

- Remove the following lines from to the xml file:

  ![photo](/assets/Pasted%20image%2020241107141849.png)

- Then add the following lines to the xml file:

  ```xml
  <memballoon model="none"/>
  <shmem name="looking-glass">
    <model type="ivshmem-plain"/>
    <size unit="M">32</size>
    <address type="pci" domain="0x0000" bus="0x10" slot="0x01" function="0x0"/>
  </shmem>
  ```

  ![photo](/assets/Pasted%20image%2020241107141921.png)

<br>

## Step 14: Setup looking-glass-client and looking-glass-server

- Install the [looking-glass-host](https://looking-glass.io/artifact/B7-rc1/host)
into the virtual machine.

  ![photo](/assets/Pasted%20image%2020241107142551.png)

- The binaries already available for the Looking Glass client are currently not
working properly. The client program must be manually compiled.

  - Install the required packages for
  [Ubuntu, Debian](https://looking-glass.io/docs/B7-rc1-34-e25492a3/build/#required-dependencies),
  or [other](https://looking-glass.io/wiki/Installation_on_other_distributions)
  Linux distributions.

  - Clone the Looking Glass repository and build the client program.

    ```bash
    git clone https://github.com/gnif/LookingGlass.git
    ```

  - Make the change to the client directory and then compile the program.

    ```bash
    cd LookingGlass/client
    mkdir build
    cd build
    cmake ..
    make
    ```

  - Copy the compiled program to the `/usr/local/bin` directory.

    ```bash
    sudo cp looking-glass-client /usr/local/bin
    ```

<br>

## Step 15: Setup dummy output

- If you want to buy a dummy HDMI adapter. You can buy from the
[Amazon](https://www.amazon.com/s?k=dummy+hdmi), or you have already a dummy
HDMI adapter, you can use it.

- Use the [VirtualDisplay](https://git.catvibers.me/aa/VirtualDisplay) driver if
you don't want to buy an HDMI adapter. This driver creates a dummy video card for
the virtual machine.

- Visit the [VirtualDisplay](https://git.catvibers.me/aa/VirtualDisplay/releases)
repository and download the driver.

  ![photo](/assets/Pasted%20image%2020241107143608.png)

- Extract the downloaded file.

  ![photo](/assets/Pasted%20image%2020241107143731.png)

- Go to the search menu. Type the `cmd` and run the command prompt as administrator.
(ctrl+shift+enter is the shortcut)

  ![photo](/assets/Pasted%20image%2020241107144325.png)

- Install the driver certificate by typing the following command.

  ```cmd
  cd %USERPROFILE%\Downloads\IddSampleDriver-0.1

  .\installCert.bat
  ```

  ![photo](/assets/Pasted%20image%2020241107144427.png)

- Then open the device management console. (devmgmt.msc)

  ![photo](/assets/Pasted%20image%2020241107143824.png)

- Click `Action` menu and select the `Add legacy hardware` option.

  ![photo](/assets/Pasted%20image%2020241107143934.png)

- Click `Next` button. Then select the `Install the hardware that I manually select
from a list (Advanced)` option.

  ![photo](/assets/Pasted%20image%2020241107144007.png)

- Click `Next` button. Then select the `Display adapters` option.

  ![photo](/assets/Pasted%20image%2020241107144023.png)

- Click `Next` button. Then click on the `Have Disk` button.

  ![photo](/assets/Pasted%20image%2020241107144057.png)

- Click `Browse` button. Select the `%USERPROFILE%\Downloads\IddSampleDriver-0.1\IddSampleDriver.inf`
file.

  ![photo](/assets/Pasted%20image%2020241107144127.png)

- Click `Open` button. Then click on the `Next` button.

  ![photo](/assets/Pasted%20image%2020241107144156.png)
  ![photo](/assets/Pasted%20image%2020241107144517.png)

- Click to `Install` button. Then click on the `Finish` button.

  ![photo](/assets/Pasted%20image%2020241107144559.png)

<br>

## Step 16: Add GPU to the Virtual Machine

- Close the virtual machine and open the configuration tab. Then click `Add Hardware`
button
- Next, you will see the `PCI Host Device` option. Select the GPU and audio device.

  ![photo](/assets/Pasted%20image%2020241107144935.png)

- You must also add the GPU ROM file from the `/var/lib/libvirt/vgabios` directory.
Enter the following XML code in the `Overview > XML` section.

  ```xml
  <rom file="/var/lib/libvirt/vgabios/vbios.rom"/>
  ```

  ![photo](/assets/Pasted%20image%2020241107174823.png)

- Then boot virtual machine and open the device manager (devmgmt.msc).

  ![photo](/assets/Pasted%20image%2020241107143824.png)

- Open the `Display adapters` section. Right-click on the
`Microsoft Basic Display Adapter` and select the `Details` tab. Select
`Hardware IDs`. If the hardware ID matches your GPU vendor ID and device ID from
 step 3, the GPU is installed correctly.

  ![photo](/assets/Pasted%20image%2020241107145500.png)

- If everything is working correctly, you can install the standard drivers from
your video card manufacturer's website and start using them.

- Then shutdown the virtual machine and set video type `none` from the `Video QXL`
tab.

  ![photo](/assets/Pasted%20image%2020241107193319.png)

- Finally start the virtual machine and run the `looking-glass-client` program.

  ![photo](/assets/Pasted%20image%2020241107194006.png)

---

## Conclusion

- This guide shows you how to set up dual GPU passthrough on a Linux system. You
can assign a powerful graphics card to a Windows virtual machine running on a
Linux system, allowing you to run Windows and Linux on the same machine.

## Big Thanks

- [bn182](https://discordapp.com/users/901811479320350730)
- [Kerem](https://github.com/Vallentinus)
- [Kreato](https://github.com/kreatoo)
- [Yusuf Ipek](https://yusufipek.me)

## References

- [Arch Wiki - PCI passthrough via OVMF](https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF)
- [Kreato's GPU Passthrough Guide](https://www.technopat.net/sosyal/konu/kreatonun-laptop-gpu-passthrough-rehberi.1896153/)
- [Yusuf Ipek - Single GPU Passthrough Guide](https://yusufipek.me/single-gpu-passthrough)
