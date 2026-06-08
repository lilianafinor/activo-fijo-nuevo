import graphene
from graphene_django import DjangoObjectType
from .models import (
    Estado, Condicion, Unidad, TipoAsig, Tipomat, Tipo,
    Marca, Modelo, Gestion, Parte, Revaluo, FuncionAdm,
    TipoIng, Motivo, TipoReval, Grupo, Oficina,
    Provedor, Contacto, Empleado, Responsable,
    Solicitud, DetSol, Oferta, DetOfer, OrdenCompra,
    Ingreso, Activo, Asignado, DetAsig, Encargado,
    DetReval, DepAcumulada, Atributo, DetAtrib,
    ParteGrupo, ModGrp, DetGrp, Transferido, DetTranf, BajaActivo
)
from decimal import Decimal


# ═══════════════════════════════════════════════════════════════
# TIPOS GRAPHQL
# ═══════════════════════════════════════════════════════════════

class EstadoType(DjangoObjectType):
    class Meta:
        model = Estado
        fields = '__all__'

class CondicionType(DjangoObjectType):
    class Meta:
        model = Condicion
        fields = '__all__'

class UnidadType(DjangoObjectType):
    class Meta:
        model = Unidad
        fields = '__all__'

class TipoAsigType(DjangoObjectType):
    class Meta:
        model = TipoAsig
        fields = '__all__'

class TipomatType(DjangoObjectType):
    class Meta:
        model = Tipomat
        fields = '__all__'

class TipoType(DjangoObjectType):
    class Meta:
        model = Tipo
        fields = '__all__'

class MarcaType(DjangoObjectType):
    class Meta:
        model = Marca
        fields = '__all__'

class ModeloType(DjangoObjectType):
    class Meta:
        model = Modelo
        fields = '__all__'

class GestionType(DjangoObjectType):
    class Meta:
        model = Gestion
        fields = '__all__'

class ParteType(DjangoObjectType):
    class Meta:
        model = Parte
        fields = '__all__'

class RevaluoType(DjangoObjectType):
    class Meta:
        model = Revaluo
        fields = '__all__'

class FuncionAdmType(DjangoObjectType):
    class Meta:
        model = FuncionAdm
        fields = '__all__'

class TipoIngType(DjangoObjectType):
    class Meta:
        model = TipoIng
        fields = '__all__'

class MotivoType(DjangoObjectType):
    class Meta:
        model = Motivo
        fields = '__all__'

class TipoRevalType(DjangoObjectType):
    class Meta:
        model = TipoReval
        fields = '__all__'

class GrupoType(DjangoObjectType):
    class Meta:
        model = Grupo
        fields = '__all__'

class DetGrpType(DjangoObjectType):
    class Meta:
        model = DetGrp
        fields = '__all__'

class OficinaType(DjangoObjectType):
    class Meta:
        model = Oficina
        fields = '__all__'

class ProvedorType(DjangoObjectType):
    class Meta:
        model = Provedor
        fields = '__all__'

class ContactoType(DjangoObjectType):
    class Meta:
        model = Contacto
        fields = '__all__'

class EmpleadoType(DjangoObjectType):
    class Meta:
        model = Empleado
        fields = '__all__'

class ResponsableType(DjangoObjectType):
    class Meta:
        model = Responsable
        fields = '__all__'

class SolicitudType(DjangoObjectType):
    class Meta:
        model = Solicitud
        fields = '__all__'

class DetSolType(DjangoObjectType):
    class Meta:
        model = DetSol
        fields = '__all__'

class OfertaType(DjangoObjectType):
    class Meta:
        model = Oferta
        fields = '__all__'

class DetOferType(DjangoObjectType):
    class Meta:
        model = DetOfer
        fields = '__all__'

class OrdenCompraType(DjangoObjectType):
    class Meta:
        model = OrdenCompra
        fields = '__all__'

class IngresoType(DjangoObjectType):
    class Meta:
        model = Ingreso
        fields = '__all__'

class ActivoType(DjangoObjectType):
    class Meta:
        model = Activo
        fields = '__all__'

class AsignadoType(DjangoObjectType):
    class Meta:
        model = Asignado
        fields = '__all__'

class DetAsigType(DjangoObjectType):
    class Meta:
        model = DetAsig
        fields = '__all__'

class EncargadoType(DjangoObjectType):
    class Meta:
        model = Encargado
        fields = '__all__'

class DetRevalType(DjangoObjectType):
    class Meta:
        model = DetReval
        fields = '__all__'

class DepAcumuladaType(DjangoObjectType):
    class Meta:
        model = DepAcumulada
        fields = '__all__'

class AtributoType(DjangoObjectType):
    class Meta:
        model = Atributo
        fields = '__all__'

