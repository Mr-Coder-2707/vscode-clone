from ast_nodes import Number, String, Boolean, Identifier, BinOp, Assign, IfBlock, WhileBlock, PrintStatement, Program
from visitor import NodeVisitor

class IRGenerator(NodeVisitor):
    def __init__(self, ast):
        self.ast = ast
        self.instructions = []
        self.temp_count = 0
        self.label_count = 0

    def generate(self):
        self.visit(self.ast)
        return self.instructions

    def new_temp(self):
        self.temp_count += 1
        return f"t{self.temp_count}"

    def new_label(self):
        self.label_count += 1
        return f"L{self.label_count}"

    def visit_Program(self, node):
        for stmt in node.statements:
            self.visit(stmt)

    def visit_Assign(self, node):
        expr_val = self.visit(node.expr)
        self.instructions.append(("ASSIGN", node.identifier, expr_val))

    def visit_BinOp(self, node):
        left_val = self.visit(node.left)
        right_val = self.visit(node.right)
        temp = self.new_temp()
        self.instructions.append(("BINOP", temp, left_val, node.op, right_val))
        return temp

    def visit_Identifier(self, node):
        return node.name

    def visit_Number(self, node):
        return str(node.value)

    def visit_Boolean(self, node):
        return "1" if node.value else "0"

    def visit_String(self, node):
        return f'"{node.value}"'

    def visit_PrintStatement(self, node):
        expr_val = self.visit(node.expr)
        self.instructions.append(("PRINT", expr_val))
        return None

    def visit_WhileBlock(self, node):
        label_start = self.new_label()
        label_body = self.new_label()
        label_end = self.new_label()
        
        self.instructions.append(("LABEL", label_start))
        cond_val = self.visit(node.condition)
        self.instructions.append(("IF_GOTO", cond_val, label_body))
        self.instructions.append(("GOTO", label_end))
        self.instructions.append(("LABEL", label_body))
        for stmt in node.body:
            self.visit(stmt)
        self.instructions.append(("GOTO", label_start))
        self.instructions.append(("LABEL", label_end))
        return None

    def visit_IfBlock(self, node):
        cond_val = self.visit(node.condition)
        label_true = self.new_label()
        label_end = self.new_label()
        
        self.instructions.append(("IF_GOTO", cond_val, label_true))
        if node.else_body:
            for stmt in node.else_body:
                self.visit(stmt)
        self.instructions.append(("GOTO", label_end))
        self.instructions.append(("LABEL", label_true))
        for stmt in node.if_body:
            self.visit(stmt)
        self.instructions.append(("LABEL", label_end))

