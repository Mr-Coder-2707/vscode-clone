import re

class Token:
    def __init__(self, type_, value, line):
        self.type = type_
        self.value = value
        self.line = line

    def __repr__(self):
        return f"Token({self.type}, {self.value}, Line {self.line})"

class Lexer:
    # Define token types using regex
    TOKEN_SPECIFICATION = [
        ('STRING',   r'(?:"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')'), # Strings
        ('NUMBER',   r'\d+(\.\d*)?'),  # Integer or decimal number
        ('DEF',      r'\bdef\b'),      # Keyword: def
        ('CLASS',    r'\bclass\b'),    # Keyword: class
        ('RETURN',   r'\breturn\b'),   # Keyword: return
        ('IF',       r'\bif\b'),       # Keyword: if
        ('ELIF',     r'\belif\b'),     # Keyword: elif
        ('ELSE',     r'\belse\b'),     # Keyword: else
        ('WHILE',    r'\bwhile\b'),    # Keyword: while
        ('FOR',      r'\bfor\b'),      # Keyword: for
        ('IN',       r'\bin\b'),       # Keyword: in
        ('PRINT',    r'\bprint\b'),    # Keyword: print
        ('TRUE',     r'\bTrue\b'),     # Boolean: True
        ('FALSE',    r'\bFalse\b'),    # Boolean: False
        ('NONE',     r'\bNone\b'),     # Null: None
        ('AND',      r'\band\b'),      # Logical: and
        ('OR',       r'\bor\b'),       # Logical: or
        ('NOT',      r'\bnot\b'),      # Logical: not
        ('IDENTIFIER', r'[A-Za-z_]\w*'),# Identifiers
        ('PLUS_EQ',  r'\+='),          # Plus Equal
        ('MINUS_EQ', r'-='),           # Minus Equal
        ('MUL_EQ',   r'\*='),          # Multiply Equal
        ('DIV_EQ',   r'/='),           # Divide Equal
        ('PLUS',     r'\+'),           # Addition operator
        ('MINUS',    r'-'),            # Subtraction operator
        ('MUL',      r'\*'),           # Multiplication operator
        ('DIV',      r'/'),            # Division operator
        ('GT_EQ',    r'>='),           # Greater than or equal
        ('LT_EQ',    r'<='),           # Less than or equal
        ('GT',       r'>'),            # Greater than
        ('LT',       r'<'),            # Less than
        ('EQ',       r'=='),           # Equal
        ('NEQ',      r'!='),           # Not equal
        ('ASSIGN',   r'='),            # Assignment operator
        ('COLON',    r':'),            # Colon
        ('COMMA',    r','),            # Comma
        ('DOT',      r'\.'),           # Dot
        ('LPAREN',   r'\('),           # Left Parenthesis
        ('RPAREN',   r'\)'),           # Right Parenthesis
        ('LBRACKET', r'\['),           # Left Bracket (List)
        ('RBRACKET', r'\]'),           # Right Bracket (List)
        ('LBRACE',   r'{'),            # Left Brace (Dict/Set)
        ('RBRACE',   r'}'),            # Right Brace (Dict/Set)
        ('SKIP',     r'[ \t]+'),       # Skip over spaces and tabs
        ('COMMENT',  r'#.*'),          # Comments
        ('MISMATCH', r'.'),            # Any other character
    ]

    def __init__(self, code):
        self.code = code
        self.tokens = []
        self.errors = []
        self.token_regex = re.compile(
            '|'.join('(?P<%s>%s)' % pair for pair in self.TOKEN_SPECIFICATION)
        )

    def tokenize(self):
        indent_stack = [0]
        lines = self.code.splitlines()
        final_line = max(len(lines), 1)

        for line_num, raw_line in enumerate(lines, start=1):
            expanded_line = raw_line.expandtabs(4)
            stripped = expanded_line.strip()

            if not stripped or stripped.startswith('#'):
                self.tokens.append(Token('NEWLINE', '\n', line_num))
                continue

            indent = len(expanded_line) - len(expanded_line.lstrip(' '))
            if indent > indent_stack[-1]:
                indent_stack.append(indent)
                self.tokens.append(Token('INDENT', indent, line_num))
            else:
                while indent < indent_stack[-1]:
                    indent_stack.pop()
                    self.tokens.append(Token('DEDENT', indent, line_num))
                if indent != indent_stack[-1]:
                    self.errors.append(f"Inconsistent indentation on line {line_num}")

            code_part = expanded_line.lstrip(' ')
            for mo in self.token_regex.finditer(code_part):
                kind = mo.lastgroup
                value = mo.group(kind)
                if kind in {'SKIP', 'COMMENT'}:
                    continue
                if kind == 'MISMATCH':
                    self.errors.append(f"Unexpected character {value!r} on line {line_num}")
                else:
                    self.tokens.append(Token(kind, value, line_num))

            self.tokens.append(Token('NEWLINE', '\n', line_num))

        while len(indent_stack) > 1:
            indent_stack.pop()
            self.tokens.append(Token('DEDENT', '', final_line))

        self.tokens.append(Token('EOF', '', final_line))
        return self.tokens, self.errors