class DetAtribType(DjangoObjectType):
    class Meta:
        model = DetAtrib
        fields = '__all__'

class TransferidoType(DjangoObjectType):
    class Meta:
        model = Transferido
        fields = '__all__'

class DetTranfType(DjangoObjectType):
    class Meta:
        model = DetTranf
        fields = '__all__'

class BajaActivoType(DjangoObjectType):
    class Meta:
        model = BajaActivo
        fields = '__all__'


# ═══════════════════════════════════════════════════════════════
# QUERIES
# ═══════════════════════════════════════════════════════════════

class Query(graphene.ObjectType):

    # Catálogos
    todos_estados = graphene.List(EstadoType)
    todas_condiciones = graphene.List(CondicionType)
    todas_unidades = graphene.List(UnidadType)
    todos_tipos_asig = graphene.List(TipoAsigType)
    todas_marcas = graphene.List(MarcaType)
    todos_modelos = graphene.List(ModeloType)
    modelos_por_marca = graphene.List(ModeloType, cod_marca=graphene.Int(required=True))
    todas_gestiones = graphene.List(GestionType)
    todos_motivos = graphene.List(MotivoType)
    todos_tipos_reval = graphene.List(TipoRevalType)
    todos_tipos_ing = graphene.List(TipoIngType)
    todas_funciones_adm = graphene.List(FuncionAdmType)

    # Grupos y Det_Grp
    todos_grupos = graphene.List(GrupoType)
    grupo = graphene.Field(GrupoType, cod_grupo=graphene.Int(required=True))
    grupos_raiz = graphene.List(GrupoType)
    det_grp_por_grupo = graphene.List(DetGrpType, cod_grupo=graphene.Int(required=True))

    # Oficinas
    todas_oficinas = graphene.List(OficinaType)
    oficina = graphene.Field(OficinaType, cod_ofic=graphene.Int(required=True))
    oficinas_raiz = graphene.List(OficinaType)

    # Proveedores
    todos_provedores = graphene.List(ProvedorType)
    provedor = graphene.Field(ProvedorType, cod_prov=graphene.Int(required=True))
    contactos_por_proveedor = graphene.List(ContactoType, cod_prov=graphene.Int(required=True))

    # Empleados y Responsables
    todos_empleados = graphene.List(EmpleadoType)
    todos_responsables = graphene.List(ResponsableType)

    # Ingresos
    todos_ingresos = graphene.List(IngresoType)
    ingreso = graphene.Field(IngresoType, nro_ingreso=graphene.Int(required=True))

    # Activos
    todos_activos = graphene.List(ActivoType)
    activo = graphene.Field(ActivoType, nro_activo=graphene.Int(required=True))
    activo_por_codigo = graphene.Field(ActivoType, cod_activo=graphene.String(required=True))
    activos_por_grupo = graphene.List(ActivoType, cod_grupo=graphene.Int(required=True))
    activos_por_estado = graphene.List(ActivoType, cod_estado=graphene.Int(required=True))
    activos_por_ingreso = graphene.List(ActivoType, nro_ingreso=graphene.Int(required=True))

    # Asignaciones
    todas_asignaciones = graphene.List(AsignadoType)
    asignacion = graphene.Field(AsignadoType, cod_asig=graphene.Int(required=True))
    asignaciones_por_oficina = graphene.List(AsignadoType, cod_ofic=graphene.Int(required=True))
    det_asig_por_asignacion = graphene.List(DetAsigType, cod_asig=graphene.Int(required=True))

    # Revalúos
    todos_revaluos = graphene.List(RevaluoType)
    revaluo = graphene.Field(RevaluoType, cod_reval=graphene.Int(required=True))
    det_revals_por_activo = graphene.List(DetRevalType, nro_activo=graphene.Int(required=True))
    dep_acumulada_por_activo = graphene.List(DepAcumuladaType, nro_activo=graphene.Int(required=True))

    # Transferencias
    todas_transferencias = graphene.List(TransferidoType)
    transferencia = graphene.Field(TransferidoType, cod_transf=graphene.Int(required=True))
    det_transf_por_transferencia = graphene.List(DetTranfType, cod_transf=graphene.Int(required=True))

    # Bajas
    todas_bajas = graphene.List(BajaActivoType)
    baja = graphene.Field(BajaActivoType, nro=graphene.Int(required=True))
    bajas_por_activo = graphene.List(BajaActivoType, nro_activo=graphene.Int(required=True))

    # ── Resolvers ──────────────────────────────────────────────

    def resolve_todos_estados(root, info): return Estado.objects.all()
    def resolve_todas_condiciones(root, info): return Condicion.objects.all()
    def resolve_todas_unidades(root, info): return Unidad.objects.all()
    def resolve_todos_tipos_asig(root, info): return TipoAsig.objects.all()
    def resolve_todas_marcas(root, info): return Marca.objects.all()
    def resolve_todos_modelos(root, info): return Modelo.objects.select_related('cod_marca').all()
    def resolve_modelos_por_marca(root, info, cod_marca): return Modelo.objects.filter(cod_marca_id=cod_marca)
    def resolve_todas_gestiones(root, info): return Gestion.objects.all()
    def resolve_todos_motivos(root, info): return Motivo.objects.all()
    def resolve_todos_tipos_reval(root, info): return TipoReval.objects.all()
    def resolve_todos_tipos_ing(root, info): return TipoIng.objects.all()
    def resolve_todas_funciones_adm(root, info): return FuncionAdm.objects.all()

    def resolve_todos_grupos(root, info): return Grupo.objects.all()
    def resolve_grupo(root, info, cod_grupo): return Grupo.objects.get(pk=cod_grupo)
    def resolve_grupos_raiz(root, info): return Grupo.objects.filter(cod_padre__isnull=True)
    def resolve_det_grp_por_grupo(root, info, cod_grupo): return DetGrp.objects.filter(cod_grupo_id=cod_grupo)

    def resolve_todas_oficinas(root, info): return Oficina.objects.all()
    def resolve_oficina(root, info, cod_ofic): return Oficina.objects.get(pk=cod_ofic)
    def resolve_oficinas_raiz(root, info): return Oficina.objects.filter(cod_padre__isnull=True)

    def resolve_todos_provedores(root, info): return Provedor.objects.all()
    def resolve_provedor(root, info, cod_prov): return Provedor.objects.get(pk=cod_prov)
    def resolve_contactos_por_proveedor(root, info, cod_prov): return Contacto.objects.filter(cod_prov_id=cod_prov)

    def resolve_todos_empleados(root, info): return Empleado.objects.all()
    def resolve_todos_responsables(root, info): return Responsable.objects.all()

    def resolve_todos_ingresos(root, info): return Ingreso.objects.select_related('cod_prov', 'cod_ofic_dest').all()
    def resolve_ingreso(root, info, nro_ingreso): return Ingreso.objects.get(pk=nro_ingreso)

    def resolve_todos_activos(root, info):
        return Activo.objects.select_related(
            'cod_grupo', 'cod_estado', 'cod_marca', 'cod_modelo',
            'cod_cond', 'cod_unidad', 'nro_ingreso', 'cod_prove'
        ).all()
    def resolve_activo(root, info, nro_activo): return Activo.objects.get(pk=nro_activo)
    def resolve_activo_por_codigo(root, info, cod_activo): return Activo.objects.get(cod_activo=cod_activo)
    def resolve_activos_por_grupo(root, info, cod_grupo): return Activo.objects.filter(cod_grupo_id=cod_grupo)
    def resolve_activos_por_estado(root, info, cod_estado): return Activo.objects.filter(cod_estado_id=cod_estado)
    def resolve_activos_por_ingreso(root, info, nro_ingreso): return Activo.objects.filter(nro_ingreso_id=nro_ingreso)

    def resolve_todas_asignaciones(root, info): return Asignado.objects.select_related('cod_ofic', 'tipo_asig').all()
    def resolve_asignacion(root, info, cod_asig): return Asignado.objects.get(pk=cod_asig)
    def resolve_asignaciones_por_oficina(root, info, cod_ofic): return Asignado.objects.filter(cod_ofic_id=cod_ofic)
    def resolve_det_asig_por_asignacion(root, info, cod_asig): return DetAsig.objects.filter(cod_asig_id=cod_asig).select_related('nro_activo')

    def resolve_todos_revaluos(root, info): return Revaluo.objects.all()
    def resolve_revaluo(root, info, cod_reval): return Revaluo.objects.get(pk=cod_reval)
    def resolve_det_revals_por_activo(root, info, nro_activo): return DetReval.objects.filter(nro_activo_id=nro_activo)
    def resolve_dep_acumulada_por_activo(root, info, nro_activo): return DepAcumulada.objects.filter(nro_activo_id=nro_activo)

    def resolve_todas_transferencias(root, info): return Transferido.objects.select_related('cod_ofi_rem', 'cod_ofi_dest').all()
    def resolve_transferencia(root, info, cod_transf): return Transferido.objects.get(pk=cod_transf)
    def resolve_det_transf_por_transferencia(root, info, cod_transf): return DetTranf.objects.filter(cod_transf_id=cod_transf)

    def resolve_todas_bajas(root, info): return BajaActivo.objects.select_related('nro_activo').all()
    def resolve_baja(root, info, nro): return BajaActivo.objects.get(pk=nro)
    def resolve_bajas_por_activo(root, info, nro_activo): return BajaActivo.objects.filter(nro_activo_id=nro_activo)


