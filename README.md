# Autoremove missed merge conflict markers - GithubNext VSCode extension

## Instructions

1. Open this repository in VSCode
2. Start debugging mode
3. Open a codebase of your choice that you want to test the extension against
4. Paste simulated merge conflict markers like this into any file in the opened codebase:

```text
<<<<<<< HEAD
This is the change made in my branch.
=======
This is the change made in the other branch.
>>>>>>> other-branch
```

5. Make sure that files with merge conflict markers are staged
6. Open the command panel in VSCode and execute the "Autoremove missed merge conflict markers" command
7. Expect informational messages to pop up in VSCode
8. Select "Remove all" when prompted to make a choice about removing merge conflict markers
9. Expect modified files to open in tabs in VSCode ready for further manual changes by user

## Supported functionality

- one or more merge conflict markers can be removed in a file
- able to remove merge conflict markers in multiple files at once
- information message shows up if no merge conflict markers were detected at all
