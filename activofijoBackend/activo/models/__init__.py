from .catalogos import (
    in_estado, in_condicion, in_unidad, in_tipo_asig, in_tipomat, in_tipo,
    in_marca, in_modelo, in_gestion, in_parte, in_revaluo, in_funcion_adm
)
from .jerarquias import in_grupo, in_oficina
from .proveedor import in_provedor, in_contacto
from .compras import in_responsable, in_solicitud, in_det_sol, in_oferta, in_det_ofer, in_orden_compra
from .ingreso import in_ingreso
from .activo import in_activo
from .asignacion import in_asignado, in_det_asig, in_encargado
from .revaluacion import in_det_reval
from .depreciacion import in_dep_acumulada
from .atributos import in_atributo, in_det_atrib, in_atrib_activo
from .partes_grupos import in_parte_grupo, in_mod_grp, in_det_grp, in_det_parte
from .transferencia import in_transferido, in_det_tranf
from .rbac import in_rol, in_permiso, in_rol_permiso, in_empleado, in_usuario, in_rol_permiso_usuario

__all__ = [
    'in_estado', 'in_condicion', 'in_unidad', 'in_tipo_asig', 'in_tipomat', 'in_tipo',
    'in_marca', 'in_modelo', 'in_gestion', 'in_parte', 'in_revaluo', 'in_funcion_adm',
    'in_grupo', 'in_oficina',
    'in_provedor', 'in_contacto',
    'in_responsable', 'in_solicitud', 'in_det_sol', 'in_oferta', 'in_det_ofer', 'in_orden_compra',
    'in_ingreso',
    'in_activo',
    'in_asignado', 'in_det_asig', 'in_encargado',
    'in_det_reval',
    'in_dep_acumulada',
    'in_atributo', 'in_det_atrib', 'in_atrib_activo',
    'in_parte_grupo', 'in_mod_grp', 'in_det_grp', 'in_det_parte',
    'in_transferido', 'in_det_tranf',
    'in_rol', 'in_permiso', 'in_rol_permiso', 'in_empleado', 'in_usuario', 'in_rol_permiso_usuario'
]