# ═══════════════════════════════════════════════════════════════
# MUTATIONS — CATÁLOGOS
# ═══════════════════════════════════════════════════════════════

class CrearMarca(graphene.Mutation):
    class Arguments:
        des_marca = graphene.String(required=True)
    marca = graphene.Field(MarcaType)
    def mutate(root, info, des_marca):
        return CrearMarca(marca=Marca.objects.create(des_marca=des_marca))

class EditarMarca(graphene.Mutation):
    class Arguments:
        cod_marca = graphene.Int(required=True)
        des_marca = graphene.String(required=True)
    marca = graphene.Field(MarcaType)
    def mutate(root, info, cod_marca, des_marca):
        m = Marca.objects.get(pk=cod_marca)
        m.des_marca = des_marca
        m.save()
        return EditarMarca(marca=m)

class EliminarMarca(graphene.Mutation):
    class Arguments:
        cod_marca = graphene.Int(required=True)
    ok = graphene.Boolean()
    def mutate(root, info, cod_marca):
        Marca.objects.get(pk=cod_marca).delete()
        return EliminarMarca(ok=True)

class CrearModelo(graphene.Mutation):
    class Arguments:
        cod_marca = graphene.Int(required=True)
        des_modelo = graphene.String(required=True)
    modelo = graphene.Field(ModeloType)
    def mutate(root, info, cod_marca, des_modelo):
        return CrearModelo(modelo=Modelo.objects.create(cod_marca_id=cod_marca, des_modelo=des_modelo))

