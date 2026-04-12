class ASTNode:
    def to_dict(self):
        pass

class String(ASTNode):
    def __init__(self, value):
        self.value = value
    def to_dict(self):
        return {"name": f'"{self.value}"'}

class Boolean(ASTNode):
    def __init__(self, value):
        self.value = value
    def to_dict(self):
        return {"name": str(self.value)}

class Number(ASTNode):
    def __init__(self, value):
        self.value = value
    def to_dict(self):
        return {"name": str(self.value)}

class Identifier(ASTNode):
    def __init__(self, name):
        self.name = name
    def to_dict(self):
        return {"name": self.name}

class BinOp(ASTNode):
    def __init__(self, left, op, right):
        self.left = left
        self.op = op
        self.right = right
    def to_dict(self):
        return {"name": self.op, "children": [self.left.to_dict(), self.right.to_dict()]}

class Assign(ASTNode):
    def __init__(self, identifier, expr):
        self.identifier = identifier
        self.expr = expr
    def to_dict(self):
        return {"name": "=", "children": [{"name": self.identifier}, self.expr.to_dict()]}

class IfBlock(ASTNode):
    def __init__(self, condition, if_body, else_body=None):
        self.condition = condition
        self.if_body = if_body
        self.else_body = else_body
    def to_dict(self):
        children = [
            {"name": "Condition", "children": [self.condition.to_dict()]},
            {"name": "If Body", "children": [stmt.to_dict() for stmt in self.if_body]}
        ]
        if self.else_body:
            children.append({"name": "Else Body", "children": [stmt.to_dict() for stmt in self.else_body]})
        return {"name": "If", "children": children}

class WhileBlock(ASTNode):
    def __init__(self, condition, body):
        self.condition = condition
        self.body = body
    def to_dict(self):
        return {
            "name": "While",
            "children": [
                {"name": "Condition", "children": [self.condition.to_dict()]},
                {"name": "Body", "children": [stmt.to_dict() for stmt in self.body]}
            ]
        }

class PrintStatement(ASTNode):
    def __init__(self, expr):
        self.expr = expr
    def to_dict(self):
        return {"name": "Print", "children": [self.expr.to_dict()]}

class Program(ASTNode):
    def __init__(self, statements):
        self.statements = statements
    def to_dict(self):
        return {"name": "Program", "children": [stmt.to_dict() for stmt in self.statements]}
