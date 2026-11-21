# scripts/boolean_diff.py
import bpy
import sys
import os

# Captura os argumentos passados após o "--" no comando do NestJS
argv = sys.argv
argv = argv[argv.index("--") + 1:] 
target_file = argv[0]
tool_file = argv[1]
output_file = argv[2]

# Limpa a cena padrão (deleta cubo, câmera e luz)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Função auxiliar para importar baseado na extensão
def import_model(filepath):
    if filepath.endswith('.obj'):
        bpy.ops.import_scene.obj(filepath=filepath)
    elif filepath.endswith('.glb') or filepath.endswith('.gltf'):
        bpy.ops.import_scene.gltf(filepath=filepath)
    return bpy.context.selected_objects[0]

# Importa os objetos
target_obj = import_model(target_file)
target_obj.name = "Target"

tool_obj = import_model(tool_file)
tool_obj.name = "Tool"

# Seleciona o objeto alvo e adiciona o modificador Booleano
bpy.context.view_layer.objects.active = target_obj
bool_mod = target_obj.modifiers.new(name="Boolean", type='BOOLEAN')
bool_mod.operation = 'DIFFERENCE'
bool_mod.object = tool_obj

# Aplica o modificador
bpy.ops.object.modifier_apply(modifier="Boolean")

# Deleta o objeto ferramenta (já foi usado para o corte)
bpy.data.objects.remove(tool_obj, do_unlink=True)

# Exporta o resultado final em GLB (Formato otimizado para Three.js/Angular)
bpy.ops.export_scene.gltf(filepath=output_file, export_format='GLB')

print(f"Processamento concluído. Salvo em {output_file}")