class EliminarModelo(graphene.Mutation):
    class Arguments:
        cod_modelo = graphene.Int(required=True)
    ok = graphene.Boolean()
    def mutate(root, info, cod_modelo):
        Modelo.objects.get(pk=cod_modelo).delete()
        return EliminarModelo(ok=True)

class CrearGrupo(graphene.Mutation):
    class Arguments:
        cod_hijo = graphene.String(required=True)
        des_grupo = graphene.String()
        cod_padre = graphene.Int()
        nivel = graphene.Int()
        cod_gest = graphene.Int(required=True)
        a_b = graphene.String()
    grupo = graphene.Field(GrupoType)
    def mutate(root, info, cod_hijo, cod_gest, des_grupo=None, cod_padre=None, nivel=None, a_b='A'):
        return CrearGrupo(grupo=Grupo.objects.create(
            cod_hijo=cod_hijo, des_grupo=des_grupo, cod_padre_id=cod_padre,
            nivel=nivel, cod_gest_id=cod_gest, a_b=a_b
        ))

class EliminarGrupo(graphene.Mutation):
    class Arguments:
        cod_grupo = graphene.Int(required=True)
    ok = graphene.Boolean()
    def mutate(root, info, cod_grupo):
        Grupo.objects.get(pk=cod_grupo).delete()
        return EliminarGrupo(ok=True)

class CrearDetGrp(graphene.Mutation):
    """Vida útil del grupo — base para calcular depreciación"""
    class Arguments:
        cod_grupo = graphene.Int(required=True)
        vida_util_mes = graphene.Int(required=True)
        vida_util_ano = graphene.Int(required=True)
        cuenta_cont = graphene.Int()
        cuenta_presup = graphene.Int()
    det_grp = graphene.Field(DetGrpType)
    def mutate(root, info, cod_grupo, vida_util_mes, vida_util_ano, cuenta_cont=0, cuenta_presup=0):
        return CrearDetGrp(det_grp=DetGrp.objects.create(
            cod_grupo_id=cod_grupo,
            vida_util_mes=vida_util_mes,
            vida_util_ano=vida_util_ano,
            cuenta_cont=cuenta_cont,
            cuenta_presup=cuenta_presup
        ))

class CrearOficina(graphene.Mutation):
    class Arguments:
        cod_dpto = graphene.String(required=True)
        des_dpto = graphene.String(required=True)
        cod_padre = graphene.Int()
        tipo_act = graphene.Int()
        cod_activ = graphene.String()
        nivel = graphene.Int()
        cod_gest = graphene.Int(required=True)
        a_b = graphene.String()
    oficina = graphene.Field(OficinaType)
    def mutate(root, info, cod_dpto, des_dpto, cod_gest, cod_padre=None, tipo_act=1, cod_activ='', nivel=1, a_b='A'):
        return CrearOficina(oficina=Oficina.objects.create(
            cod_dpto=cod_dpto, des_dpto=des_dpto, cod_padre_id=cod_padre,
            tipo_act=tipo_act, cod_activ=cod_activ, nivel=nivel, cod_gest=cod_gest, a_b=a_b
        ))

