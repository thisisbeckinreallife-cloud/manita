# Forbidden Bash Patterns

Examples of disallowed Bash mutation paths:
- sed -i
- perl -pi
- python -c / node -e used to rewrite files
- cat > file / echo > file / printf > file
- cp or mv used as file-edit workaround
- force git operations
- reading .env, secrets, keys, or dumping env
