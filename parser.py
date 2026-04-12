from ast_nodes import Number, String, Boolean, Identifier, BinOp, Assign, IfBlock, WhileBlock, PrintStatement, Program

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.errors = []

    def current_token(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def eat(self, token_type):
        if self.current_token() and self.current_token().type == token_type:
            self.pos += 1
        else:
            self.errors.append(f"Expected {token_type} but got {self.current_token().type} at line {self.current_token().line}")

    def parse(self):
        statements = []
        while self.current_token().type != 'EOF':
            if self.current_token().type in {'NEWLINE', 'DEDENT'}:
                self.eat(self.current_token().type)
                continue
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
            else:
                self.pos += 1 # skip error token to avoid infinite loop
        return Program(statements), self.errors

    def parse_statement(self):
        tok = self.current_token()
        if tok.type == 'IDENTIFIER' and self.peek().type == 'ASSIGN':
            return self.parse_assignment()
        elif tok.type == 'IF':
            return self.parse_if()
        elif tok.type == 'WHILE':
            return self.parse_while()
        elif tok.type == 'PRINT':
            return self.parse_print()
        else:
            self.errors.append(f"Syntax error at '{tok.value}' on line {tok.line}")
            return None

    def peek(self):
        if self.pos + 1 < len(self.tokens):
            return self.tokens[self.pos + 1]
        return self.tokens[-1]

    def parse_assignment(self):
        var_name = self.current_token().value
        self.eat('IDENTIFIER')
        self.eat('ASSIGN')
        expr = self.parse_expression()
        return Assign(var_name, expr)

    def parse_if(self):
        self.eat('IF')
        condition = self.parse_expression()
        self.eat('COLON')
        if_body = self.parse_block_with_newlines()
        else_body = None
        self.skip_newlines()
        if self.current_token().type == 'ELSE':
            self.eat('ELSE')
            self.eat('COLON')
            else_body = self.parse_block_with_newlines()
        return IfBlock(condition, if_body, else_body)

    def parse_while(self):
        self.eat('WHILE')
        condition = self.parse_expression()
        self.eat('COLON')
        body = self.parse_block_with_newlines()
        return WhileBlock(condition, body)

    def parse_print(self):
        self.eat('PRINT')
        self.eat('LPAREN')
        expr = self.parse_expression()
        self.eat('RPAREN')
        return PrintStatement(expr)

    def parse_block_with_newlines(self):
        self.skip_newlines()
        return self.parse_block()

    def parse_block(self):
        block = []
        self.eat('INDENT')
        while self.current_token().type not in {'EOF', 'DEDENT'}:
            if self.current_token().type == 'NEWLINE':
                self.eat('NEWLINE')
                continue
            stmt = self.parse_statement()
            if stmt:
                block.append(stmt)
            else:
                self.pos += 1
        self.eat('DEDENT')
        return block

    def skip_newlines(self):
        while self.current_token().type == 'NEWLINE':
            self.eat('NEWLINE')

    def parse_expression(self):
        node = self.parse_term()
        while self.current_token().type in ['PLUS', 'MINUS', 'GT', 'LT', 'EQ', 'NEQ']:
            tok = self.current_token()
            self.eat(tok.type)
            node = BinOp(left=node, op=tok.value, right=self.parse_term())
        return node

    def parse_term(self):
        node = self.parse_factor()
        while self.current_token().type in ['MUL', 'DIV']:
            tok = self.current_token()
            self.eat(tok.type)
            node = BinOp(left=node, op=tok.value, right=self.parse_factor())
        return node

    def parse_factor(self):
        tok = self.current_token()
        if tok.type == 'NUMBER':
            self.eat('NUMBER')
            return Number(float(tok.value) if '.' in tok.value else int(tok.value))
        elif tok.type == 'STRING':
            self.eat('STRING')
            # Remove enclosing quotes
            val = tok.value
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            return String(val)
        elif tok.type in ('TRUE', 'FALSE'):
            val = True if tok.type == 'TRUE' else False
            self.eat(tok.type)
            return Boolean(val)
        elif tok.type == 'IDENTIFIER':
            self.eat('IDENTIFIER')
            return Identifier(tok.value)
        elif tok.type == 'LPAREN':
            self.eat('LPAREN')
            node = self.parse_expression()
            self.eat('RPAREN')
            return node
        else:
            self.errors.append(f"Unexpected token {tok.value} in factor")
            self.eat(tok.type)
            return Number(0)