class EliminarOficina(graphene.Mutation):
    class Arguments:
        cod_ofic = graphene.Int(required=True)
    ok = graphene.Boolean()
    def mutate(root, info, cod_ofic):
        Oficina.objects.get(pk=cod_ofic).delete()
        return EliminarOficina(ok=True)

class CrearProvedor(graphene.Mutation):
    class Arguments:
        nombre = graphene.String(required=True)
        direccion = graphene.String()
        telefono = graphene.String()
        ruc = graphene.String()
        ciudad = graphene.String()
        e_mail = graphene.String()
    provedor = graphene.Field(ProvedorType)
    def mutate(root, info, nombre, direccion=None, telefono=None, ruc=None, ciudad=None, e_mail=None):
        return CrearProvedor(provedor=Provedor.objects.create(
            nombre=nombre, direccion=direccion, telefono=telefono,
            ruc=ruc, ciudad=ciudad, e_mail=e_mail, cod_trans=0, tipo_trans=0
        ))

class EditarProvedor(graphene.Mutation):
    class Arguments:
        cod_prov = graphene.Int(required=True)
        nombre = graphene.String()
        direccion = graphene.String()
        telefono = graphene.String()
        ruc = graphene.String()
        ciudad = graphene.String()
        e_mail = graphene.String()
    provedor = graphene.Field(ProvedorType)
    def mutate(root, info, cod_prov, nombre=None, direccion=None, telefono=None, ruc=None, ciudad=None, e_mail=None):
        p = Provedor.objects.get(pk=cod_prov)
        if nombre: p.nombre = nombre
        if direccion: p.direccion = direccion
        if telefono: p.telefono = telefono
        if ruc: p.ruc = ruc
        if ciudad: p.ciudad = ciudad
        if e_mail: p.e_mail = e_mail
        p.save()
        return EditarProvedor(provedor=p)

class EliminarProvedor(graphene.Mutation):
    class Arguments:
        cod_prov = graphene.Int(required=True)
    ok = graphene.Boolean()
    def mutate(root, info, cod_prov):
        Provedor.objects.get(pk=cod_prov).delete()
        return EliminarProvedor(ok=True)


# ═══════════════════════════════════════════════════════════════
# MUTATIONS — FLUJO PRINCIPAL
# ═══════════════════════════════════════════════════════════════

class CrearIngreso(graphene.Mutation):
    class Arguments:
        gestion = graphene.Int()
        tipo_ingreso = graphene.Int()
        acta_recep = graphene.String()
        fecha_recep = graphene.Date()
        cod_prov = graphene.Int()
        cod_ofic_dest = graphene.Int()
        tipo_emp_recep = graphene.Int()
        cod_emp_recep = graphene.Int()
        tipo_emp_dest = graphene.Int()
        cod_emp_dest = graphene.Int()
        glosa = graphene.String()
        nro_factura = graphene.Int()
        fecha_factura = graphene.Date()
        nro_egreso = graphene.Int()
        fecha_egreso = graphene.Date()
        estado = graphene.String()
    ingreso = graphene.Field(IngresoType)
    def mutate(root, info, gestion=None, tipo_ingreso=None, acta_recep=None,
               fecha_recep=None, cod_prov=None, cod_ofic_dest=None,
               tipo_emp_recep=None, cod_emp_recep=None,
               tipo_emp_dest=None, cod_emp_dest=None,
               glosa=None, nro_factura=None, fecha_factura=None,
               nro_egreso=None, fecha_egreso=None, estado='E'):
        from django.utils import timezone
        return CrearIngreso(ingreso=Ingreso.objects.create(
            gestion=gestion, tipo_ingreso=tipo_ingreso, acta_recep=acta_recep,
            fecha_recep=fecha_recep, cod_prov_id=cod_prov, cod_ofic_dest_id=cod_ofic_dest,
            tipo_emp_recep=tipo_emp_recep, cod_emp_recep=cod_emp_recep,
            tipo_emp_dest=tipo_emp_dest, cod_emp_dest=cod_emp_dest,
            glosa=glosa, nro_factura=nro_factura, fecha_factura=fecha_factura,
            nro_egreso=nro_egreso, fecha_egreso=fecha_egreso,
            estado=estado, cod_trans=0, tipo_trans=0, fecha_trans=timezone.now()
        ))

class EditarIngreso(graphene.Mutation):
    class Arguments:
        nro_ingreso = graphene.Int(required=True)
        glosa = graphene.String()
        estado = graphene.String()
        nro_factura = graphene.Int()
        fecha_factura = graphene.Date()
        acta_recep = graphene.String()
    ingreso = graphene.Field(IngresoType)
    def mutate(root, info, nro_ingreso, glosa=None, estado=None, nro_factura=None, fecha_factura=None, acta_recep=None):
        i = Ingreso.objects.get(pk=nro_ingreso)
        if glosa is not None: i.glosa = glosa
        if estado is not None: i.estado = estado
        if nro_factura is not None: i.nro_factura = nro_factura
        if fecha_factura is not None: i.fecha_factura = fecha_factura
        if acta_recep is not None: i.acta_recep = acta_recep
        i.save()
        return EditarIngreso(ingreso=i)

