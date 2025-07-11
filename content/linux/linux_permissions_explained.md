---
author: Taha
title: "Understanding Linux Permissions"
description: "A comprehensive guide to Linux file permissions, including user, group, and other permissions, along with practical examples and Access Control Lists (ACLs)."
draft: false
date: 2025-07-11T22:00:00+03:00
tags: ["command-line", "files", "filesystem", "linux", "management", "permissions", "security", "tutorial"]
---

<br>

## Introduction

File permissions are a fundamental Linux concept that determines who can read, modify
or run files and folders. Misconfigured permissions can result in accidental data
loss, compromised system security, or service interruption. In this guide, we will
describe classic Unix-style permissions and discuss how to manage and interpret them.
We will also cover Access Control Lists (ACLs), which provide more granular control.

<br>

## Linux Permission Basics

### Users, Groups, and Others

- Every file and directory in Linux has an owner and a group. Ownership is displayed
using the `ls -l` command.

  ![photo](/assets/Pasted%20image%2020250710185615.png)

  - The first column (red column) shows the file type. Most common types are:
    - `-` for regular files
    - `b` for block devices
    - `c` for character devices
    - `d` for directories
    - `l` for symbolic links
    - `s` for unix socket files
  - The second, third, and fourth columns show the permissions:
    - `r` for read, `w` for write, `x` for execute (explained in detail below).
    - If a permission is not granted, it appears as `-`.
    - Orange column shows the user, yellow column shows the group, and green column
    shows the everyone permissions.
  - The fifth column (blue column) shows the additional ACL permissions.
  - The sixth column (purple column) shows the file owner.
  - The seventh column (brown column) shows the file group.

---

### Permission Bits: r, w, x

- Permissions are represented by three characters: `r`, `w`, and `x`.
  - **r (read)**: Allows reading the contents of a file or listing a directory.
  - **w (write)**: Allows modifying a file or making changes within a directory
   (e.g., add/delete files).
  - **x (execute)**: Allows running a file as a program or entering a directory.

For example, if a file has permissions `rwxr-xr--`:

1. `rwx` for the owner (read, write, execute)
2. `r-x` for group (read, execute)
3. `r--` for others (read only)

---

### Numeric (Octal) Representation

- Permissions can also be represented numerically using octal notation, where each
permission bit is assigned a value:
  - `r` = 4
  - `w` = 2
  - `x` = 1

For example, `rwxr-xr--` translates to:

1. `rwx` for the owner (read, write, execute) = 4 + 2 + 1 = 7
2. `r-x` for group (read, execute) = 4 + 0 + 1 = 5
3. `r--` for others (read only) = 4 + 0 + 0 = 4

So, `rwxr-xr--` is represented as `754` in octal.

  ```sh
  chmod 754 script.sh
  ```

---

### Symbolic Representation (chmod)

- Permissions can also be modified symbolically, using letters to represent the user
  categories:
  - `u`: user (owner)
  - `g`: group
  - `o`: others
  - `a`: all (user, group, others)

For example, to add read and execute permissions for the user, add write permission
for the group, and remove execute permission for others, you can use:

- `u+rx`:
  - `u` means user (owner)
  - `+` means add permission
  - `rx` means read and execute
- `g+w`: Add write for the group.
  - `g` means group
  - `+` means add permission
  - `w` means write
- `o-x`: Remove execute for others.
  - `o` means others
  - `-` means remove permission
  - `x` means execute

You can combine these in a single command:

  ```sh
  chmod u+rx,g+w,o-x file.txt
  ```

---

### Special Permission Bits

Other than the standard permissions, Linux has special permission bits that modify
behavior. For example:

- **Setuid (s)**: When set on an executable file, it allows the file to run with
  the permissions of the file owner, rather than the user running it. This is useful
  for programs that need elevated privileges temporarily. Example:
- **Setgid (s)**: When set on a directory, new files created within that directory
  inherit the group of the directory, rather than the primary group of the user
  creating the file. This is useful for shared directories where you want all files
  to belong to a specific group.
- **Sticky Bit (t)**: When set on a directory, it restricts file deletion within
  that directory to the file's owner, the directory's owner, or the root user.

<br>

## Access Control Lists (ACLs)

Access Control Lists (ACLs) provide a more flexible permission model than traditional
Unix permissions. They allow you to specify permissions for multiple users and groups
beyond just the owner and group. Supported by common filesystems like btrfs, ext4,
xfs, zfs, and more, ACLs are useful for complex permission scenarios.

---

### Most Common ACL Commands

- **getfacl**: Get ACLs for a file or directory.
- **setfacl**: Set ACLs on a file or directory.

---

### Setting and Using ACLs

- Some files and directories in Linux have ACLs enabled by default. To check
  if a file has ACLs enabled, you can use the `getfacl` command:

  ![photo](/assets/Pasted%20image%2020250711001250.png)

### Changing ACLs

- To set an ACL for a specific user, you can use the `setfacl` command. For example,
  to give user `taha` read and write permissions on a file named `data.txt`, you
  can use:

  ```sh
  setfacl -m u:taha:rw data.txt
  ```

  - `-m` flag stands for modify, indicating that you are modifying the ACL.
    - `u` stands for user, and in this case, it specifies that the ACL is being set
    for the user `taha`.
    - `rw` specifies the permissions being granted, which are read and write.

- Another example is to set an ACL for a specific group. For example, to give
  the group `developers` read and execute permissions on a directory named `project`,
  you can use:

  ```sh
  setfacl -m g:developers:rx project
  ```

  - `g` stands for group, and in this case, it specifies that the ACL is being set
        for the group `developers`.
    - `rx` specifies the permissions being granted, which are read and execute.

<br>

## Differences Between ACLs and Traditional Permissions

| Feature                | Traditional Permissions (User/Group/Other)                   | Access Control Lists (ACLs)                               |
|------------------------|--------------------------------------------------------------|-----------------------------------------------------------|
| User/Group Granularity | One owner, one group, others                                 | Multiple specific users and groups                        |
| Flexibility            | Limited to owner, group, others                              | Fine-tuned, per-user and per-group                        |
| Permission Assignment  | Cannot assign different permissions to multiple users/groups | Can assign different permissions to multiple users/groups |
| Use Case               | Simple access control                                        | Complex, collaborative environments                       |

---

## Conclusion

Understanding Linux permissions is essential for maintaining system security and
managing access to files and directories. By mastering both traditional permission
schemes and Access Control Lists (ACLs), you can tailor access controls to fit a
wide range of scenarios, from simple personal projects to complex, collaborative
environments. Regularly reviewing and adjusting permissions helps prevent unauthorized
access and protects your data. With these tools and concepts, you are well-equipped
to manage permissions effectively on any Linux system.
