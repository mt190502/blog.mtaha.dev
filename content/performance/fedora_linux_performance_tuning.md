---
author: Taha
title: "Fedora Linux Performance Tuning Guide with CachyOS"
description: "Fedora Linux Performance Tuning Guide with CachyOS"
draft: false
date: 2025-03-18T12:00:00+03:00
tags: ["cachyos", "guide", "linux", "optimization", "performance", "system", "tuning"]
---

> [!warning] Disclaimer
>
> - This guide is Work In Progress (WIP) and may contain incomplete or inaccurate
information.
> - This guide is for advanced users only.
> - In this guide, we will apply performance tweaks inspired by CachyOS to Fedora
Linux. Some steps may require advanced knowledge of Linux system administration.

## Introduction

- CachyOS is a powerful and easy-to-use Linux distribution based on Arch Linux.
It offers an easy installation process and customization options, providing an
optimized experience for both novice and experienced users.
- Fedora Linux is a powerful and innovative distribution that delivers the latest
software in a stable environment. However, in order to achieve the best experience,
certain performance enhancements may be required. These enhancements can reduce
system response times, shorten application launch times, and improve the overall
user experience.
- In this article, we will explore how the performance-oriented tweaks offered by
CachyOS can be applied to Fedora Linux to improve system performance.

## Step 1: Enable CachyOS COPR Repositories

- The CachyOS developers provide a set of COPR repositories that contain performance-oriented
tweaks and enhancements for Fedora Linux. To enable these repositories, run the following
commands:

  ```bash
  sudo dnf copr enable bieszczaders/kernel-cachyos
  sudo dnf copr enable bieszczaders/kernel-cachyos-addons
  ```

  ![photo](/assets/Pasted%20image%2020250316153921.png)

<br>

## Step 2: Install CachyOS Kernel and Addons

- First, install the CachyOS kernel by running the following command:

  ```bash
  sudo dnf install kernel-cachyos{,-core,-devel{,-matched},-modules}
  ```

  ![photo](/assets/Pasted%20image%2020250316154137.png)

- After installing the CachyOS kernel, install the CachyOS addons by running the
following command:

  ```bash
  sudo dnf install cachyos-settings cachyos-ksm-settings scx-scheds
  ```

  ![photo](/assets/Pasted%20image%2020250316155223.png)