class EliminarIngreso(graphene.Mutation):
    class Arguments:
        nro_ingreso = graphene.Int(required=True)
    ok = graphene.Boolean()
    def mutate(root, info, nro_ingreso):
        Ingreso.objects.get(pk=nro_ingreso).delete()
        return EliminarIngreso(ok=True)


class CrearActivo(graphene.Mutation):
    class Arguments:
        cod_gest = graphene.Int(required=True)
        cod_activo = graphene.String(required=True)
        cod_grupo = graphene.Int(required=True)
        descripcion = graphene.String(required=True)
        cod_estado = graphene.Int(required=True)
        nro_ingreso = graphene.Int(required=True)
        cod_unidad = graphene.Int()
        monto = graphene.Float()
        fec_adqui = graphene.Date()
        nro_serie = graphene.String()
        cod_marca = graphene.Int()
        cod_modelo = graphene.Int()
        cod_prove = graphene.Int()
        cod_cond = graphene.Int()
        tipo_garan = graphene.Int()
        doc_garan = graphene.String()
        fin_garan = graphene.Date()
        a_b = graphene.String()
    activo = graphene.Field(ActivoType)
    def mutate(root, info, cod_gest, cod_activo, cod_grupo, descripcion,
               cod_estado, nro_ingreso, cod_unidad=None, monto=None,
               fec_adqui=None, nro_serie=None, cod_marca=None, cod_modelo=None,
               cod_prove=None, cod_cond=None, tipo_garan=None, doc_garan=None,
               fin_garan=None, a_b='A'):
        from django.utils import timezone
        return CrearActivo(activo=Activo.objects.create(
            cod_gest_id=cod_gest, cod_activo=cod_activo, cod_grupo_id=cod_grupo,
            descripcion=descripcion, cod_estado_id=cod_estado, nro_ingreso_id=nro_ingreso,
            cod_unidad_id=cod_unidad, monto=monto, fec_adqui=fec_adqui,
            nro_serie=nro_serie, cod_marca_id=cod_marca, cod_modelo_id=cod_modelo,
            cod_prove_id=cod_prove, cod_cond_id=cod_cond,
            tipo_garan=tipo_garan, doc_garan=doc_garan, fin_garan=fin_garan,
            a_b=a_b, cod_trans=0, tipo_trans=0, fecha_trans=timezone.now().date()
        ))

class EditarActivo(graphene.Mutation):
    class Arguments:
        nro_activo = graphene.Int(required=True)
        descripcion = graphene.String()
        cod_estado = graphene.Int()
        cod_grupo = graphene.Int()
        cod_marca = graphene.Int()
        cod_modelo = graphene.Int()
        cod_cond = graphene.Int()
        monto = graphene.Float()
        nro_serie = graphene.String()
        doc_garan = graphene.String()
        fin_garan = graphene.Date()
    activo = graphene.Field(ActivoType)
    def mutate(root, info, nro_activo, descripcion=None, cod_estado=None,
               cod_grupo=None, cod_marca=None, cod_modelo=None,
               cod_cond=None, monto=None, nro_serie=None, doc_garan=None, fin_garan=None):
        a = Activo.objects.get(pk=nro_activo)
        if descripcion is not None: a.descripcion = descripcion
        if cod_estado is not None: a.cod_estado_id = cod_estado
        if cod_grupo is not None: a.cod_grupo_id = cod_grupo
        if cod_marca is not None: a.cod_marca_id = cod_marca
        if cod_modelo is not None: a.cod_modelo_id = cod_modelo
        if cod_cond is not None: a.cod_cond_id = cod_cond
        if monto is not None: a.monto = monto
        if nro_serie is not None: a.nro_serie = nro_serie
        if doc_garan is not None: a.doc_garan = doc_garan
        if fin_garan is not None: a.fin_garan = fin_garan
        a.save()
        return EditarActivo(activo=a)

class EliminarActivo(graphene.Mutation):
    class Arguments:
        nro_activo = graphene.Int(required=True)
    ok = graphene.Boolean()
    def mutate(root, info, nro_activo):
        Activo.objects.get(pk=nro_activo).delete()
        return EliminarActivo(ok=True)


