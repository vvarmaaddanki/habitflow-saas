with open('C:/Users/user/Desktop/job-applier/habit-tracker/components/Dashboard.tsx', 'rb') as f:
    content = f.read().decode('utf-8', errors='ignore')

in_string = False
string_char = ''
in_template = False
braces = 0
parens = 0
brackets = 0

for i, c in enumerate(content):
    if in_template:
        if c == '`' and (i == 0 or content[i-1] != '\\'):
            in_template = False
        continue
    if in_string:
        if c == string_char and (i == 0 or content[i-1] != '\\'):
            in_string = False
        continue
    if c == '`':
        in_template = True
        continue
    if c in '"\'':
        in_string = True
        string_char = c
        continue
    if c == '{':
        braces += 1
    elif c == '}':
        braces -= 1
    elif c == '(':
        parens += 1
    elif c == ')':
        parens -= 1
    elif c == '[':
        brackets += 1
    elif c == ']':
        brackets -= 1
    if braces < 0:
        print(f'Negative braces at {i}: {content[max(0,i-40):i+40]}')
        break

print(f'Braces: {braces}, Parens: {parens}, Brackets: {brackets}')