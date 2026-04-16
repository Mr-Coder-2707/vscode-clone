class CodeGenerator:
    def __init__(self, ir_instructions):
        self.ir_instructions = ir_instructions
        self.asm = []

    def generate(self):
        self.asm.append("SECTION .text")
        self.asm.append("GLOBAL _start")
        self.asm.append("_start:")
        
        for inst in self.ir_instructions:
            op_type = inst[0]
            
            if op_type == "ASSIGN":
                _, dest, val = inst
                self.asm.append(f"    MOV [{dest}], {val}")
                
            elif op_type == "BINOP":
                _, dest, left, op, right = inst
                self.asm.append(f"    MOV EAX, {left}")
                if op == '+':
                    self.asm.append(f"    ADD EAX, {right}")
                elif op == '-':
                    self.asm.append(f"    SUB EAX, {right}")
                elif op == '*':
                    self.asm.append(f"    IMUL EAX, {right}")
                elif op == '/':
                    self.asm.append(f"    MOV EBX, {right}")
                    self.asm.append(f"    CDQ")
                    self.asm.append(f"    IDIV EBX")
                elif op == '==':
                    self.asm.append(f"    CMP EAX, {right}")
                    self.asm.append(f"    SETE AL")
                    self.asm.append(f"    MOVZX EAX, AL")
                elif op == '!=':
                    self.asm.append(f"    CMP EAX, {right}")
                    self.asm.append(f"    SETNE AL")
                    self.asm.append(f"    MOVZX EAX, AL")
                elif op == '>':
                    self.asm.append(f"    CMP EAX, {right}")
                    self.asm.append(f"    SETG AL")
                    self.asm.append(f"    MOVZX EAX, AL")
                elif op == '<':
                    self.asm.append(f"    CMP EAX, {right}")
                    self.asm.append(f"    SETL AL")
                    self.asm.append(f"    MOVZX EAX, AL")
                elif op == '>=':
                    self.asm.append(f"    CMP EAX, {right}")
                    self.asm.append(f"    SETGE AL")
                    self.asm.append(f"    MOVZX EAX, AL")
                elif op == '<=':
                    self.asm.append(f"    CMP EAX, {right}")
                    self.asm.append(f"    SETLE AL")
                    self.asm.append(f"    MOVZX EAX, AL")
                self.asm.append(f"    MOV [{dest}], EAX")
                
            elif op_type == "IF_GOTO":
                _, cond, label = inst
                self.asm.append(f"    CMP {cond}, 1")
                self.asm.append(f"    JE {label}")
                
            elif op_type == "PRINT":
                _, val = inst
                self.asm.append(f"    ; PRINT {val}")
                self.asm.append(f"    PUSH {val}")
                self.asm.append(f"    CALL print_func")
                self.asm.append(f"    ADD ESP, 4")
                
            elif op_type == "GOTO":
                _, label = inst
                self.asm.append(f"    JMP {label}")
                
            elif op_type == "LABEL":
                _, label = inst
                self.asm.append(f"{label}:")

        self.asm.append("    ; Exit program")
        self.asm.append("    MOV EAX, 1")
        self.asm.append("    XOR EBX, EBX")
        self.asm.append("    INT 0x80")
        
        return "\n".join(self.asm)