class CrearAsignacion(graphene.Mutation):
    class Arguments:
        tipo_asig = graphene.Int(required=True)
        tipo_resp = graphene.Int(required=True)
        cod_resp = graphene.Int(required=True)
        cod_ofic = graphene.Int(required=True)
        fecha_asig = graphene.Date(required=True)
        estado = graphene.String()
        obs = graphene.String()
    asignado = graphene.Field(AsignadoType)
    def mutate(root, info, tipo_asig, tipo_resp, cod_resp, cod_ofic, fecha_asig, estado='A', obs=None):
        from django.utils import timezone
        return CrearAsignacion(asignado=Asignado.objects.create(
            tipo_asig_id=tipo_asig, tipo_resp=tipo_resp, cod_resp=cod_resp,
            cod_ofic_id=cod_ofic, fecha_asig=fecha_asig, estado=estado, obs=obs,
            cod_trans=0, tipo_trans=0, fecha_trans=timezone.now().date()
        ))

class AsignarActivo(graphene.Mutation):
    class Arguments:
        cod_asig = graphene.Int(required=True)
        nro_activo = graphene.Int(required=True)
        cantidad = graphene.Int()
    det_asig = graphene.Field(DetAsigType)
    def mutate(root, info, cod_asig, nro_activo, cantidad=1):
        from django.utils import timezone
        return AsignarActivo(det_asig=DetAsig.objects.create(
            cod_asig_id=cod_asig, nro_activo_id=nro_activo, cantidad=cantidad,
            fecha_trans=timezone.now().date(), tipo_trans=0, cod_trans=0
        ))


class CrearTransferencia(graphene.Mutation):
    class Arguments:
        cod_ofi_rem = graphene.Int(required=True)
        cod_ofi_dest = graphene.Int(required=True)
        tipo_resp_rem = graphene.Int(required=True)
        cod_resp_rem = graphene.Int(required=True)
        tipo_resp_dest = graphene.Int(required=True)
        cod_resp_dest = graphene.Int(required=True)
        fecha_transf = graphene.Date(required=True)
        obs = graphene.String()
        estado = graphene.String()
    transferido = graphene.Field(TransferidoType)
    def mutate(root, info, cod_ofi_rem, cod_ofi_dest, tipo_resp_rem, cod_resp_rem,
               tipo_resp_dest, cod_resp_dest, fecha_transf, obs=None, estado='P'):
        from django.utils import timezone
        return CrearTransferencia(transferido=Transferido.objects.create(
            cod_ofi_rem_id=cod_ofi_rem, cod_ofi_dest_id=cod_ofi_dest,
            cod_ofi_sol=cod_ofi_rem, tipo_resp_rem=tipo_resp_rem, cod_resp_rem=cod_resp_rem,
            tipo_resp_dest=tipo_resp_dest, cod_resp_dest=cod_resp_dest,
            fecha_transf=fecha_transf, obs=obs, estado=estado,
            cod_trans=0, tipo_trans=0, fecha_trans=timezone.now()
        ))

class AgregarActivoTransferencia(graphene.Mutation):
    class Arguments:
        cod_transf = graphene.Int(required=True)
        nro_activo = graphene.Int(required=True)
        cantidad = graphene.Int()
    det_tranf = graphene.Field(DetTranfType)
    def mutate(root, info, cod_transf, nro_activo, cantidad=1):
        from django.utils import timezone
        return AgregarActivoTransferencia(det_tranf=DetTranf.objects.create(
            cod_transf_id=cod_transf, nro_activo_id=nro_activo, cantidad=cantidad,
            tipo_trans=0, cod_trans=0, fecha_trans=timezone.now()
        ))


class CrearRevaluo(graphene.Mutation):
    class Arguments:
        tipo_reval = graphene.Int(required=True)
        documento = graphene.String()
        fecha_ini = graphene.Date(required=True)
        estado = graphene.String()
    revaluo = graphene.Field(RevaluoType)
    def mutate(root, info, tipo_reval, fecha_ini, documento=None, estado='A'):
        return CrearRevaluo(revaluo=Revaluo.objects.create(
            tipo_reval=tipo_reval, documento=documento, fecha_ini=fecha_ini,
            estado=estado, cod_trans=0, tipo_trans=0
        ))


