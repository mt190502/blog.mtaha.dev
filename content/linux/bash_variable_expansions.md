+++
authors = ["Taha"]
title = "Bash Variable Expansions"
description = "Bash Variable Expansions"
draft = false
date = 2024-11-06T11:00:00+03:00
[taxonomies]
tags = ["bash", "variables", "regex"]
[extra]
toc = true
toc_ordered = true
+++

- Bash (short for Bourne-Again SHell), is a shell program and command language
supported by the Free Software Foundation and first developed for the GNU Project
by Brian Fox. Designed as a 100% free software alternative for the Bourne shell,
it was initially released in 1989. Its moniker is a play on words, referencing
both its predecessor, the Bourne shell, and the concept of rebirth.

- Today I will be explaining the variable expansions in bash. Variable expansions
are a way to manipulate variables in bash. They are used to perform various
operations on variables, such as extracting substrings, replacing text, and more.

<br>

## $\{#variable\}

- This expansion returns the length of the variable. For example:

  ```bash
  variable="Hello, World!"
  echo ${#variable}
  ```

  Output:

  ```bash
  13
  ```

<br>

## $\{variable%pattern\}

- This expansion removes the match of the pattern from the end of the variable.
Wildcards can be used in the pattern. For example:

  ```bash
  variable="Hello world hello world 123!"
  echo ${variable%%123\!}
  echo ${variable%%world*}
  ```

  Output:

  ```bash
  Hello world hello world
  Hello world hello
  ```

<br>

## $\{variable#pattern\}

- This expansion removes the match of the pattern from the beginning of the variable.
Wildcards can be used in the pattern. For example:

  ```bash
  variable="Hello world hello world 123"
  echo ${variable#Hel}
  echo ${variable#*o}
  ```

  Output:

  ```bash
  lo world hello world 123
  world hello world 123
  ```

<br>

## $\{variable%%pattern\}

- This expansion removes the longest match of the pattern from the end of the
variable. Wildcards can be used in the pattern. For example:

  ```bash
  variable="Hello world hello world 123!"
  echo ${variable%%123\!}
  echo ${variable%%world*}
  ```

  Output:

  ```bash
  Hello world hello world
  Hello
  ```

<br>

## $\{variable##pattern\}

- This expansion removes the longest match of the pattern from the beginning of
the variable. Wildcards can be used in the pattern. For example:

  ```bash
  variable="Hello world hello world 123"
  echo ${variable##Hel}
  echo ${variable##*o}
  ```

  Output:

  ```bash
  lo world hello world 123
  rld 123
  ```

<br>

## $\{variable^\}

- This expansion converts the first character of the variable to uppercase. For example:

  ```bash
  variable="hello, world 123!"
  echo ${variable^}
  ```

  Output:

  ```bash
  Hello, world 123!
  ```

<br>

## $\{variable^^\}

- This expansion converts all characters of the variable to uppercase. For example:

  ```bash
  variable="hello, world 123!"
  echo ${variable^^}
  ```

  Output:

  ```bash
  HELLO, WORLD 123!
  ```

<br>

## $\{variable^^pattern\}

- This expansion converts all characters of the variable that match the pattern
to uppercase. For example:

  ```bash
  variable="hello, world 123!"
  echo ${variable^^w}
  ```

  Output:

  ```bash
  hello, World 123!
  ```

<br>

## $\{variable,\}

- This expansion converts the first character of the variable to lowercase. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable,}
  ```

  Output:

  ```bash
  hello, World 123!
  ```

<br>

## $\{variable,,\}

- This expansion converts all characters of the variable to lowercase. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable,,}
  ```

  Output:

  ```bash
  hello, world 123!
  ```

<br>

## $\{variable,,pattern\}

- This expansion converts all characters of the variable that match the pattern
to lowercase. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable,,W}
  ```

  Output:

  ```bash
  Hello, world 123!
  ```

<br>

## $\{variable~\}

- This expansion swaps the case of the first character of the variable. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable~}
  ```

  Output:

  ```bash
  hello, World 123!
  ```

<br>

## $\{variable\~\~\}

- This expansion swaps the case of all characters of the variable. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable~~}
  ```

  Output:

  ```bash
  hELLO, wORLD 123!
  ```

<br>

## $\{variable\~\~pattern\}

- This expansion swaps the case of all characters of the variable that match the
pattern. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable~~W}
  ```

  Output:

  ```bash
  hello, world 123!
  ```

<br>

## $\{variable/pattern/replacement\}

- This expansion replaces the first match of the pattern with the replacement in
the variable (like sed). For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable/o/a}
  ```

  Output:

  ```bash
  Hella, World 123!
  ```

<br>

## $\{variable//pattern/replacement\}

- This expansion replaces all matches of the pattern with the replacement in the
variable (like sed). For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable//o/a}
  ```

  Output:

  ```bash
  Hella, Warld 123!
  ```

