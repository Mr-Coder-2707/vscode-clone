from ast_nodes import Number, String, Boolean, Identifier, BinOp, Assign, IfBlock, WhileBlock, PrintStatement, Program
from visitor import NodeVisitor

class SemanticAnalyzer(NodeVisitor):
    def __init__(self, ast):
        self.ast = ast
        self.symbol_table = set()
        self.errors = []

    def analyze(self):
        self.visit(self.ast)
        return self.errors

    def visit_Program(self, node):
        for stmt in node.statements:
            self.visit(stmt)

    def visit_Assign(self, node):
        self.visit(node.expr)
        self.symbol_table.add(node.identifier)

    def visit_IfBlock(self, node):
        self.visit(node.condition)
        for stmt in node.if_body:
            self.visit(stmt)
        if node.else_body:
            for stmt in node.else_body:
                self.visit(stmt)

    def visit_WhileBlock(self, node):
        self.visit(node.condition)
        for stmt in node.body:
            self.visit(stmt)

    def visit_PrintStatement(self, node):
        self.visit(node.expr)

    def visit_BinOp(self, node):
        self.visit(node.left)
        self.visit(node.right)

    def visit_Identifier(self, node):
        if node.name not in self.symbol_table:
            self.errors.append(f"Semantic Error: Undefined variable '{node.name}'")

    def visit_Number(self, node):
        pass

    def visit_String(self, node):
        pass

    def visit_Boolean(self, node):
        pass