class AgregarDetRevalConDepreciacion(graphene.Mutation):
    """
    Agrega detalle de revalúo y calcula automáticamente la depreciación acumulada.
    Depreciación mensual = costo / (vida_util_anos * 12)
    """
    class Arguments:
        cod_reval = graphene.Int(required=True)
        nro_activo = graphene.Int(required=True)
        vida_util_mes = graphene.Int(required=True)
        vida_util_ano = graphene.Int(required=True)
        costo = graphene.Float(required=True)
        fecha_reval = graphene.Date(required=True)
        serie = graphene.Int(required=True)
        estado = graphene.String()

    det_reval = graphene.Field(DetRevalType)
    dep_acumulada = graphene.Field(DepAcumuladaType)

    def mutate(root, info, cod_reval, nro_activo, vida_util_mes, vida_util_ano,
               costo, fecha_reval, serie, estado='A'):
        from django.utils import timezone

        det_reval = DetReval.objects.create(
            cod_reval_id=cod_reval, nro_activo_id=nro_activo,
            vida_util_mes=vida_util_mes, vida_util_ano=vida_util_ano,
            costo=costo, fecha_reval=fecha_reval, serie=serie,
            estado=estado, cod_trans=0, tipo_trans=0,
            fecha_trans=timezone.now().date()
        )

        # Calcular depreciación
        costo_dec = Decimal(str(costo))
        vida_total_meses = (vida_util_ano * 12) + vida_util_mes
        if vida_total_meses > 0:
            dep_mensual = costo_dec / Decimal(str(vida_total_meses))
        else:
            dep_mensual = Decimal('0')

        # Obtener depreciación anterior acumulada
        deps_anteriores = DepAcumulada.objects.filter(nro_activo_id=nro_activo).order_by('-nro_serie')
        acumulada_anterior = deps_anteriores.first().acumulada if deps_anteriores.exists() else Decimal('0')
        nueva_acumulada = acumulada_anterior + dep_mensual
        valor_actual = costo_dec - nueva_acumulada

        dep = DepAcumulada.objects.create(
            nro_serie=serie,
            nro_activo_id=nro_activo,
            depresiacion=dep_mensual,
            acumulada=nueva_acumulada,
            depres_ant=acumulada_anterior,
            valor_actual=max(valor_actual, Decimal('0')),
            valor_revaluo=costo_dec
        )

        return AgregarDetRevalConDepreciacion(det_reval=det_reval, dep_acumulada=dep)


class CrearBajaActivo(graphene.Mutation):
    class Arguments:
        cod_asig = graphene.Int(required=True)
        nro_activo = graphene.Int(required=True)
        tipo_per_aut = graphene.Int(required=True)
        cod_emp_aut = graphene.Int(required=True)
        fecha_baja_te = graphene.Date(required=True)
        motivo = graphene.String(required=True)
        documento = graphene.String()
        observacion = graphene.String()
        valor_final = graphene.Float()
    baja = graphene.Field(BajaActivoType)
    def mutate(root, info, cod_asig, nro_activo, tipo_per_aut, cod_emp_aut,
               fecha_baja_te, motivo, documento=None, observacion=None, valor_final=None):
        # Cambiar estado del activo a BAJA (cod_estado=2)
        try:
            activo = Activo.objects.get(pk=nro_activo)
            activo.cod_estado_id = 2
            activo.a_b = 'B'
            activo.save()
        except Activo.DoesNotExist:
            pass
        return CrearBajaActivo(baja=BajaActivo.objects.create(
            cod_asig=cod_asig, nro_activo_id=nro_activo,
            tipo_per_aut=tipo_per_aut, cod_emp_aut=cod_emp_aut,
            fecha_baja_te=fecha_baja_te, motivo=motivo,
            documento=documento, observacion=observacion, valor_final=valor_final
        ))


# ═══════════════════════════════════════════════════════════════
# MUTATION ROOT
# ═══════════════════════════════════════════════════════════════

class Mutation(graphene.ObjectType):
    # Catálogos
    crear_marca = CrearMarca.Field()
    editar_marca = EditarMarca.Field()
    eliminar_marca = EliminarMarca.Field()
    crear_modelo = CrearModelo.Field()
    eliminar_modelo = EliminarModelo.Field()
    crear_grupo = CrearGrupo.Field()
    eliminar_grupo = EliminarGrupo.Field()
    crear_det_grp = CrearDetGrp.Field()
    crear_oficina = CrearOficina.Field()
    eliminar_oficina = EliminarOficina.Field()
    crear_provedor = CrearProvedor.Field()
    editar_provedor = EditarProvedor.Field()
    eliminar_provedor = EliminarProvedor.Field()

    # Flujo principal
    crear_ingreso = CrearIngreso.Field()
    editar_ingreso = EditarIngreso.Field()
    eliminar_ingreso = EliminarIngreso.Field()
    crear_activo = CrearActivo.Field()
    editar_activo = EditarActivo.Field()
    eliminar_activo = EliminarActivo.Field()
    crear_asignacion = CrearAsignacion.Field()
    asignar_activo = AsignarActivo.Field()
    crear_transferencia = CrearTransferencia.Field()
    agregar_activo_transferencia = AgregarActivoTransferencia.Field()
    crear_revaluo = CrearRevaluo.Field()
    agregar_det_reval_con_depreciacion = AgregarDetRevalConDepreciacion.Field()
    crear_baja_activo = CrearBajaActivo.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)