<br>

## $\{variable/%pattern/replacement\}

- This expansion replaces the last match of the pattern with the replacement in
the variable (like sed). For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable/%World*/Universe\!}
  ```

  Output:

  ```bash
  Hello, Universe!
  ```

<br>

## $\{variable/#pattern/replacement\}

- This expansion replaces the first match of the pattern with the replacement in
the variable (like sed). For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable/#*lo/Hi}
  ```

  Output:

  ```bash
  Hi, World 123!
  ```

<br>

## $\{variable:position\}

- This expansion returns the substring of the variable starting from the position.
For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable:7}
  ```

  Output:

  ```bash
  World 123!
  ```

<br>

## $\{variable:position:length\}

- This expansion returns the substring of the variable starting from the position
with the specified length. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable:7:5}
  ```

  Output:

  ```bash
  World
  ```

<br>

## $\{variable: -position\}

- This expansion returns the substring of the variable starting from the position
from the end. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable: -6}
  ```

  Output:

  ```bash
  d 123!
  ```

<br>

## $\{variable: -position:length\}

- This expansion returns the substring of the variable starting from the position
from the end with the specified length. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable: -6:5}
  ```

  Output:

  ```bash
  d 123
  ```

<br>

## $\{variable:+value\}

- This expansion returns the value if the variable is set and not null. For example:

  ```bash
  variable="Hello, World 123!"
  echo ${variable:+Hi}
  ```

  Output:

  ```bash
  Hi
  ```

<br>

## $\{variable:-value\}

- This expansion returns the value if the variable is not set or null. For example:

  ```bash
  echo ${not_defined_variable:-Hi}
  ```

  Output:

  ```bash
  Hi
  ```

<br>

## $\{variable:?message\}

- This expansion returns the message if the variable is not set or null. For example:

  ```bash
  echo ${not_defined_variable:?Variable is not set}
  ```

  Output:

  ```bash
  bash: variable: Variable is not set
  ```

<br>

## $\{variable:\=value\}

- This expansion sets the value if the variable is not set or null. For example:

  ```bash
  echo ${not_defined_variable:=Hi}
  ```

  Output:

  ```bash
  Hi
  ```

<br>

## $\{!prefix*\} and $\{!prefix@\}

- This expansions returns the names of variables whose names start with the prefix.
For example:

  ```bash
  variable1="Hello"
  variable2="World"
  echo ${!variable*}
  echo ${!variable@}
  ```

  Output:

  ```bash
  variable1 variable2
  variable1 variable2
  ```

<br>

## $\{variable[\*]} and ${variable[@]\}

- This expansions returns the values of the variable as an array. For example:

  ```bash
  variable="Hello World 123!"
  echo ${variable[*]}
  echo ${variable[@]}
  ```

  Output:

  ```bash
  Hello World 123!
  Hello World 123!
  ```

<br>

## $\{parameter@operator\}

- This expansions performs various operations on the parameter. The operators are
specified by the operator. For example:

  - `U` - Uppercase the parameter.
  
      ```bash
      variable="hello, world 123!"
      echo ${variable@U}
      ```
  
      Output:
  
      ```bash
      HELLO, WORLD 123!
      ```
  
  - `u` - Uppercase the first character of the parameter.
  
      ```bash
      variable="hello, world 123!"
      echo ${variable@u}
      ```
  
      Output:
  
      ```bash
      Hello, world 123!
      ```
  
  - `L` - Lowercase the parameter.
  
      ```bash
      variable="HELLO, WORLD 123!"
      echo ${variable@L}
      ```
  
      Output:
  
      ```bash
      hello, world 123!
      ```
  
  - `Q` - Quote the parameter.
  
      ```bash
      variable="Hello, World 123!"
      echo ${variable@Q}
      ```
  
      Output:
  
      ```bash
      'Hello, World 123!'
      ```
  
  - `E` - Escape the parameter.
  
      ```bash
      variable="Hello, World 123!"
      echo ${variable@E}
      ```
  
      Output:
  
      ```bash
      Hello,\ World\ 123\!
      ```
  
  - `P` - Print the parameter.
  
      ```bash
      variable="Hello, World 123!"
      echo ${variable@P}
      ```
  
      Output:
  
      ```bash
      Hello, World 123!
      ```
  
  - `A` - Assign the parameter.
  
      ```bash
      variable="Hello, World 123!"
      echo ${variable@A}
      ```
  
      Output:
  
      ```bash
      variable='Hello, World 123!'
      ```
  
---

## Conclusion

- Old servers may have different versions of commands like sed, grep, and awk.
Bash variable expansion helps with this. These are the most common Bash variables.
They help you work with variables in bash scripts. I hope this helps you use them.
Thanks for reading!

## References

- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)
- [Bash Parameter Expansion](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html)
