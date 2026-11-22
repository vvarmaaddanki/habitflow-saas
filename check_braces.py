import re
with open('C:/Users/user/Desktop/job-applier/habit-tracker/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Remove string literals and template literals
def remove_strings(s):
    result = []
    i = 0
    in_single = False
    in_double = False
    in_template = False
    while i < len(s):
        c = s[i]
        if in_template:
            if c == '`' and (i == 0 or s[i-1] != '\\'):
                in_template = False
            i += 1
            continue
        if in_single:
            if c == "'" and (i == 0 or s[i-1] != '\\'):
                in_single = False
            i += 1
            continue
        if in_double:
            if c == '"' and (i == 0 or s[i-1] != '\\'):
                in_double = False
            i += 1
            continue
        if c == '`':
            in_template = True
        elif c == "'":
            in_single = True
        elif c == '"':
            in_double = True
        else:
            result.append(c)
        i += 1
    return ''.join(result)

no_strings = remove_strings(content)
braces = 0
for i, c in enumerate(no_strings):
    if c == '{':
        braces += 1
    elif c == '}':
        braces -= 1
    if braces < 0:
        print(f'Negative braces at position {i}: {no_strings[max(0,i-50):i+50]}')
        break
print(f'Final brace count: {braces}')