> [!tip] CachyOS Addons
>
> - `cachyos-settings` provides system-wide performance tweaks and optimizations.
[link](https://github.com/CachyOS/CachyOS-Settings)
> - `cachyos-ksm-settings` configures Kernel Samepage Merging (KSM) settings for
> memory optimization. [link](https://github.com/CachyOS/CachyOS-PKGBUILDS/tree/master/cachyos-ksm-settings)
> - `scx-scheds` provides additional CPU scheduler options for performance tuning.
[link](https://github.com/sched-ext/scx)

<br>

## Step 3: Configure System Tweaks

- First, edit the `/etc/kernel/cmdline` file and add the following parameter to
the kernel command line:

  ```bash
  skew_tick=1
  ```

  ![photo](/assets/Pasted%20image%2020250316212728.png)

> [!tip] Tip
>
> The `skew_tick` parameter reduces the system's response time by skewing the
timer tick towards the end of the tick period. This can improve the responsiveness
of the system.

- Next, configure memory-related tweaks by running the following command:

  ```bash
  sudo cat <<EOF >/etc/tmpfiles.d/system_config.conf
  w! /sys/kernel/mm/transparent_hugepage/shmem_enabled - - - - advise
  w! /sys/kernel/mm/ksm/sleep_millisecs - - - - 500
  EOF
  ```

> [!tip] Memory Management Optimization
>
> - `transparent_hugepage` is a feature that allows the kernel to use large
> memory pages to reduce the overhead of managing memory. By setting
> `shmem_enabled` to `advise`, we instruct the kernel to use transparent
> hugepages for shared memory segments.
> - `ksm` (Kernel Samepage Merging) is a feature that allows the kernel to
> merge identical memory pages to reduce memory usage. By setting
> `sleep_millisecs` to `500`, we configure the delay between scans for
> identical memory pages to 500 milliseconds (0.5 seconds).

- Create a new file `/etc/sysctl.d/99-sysctl-custom.conf` for system-wide performance
tweaks:

  ```bash
  sudo cat <<EOF >/etc/sysctl.d/99-sysctl-custom.conf
  ### Memory tweaks
  vm.swappiness = 10
  vm.vfs_cache_pressure = 100
  vm.page-cluster = 1
  vm.dirty_ratio = 40
  vm.dirty_background_ratio = 10
  vm.compaction_proactiveness = 0
  
  ### Network
  net.core.default_qdisc = cake
  net.ipv4.tcp_congestion_control = bbr
  net.ipv4.tcp_fastopen = 3
  net.ipv4.tcp_tw_reuse = 1
  net.ipv4.tcp_adv_win_scale = -2
  net.ipv4.tcp_mtu_probing = 1
  net.core.busy_read=50
  net.core.busy_poll=50
  net.ipv4.tcp_ecn=1
  net.ipv4.tcp_slow_start_after_idle = 0
  net.ipv4.tcp_low_latency=1
  
  ### MISC
  kernel.nmi_watchdog = 0
  kernel.perf_event_paranoid=1
  EOF
  ```

> [!tip] Configuration Breakdown
>
> **Memory Settings**
>
> - `vm.swappiness` controls the tendency of the kernel to swap memory pages
> to disk. A lower value reduces the likelihood of swapping.
> - `vm.vfs_cache_pressure` controls the tendency of the kernel to reclaim
> memory from the page cache. A lower value reduces the likelihood of
> reclaiming memory.
> - `vm.page-cluster` sets the number of pages to read ahead when reading
> from the page cache. A value of `0` disables read-ahead.
> - `vm.dirty_ratio` and `vm.dirty_background_ratio` control the percentage
> of memory that can be used for dirty pages before the kernel starts
> writing them to disk.
> - `vm.compaction_proactiveness` controls the aggressiveness of memory
> compaction. A higher value increases the frequency of memory compaction.
>
> **Network Settings**
>
> - `net.ipv4.tcp_congestion_control` sets the TCP congestion control
> algorithm to `bbr`, which is optimized for high-speed networks.
> - `net.ipv4.tcp_fastopen` enables TCP Fast Open, which allows data to be
> sent in the initial SYN packet.
> - `net.ipv4.tcp_tw_reuse` enables the reuse of TIME_WAIT sockets.
> - `net.ipv4.tcp_adv_win_scale` sets the window scaling factor for TCP
> connections.
> - `net.ipv4.tcp_mtu_probing` enables Path MTU Discovery for TCP connections.
> - `net.core.busy_read` and `net.core.busy_poll` control the busy polling
> behavior of network interfaces.
> - `net.ipv4.tcp_ecn` enables Explicit Congestion Notification for TCP
> connections.
> - `net.ipv4.tcp_slow_start_after_idle` disables slow start after a period
> of inactivity.
> - `net.ipv4.tcp_low_latency` enables low-latency mode for TCP connections.
>
> **System Settings**
>
> - `kernel.nmi_watchdog` disables the NMI watchdog timer.
> - `kernel.perf_event_paranoid` sets the paranoia level for performance
> monitoring events.

- Enable the PCI latency optimization service:

  ```bash
  sudo systemctl enable --now pci-latency.service
  ```

> [!tip] PCI Latency
> This service optimizes PCI device response times by minimizing latency timers.

- Regenerate the initramfs to apply kernel changes:

  ```bash
  sudo dracut -fv --kver $(ls /lib/modules | grep -i cachyos | head -n 1)
  ```

- Then reboot to apply all changes:

  ```bash
  sudo reboot 
  ```

<br>

## Step 4: Change CPU Scheduler

- The kernel scheduler is crucial for managing how processes are executed on the
CPU. By changing the scheduler, you can optimize the system for different workloads
such as gaming, low latency, or power-saving.

- First, list the available schedulers by running the following command:

  ```bash
  dbus-send --system --print-reply --dest=org.scx.Loader /org/scx/Loader org.freedesktop.DBus.Properties.Get string:org.scx.Loader string:SupportedSchedulers
  ```
  
  ![photo](/assets/Pasted%20image%2020250316220813.png)

- In this guide, we will use the `bpfland` scheduler. To test the `bpfland`
scheduler, run the following command:

  ```bash
  sudo scx_bpfland
  ```

  ![photo](/assets/Pasted%20image%2020250316222641.png)

> [!tip] Scheduler Info
>
> The bpfland scheduler provides excellent performance for both desktop and
gaming workloads. For more details, visit the [official page](https://github.com/sched-ext/scx).

- If the bpfland scheduler performs well, set it as the default by editing `/etc/scx_loader/config.toml`:

  ```bash
  sudo vim /etc/scx_loader/config.toml
  ```

- Configure the scheduler settings:

  ```toml
  default_sched = "scx_bpfland"
  default_mode = "Gaming"
  
  [scheds.scx_bpfland]
  auto_mode = []
  gaming_mode = ["-m", "performance"]
  lowlatency_mode = ["-s", "5000", "-S", "500", "-l", "5000", "-m", "performance"]
  powersave_mode = ["-m", "powersave"]
  
  [scheds.scx_rusty]
  auto_mode = []
  gaming_mode = []
  lowlatency_mode = []
  powersave_mode = []
  
  [scheds.scx_lavd]
  auto_mode = []
  gaming_mode = ["--performance"]
  lowlatency_mode = ["--performance"]
  powersave_mode = ["--powersave"]
  ```

  ![photo](/assets/Pasted%20image%2020250316161809.png)

- Then, restart the `scx_loader` service to apply the changes:

  ```bash
  sudo systemctl restart scx_loader
  ```

- To verify the scheduler settings, run the following command:

  ```bash
  dbus-send --system --print-reply --dest=org.scx.Loader /org/scx/Loader org.freedesktop.DBus.Properties.Get string:org.scx.Loader string:CurrentScheduler
  ```

  ![photo](/assets/Pasted%20image%2020250318142058.png)

<br>

---

## Conclusion

- By implementing these CachyOS-inspired optimizations, you've significantly improved
the performance of your Fedora system. The combination of
  - High performance custom kernel
  - Optimized memory management
  - Improved network stack
  - Efficient CPU scheduler
  - Fine-tuned system parameters

- These enhancements work together to provide
  - Faster system response times
  - Better resource utilization
  - Improved gaming performance
  - Improved multitasking capability
  - Reduced latency for real-time applications

Remember that system performance is a journey, rather than a destination. Monitor
your system's behavior after applying these changes and adjust the parameters as
needed to match your specific use case and hardware configuration.

<br>

## References

- <https://wiki.cachyos.org/configuration/general_system_tweaks/>
- <https://wiki.cachyos.org/configuration/sched-ext/>
- <https://copr.fedorainfracloud.org/coprs/bieszczaders/kernel-cachyos/>
- <https://copr.fedorainfracloud.org/coprs/bieszczaders/kernel-cachyos-addons/>
- <https://docs.redhat.com/en/documentation/red_hat_enterprise_linux_for_real_time/7/html/tuning_guide/reduce_cpu_performance_spikes>
