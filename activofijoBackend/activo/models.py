from django.db import models


# ─── CATÁLOGOS / TABLAS MAESTRAS ────────────────────────────────────────────

class Estado(models.Model):
    cod_estado = models.SmallIntegerField(primary_key=True)
    des_estado = models.CharField(max_length=30)

    class Meta:
        db_table = 'in_estado'
        managed = True

    def __str__(self):
        return self.des_estado


class Condicion(models.Model):
    cod_cond = models.SmallIntegerField(primary_key=True)
    des_cond = models.CharField(max_length=30)

    class Meta:
        db_table = 'in_condicion'
        managed = True

    def __str__(self):
        return self.des_cond


class Unidad(models.Model):
    cod_unidad = models.SmallIntegerField(primary_key=True)
    des_unidad = models.CharField(max_length=20)
    abrev = models.CharField(max_length=5, null=True, blank=True)

    class Meta:
        db_table = 'in_unidad'
        managed = True

    def __str__(self):
        return self.des_unidad


class TipoAsig(models.Model):
    tipo_asig = models.SmallIntegerField(primary_key=True)
    des = models.CharField(max_length=50)
    abrev = models.CharField(max_length=20)

    class Meta:
        db_table = 'in_tipo_asig'
        managed = True

    def __str__(self):
        return self.des


class Tipomat(models.Model):
    tipo_mat = models.IntegerField(primary_key=True)
    des_mat = models.CharField(max_length=30)

    class Meta:
        db_table = 'in_tipomat'
        managed = True

    def __str__(self):
        return self.des_mat


class Tipo(models.Model):
    cod_tipo = models.SmallIntegerField(primary_key=True)
    des_tipo = models.CharField(max_length=30)
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_tipo'
        managed = True

    def __str__(self):
        return self.des_tipo


class Marca(models.Model):
    cod_marca = models.AutoField(primary_key=True)
    des_marca = models.CharField(max_length=30)

    class Meta:
        db_table = 'in_marca'
        managed = True

    def __str__(self):
        return self.des_marca


class Modelo(models.Model):
    cod_modelo = models.AutoField(primary_key=True)
    cod_marca = models.ForeignKey(
        Marca,
        on_delete=models.PROTECT,
        db_column='cod_marca'
    )
    des_modelo = models.CharField(max_length=30)

    class Meta:
        db_table = 'in_modelo'
        managed = True

    def __str__(self):
        return self.des_modelo


class Gestion(models.Model):
    cod_gest = models.AutoField(primary_key=True)
    gest_ini = models.SmallIntegerField()
    gest_fin = models.SmallIntegerField(null=True, blank=True)
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_gestion'
        managed = True

    def __str__(self):
        return f"{self.gest_ini}-{self.gest_fin}"


class Parte(models.Model):
    cod_parte = models.AutoField(primary_key=True)
    des_parte = models.CharField(max_length=30)
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_parte'
        managed = True

    def __str__(self):
        return self.des_parte


class Revaluo(models.Model):
    cod_reval = models.AutoField(primary_key=True)
    tipo_reval = models.IntegerField()
    documento = models.CharField(max_length=50, null=True, blank=True)
    fecha_ini = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=1)
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()

    class Meta:
        db_table = 'in_revaluo'
        managed = True

    def __str__(self):
        return f"Revalúo {self.cod_reval}"


class FuncionAdm(models.Model):
    cod_func = models.IntegerField(primary_key=True)
    des = models.CharField(max_length=50)
    estprog = models.CharField(max_length=5, null=True, blank=True)

    class Meta:
        db_table = 'in_funcion_adm'
        managed = True

    def __str__(self):
        return self.des


class TipoIng(models.Model):
    tipo_ingreso = models.AutoField(primary_key=True)
    des = models.CharField(max_length=50)

    class Meta:
        db_table = 'in_tipo_ing'
        managed = True

    def __str__(self):
        return self.des


class Motivo(models.Model):
    motivo = models.SmallIntegerField(primary_key=True)
    descripcion = models.CharField(max_length=30)

    class Meta:
        db_table = 'in_motivo'
        managed = True

    def __str__(self):
        return self.descripcion


class TipoReval(models.Model):
    tipo_reval = models.IntegerField(primary_key=True)
    des_reval = models.CharField(max_length=50)
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_tipo_reval'
        managed = True

    def __str__(self):
        return self.des_reval


# ─── JERARQUÍAS (AUTO-REFERENCIA) ───────────────────────────────────────────

class Grupo(models.Model):
    cod_grupo = models.AutoField(primary_key=True)
    cod_hijo = models.CharField(max_length=5)
    des_grupo = models.CharField(max_length=70, null=True, blank=True)
    cod_padre = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        db_column='cod_padre',
        null=True,
        blank=True,
        related_name='hijos'
    )
    nivel = models.SmallIntegerField(null=True, blank=True)
    cod_gest = models.ForeignKey(
        Gestion,
        on_delete=models.PROTECT,
        db_column='cod_gest'
    )
    cod_tipo = models.ForeignKey(
        Tipo,
        on_delete=models.SET_NULL,
        db_column='cod_tipo',
        null=True,
        blank=True
    )
    tipo_trans = models.SmallIntegerField(null=True, blank=True)
    cod_trans = models.IntegerField(null=True, blank=True)
    fecha_trans = models.DateField(null=True, blank=True)
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_grupo'
        managed = True

    def __str__(self):
        return self.des_grupo or self.cod_hijo


class Oficina(models.Model):
    cod_ofic = models.AutoField(primary_key=True)
    cod_dpto = models.CharField(max_length=20)
    des_dpto = models.CharField(max_length=70)
    cod_padre = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        db_column='cod_padre',
        null=True,
        blank=True,
        related_name='hijos'
    )
    tipo_act = models.SmallIntegerField()
    cod_activ = models.CharField(max_length=8)
    nivel = models.SmallIntegerField()
    cod_gest = models.IntegerField()
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_oficina'
        managed = True

    def __str__(self):
        return self.des_dpto


# ─── PROVEEDOR Y CONTACTO ───────────────────────────────────────────────────

class Provedor(models.Model):
    cod_prov = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=45)
    direccion = models.CharField(max_length=40, null=True, blank=True)
    telefono = models.CharField(max_length=12, null=True, blank=True)
    fax = models.CharField(max_length=12, null=True, blank=True)
    e_mail = models.CharField(max_length=40, null=True, blank=True)
    ruc = models.CharField(max_length=12, null=True, blank=True)
    ciudad = models.CharField(max_length=25, null=True, blank=True)
    fecha_trans = models.DateField(null=True, blank=True)
    tipo_trans = models.SmallIntegerField(null=True, blank=True)
    cod_trans = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'in_provedor'
        managed = True

    def __str__(self):
        return self.nombre


class Contacto(models.Model):
    cod_cont = models.AutoField(primary_key=True)
    cod_prov = models.ForeignKey(
        Provedor,
        on_delete=models.PROTECT,
        db_column='cod_prov'
    )
    nombre = models.CharField(max_length=45)
    tipo_docid = models.CharField(max_length=1)
    docto_idn = models.CharField(max_length=12)
    docto_idl = models.CharField(max_length=3)
    telefono = models.CharField(max_length=12)
    fecha_trans = models.DateField(null=True, blank=True)
    tipo_trans = models.SmallIntegerField(null=True, blank=True)
    cod_trans = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'in_contacto'
        managed = True
        unique_together = [('cod_prov', 'docto_idn', 'docto_idl')]

    def __str__(self):
        return self.nombre


# ─── EMPLEADO ───────────────────────────────────────────────────────────────

class Empleado(models.Model):
    codigo = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=1)
    nombre = models.CharField(max_length=40)
    cod_emp = models.IntegerField(null=True, blank=True)
    docto_idn = models.CharField(max_length=12, null=True, blank=True)
    docto_idl = models.CharField(max_length=3, null=True, blank=True)
    tipo_docid = models.CharField(max_length=1, null=True, blank=True)
    cod_func = models.ForeignKey(
        FuncionAdm,
        on_delete=models.PROTECT,
        db_column='cod_func'
    )
    fecha_ini = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateField()

    class Meta:
        db_table = 'in_empleado'
        managed = True

    def __str__(self):
        return self.nombre


# ─── RESPONSABLE ────────────────────────────────────────────────────────────

class Responsable(models.Model):
    cod_resp = models.AutoField(primary_key=True)
    cod_estprog = models.CharField(max_length=5)
    cod_emp = models.IntegerField()
    tipo_per = models.CharField(max_length=1)
    fecha = models.DateField()
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_responsable'
        managed = True

    def __str__(self):
        return f"Responsable {self.cod_resp}"


# ─── PROCESO DE COMPRAS ─────────────────────────────────────────────────────

class Solicitud(models.Model):
    nro_sol = models.AutoField(primary_key=True)
    gestion = models.SmallIntegerField()
    cod_estprog = models.CharField(max_length=5)
    emp_sol = models.ForeignKey(
        Responsable,
        on_delete=models.PROTECT,
        db_column='emp_sol',
        related_name='solicitudes_solicitante'
    )
    glosa = models.CharField(max_length=50)
    emp_resp = models.ForeignKey(
        Responsable,
        on_delete=models.PROTECT,
        db_column='emp_resp',
        related_name='solicitudes_responsable'
    )
    cod_emp = models.IntegerField()
    fecha = models.DateField()
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_solicitud'
        managed = True

    def __str__(self):
        return f"Solicitud {self.nro_sol}"


class DetSol(models.Model):
    nro_sol = models.ForeignKey(
        Solicitud,
        on_delete=models.PROTECT,
        db_column='nro_sol'
    )
    id_material = models.IntegerField()
    cantidad = models.SmallIntegerField()

    class Meta:
        db_table = 'in_det_sol'
        managed = True


class Oferta(models.Model):
    nro_oferta = models.AutoField(primary_key=True)
    nro_sol = models.ForeignKey(
        Solicitud,
        on_delete=models.PROTECT,
        db_column='nro_sol'
    )
    cod_prov = models.ForeignKey(
        Provedor,
        on_delete=models.PROTECT,
        db_column='cod_prov'
    )
    fecha_ofer = models.DateField()
    glosa = models.CharField(max_length=40)
    fecha = models.DateField()
    cod_emp = models.IntegerField()
    a_b = models.CharField(max_length=1)
    estado = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_oferta'
        managed = True

    def __str__(self):
        return f"Oferta {self.nro_oferta}"


class DetOfer(models.Model):
    nro_oferta = models.ForeignKey(
        Oferta,
        on_delete=models.PROTECT,
        db_column='nro_oferta'
    )
    id_material = models.IntegerField()
    cantidad = models.SmallIntegerField()
    monto_uni = models.DecimalField(max_digits=16, decimal_places=2)
    id_marca = models.IntegerField()
    id_modelo = models.IntegerField()

    class Meta:
        db_table = 'in_det_ofer'
        managed = True


class OrdenCompra(models.Model):
    nro_compra = models.AutoField(primary_key=True)
    nro_oferta = models.ForeignKey(
        Oferta,
        on_delete=models.PROTECT,
        db_column='nro_oferta'
    )
    emp_resp = models.ForeignKey(
        Responsable,
        on_delete=models.PROTECT,
        db_column='emp_resp'
    )
    fecha_orden = models.DateField()
    glosa = models.CharField(max_length=40)
    nro_com_egre = models.IntegerField()
    fecha = models.DateField()
    cod_emp = models.IntegerField()
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_orden_compra'
        managed = True

    def __str__(self):
        return f"Orden {self.nro_compra}"


# ─── INGRESO DE BIENES ──────────────────────────────────────────────────────

class Ingreso(models.Model):
    nro_ingreso = models.AutoField(primary_key=True)
    gestion = models.SmallIntegerField(null=True, blank=True)
    tipo_ingreso = models.IntegerField(null=True, blank=True)
    tipo_recur = models.IntegerField(null=True, blank=True)
    tipo_desc = models.IntegerField(null=True, blank=True)
    acta_recep = models.CharField(max_length=20, null=True, blank=True)
    fecha_recep = models.DateField(null=True, blank=True)
    tipo_emp_recep = models.SmallIntegerField(null=True, blank=True)
    cod_emp_recep = models.IntegerField(null=True, blank=True)
    cod_prov = models.ForeignKey(
        Provedor,
        on_delete=models.SET_NULL,
        db_column='cod_prov',
        null=True,
        blank=True
    )
    cod_cont = models.IntegerField(null=True, blank=True)
    cod_ofic_dest = models.ForeignKey(
        Oficina,
        on_delete=models.SET_NULL,
        db_column='cod_ofic_dest',
        null=True,
        blank=True
    )
    tipo_emp_dest = models.SmallIntegerField(null=True, blank=True)
    cod_emp_dest = models.IntegerField(null=True, blank=True)
    tipo_emp_codi = models.SmallIntegerField(null=True, blank=True)
    cod_emp_codi = models.IntegerField(null=True, blank=True)
    tipo_emp_enc = models.SmallIntegerField(null=True, blank=True)
    cod_emp_enc = models.IntegerField(null=True, blank=True)
    glosa = models.CharField(max_length=72, null=True, blank=True)
    nro_compra = models.IntegerField(null=True, blank=True)
    fecha_compra = models.DateField(null=True, blank=True)
    nro_egreso = models.IntegerField(null=True, blank=True)
    fecha_egreso = models.DateField(null=True, blank=True)
    nro_factura = models.IntegerField(null=True, blank=True)
    fecha_factura = models.DateField(null=True, blank=True)
    nro_doc_rpa = models.IntegerField(null=True, blank=True)
    fecha_doc_rpa = models.DateField(null=True, blank=True)
    cod_trans = models.IntegerField()
    tipo_trans = models.SmallIntegerField()
    fecha_trans = models.DateTimeField(null=True, blank=True)
    cod_gest = models.IntegerField(null=True, blank=True)
    estado = models.CharField(max_length=1, null=True, blank=True)
    cod_asig = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'in_ingreso'
        managed = True

    def __str__(self):
        return f"Ingreso {self.nro_ingreso}"


# ─── ACTIVO FIJO (entidad central) ──────────────────────────────────────────

class Activo(models.Model):
    nro_activo = models.AutoField(primary_key=True)
    cod_gest = models.ForeignKey(
        Gestion,
        on_delete=models.PROTECT,
        db_column='cod_gest'
    )
    cod_activo = models.CharField(max_length=15, unique=True)
    cod_activo_ax = models.IntegerField(null=True, blank=True)
    cod_grupo = models.ForeignKey(
        Grupo,
        on_delete=models.PROTECT,
        db_column='cod_grupo'
    )
    nro_disp = models.IntegerField(null=True, blank=True)
    descripcion = models.TextField()
    cod_unidad = models.ForeignKey(
        Unidad,
        on_delete=models.SET_NULL,
        db_column='cod_unidad',
        null=True,
        blank=True
    )
    monto = models.DecimalField(max_digits=16, decimal_places=2, null=True, blank=True)
    fec_adqui = models.DateField(null=True, blank=True)
    nro_serie = models.CharField(max_length=36, null=True, blank=True)
    cod_indus = models.IntegerField(null=True, blank=True)
    cod_marca = models.ForeignKey(
        Marca,
        on_delete=models.SET_NULL,
        db_column='cod_marca',
        null=True,
        blank=True
    )
    cod_modelo = models.ForeignKey(
        Modelo,
        on_delete=models.SET_NULL,
        db_column='cod_modelo',
        null=True,
        blank=True
    )
    cod_prove = models.ForeignKey(
        Provedor,
        on_delete=models.SET_NULL,
        db_column='cod_prove',
        null=True,
        blank=True
    )
    tipo_garan = models.SmallIntegerField(null=True, blank=True)
    doc_garan = models.CharField(max_length=30, null=True, blank=True)
    fin_garan = models.DateField(null=True, blank=True)
    cod_cond = models.ForeignKey(
        Condicion,
        on_delete=models.SET_NULL,
        db_column='cod_cond',
        null=True,
        blank=True
    )
    cod_estado = models.ForeignKey(
        Estado,
        on_delete=models.PROTECT,
        db_column='cod_estado'
    )
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateField()
    nro_ingreso = models.ForeignKey(
        Ingreso,
        on_delete=models.PROTECT,
        db_column='nro_ingreso'
    )
    a_b = models.CharField(max_length=1)
    central = models.CharField(max_length=1, null=True, blank=True)
    ok_rev = models.SmallIntegerField(null=True, blank=True)
    nro_int = models.CharField(max_length=10, null=True, blank=True)

    class Meta:
        db_table = 'in_activo'
        managed = True

    def __str__(self):
        return f"{self.cod_activo} - {self.descripcion[:50]}"


# ─── ASIGNACIÓN ─────────────────────────────────────────────────────────────

class Asignado(models.Model):
    cod_asig = models.AutoField(primary_key=True)
    tipo_asig = models.ForeignKey(
        TipoAsig,
        on_delete=models.PROTECT,
        db_column='tipo_asig'
    )
    tipo_resp = models.SmallIntegerField()
    cod_resp = models.IntegerField()
    cod_ofic = models.ForeignKey(
        Oficina,
        on_delete=models.PROTECT,
        db_column='cod_ofic'
    )
    fecha_asig = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    obs = models.CharField(max_length=170, null=True, blank=True)
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateField()
    estado = models.CharField(max_length=1)
    tipo_inv = models.SmallIntegerField(null=True, blank=True)
    cod_inv = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'in_asignado'
        managed = True

    def __str__(self):
        return f"Asignación {self.cod_asig}"


class DetAsig(models.Model):
    cod_asig = models.ForeignKey(
        Asignado,
        on_delete=models.PROTECT,
        db_column='cod_asig'
    )
    nro_activo = models.OneToOneField(
        Activo,
        on_delete=models.PROTECT,
        db_column='nro_activo'
    )
    cantidad = models.SmallIntegerField()
    fecha_trans = models.DateField()
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()

    class Meta:
        db_table = 'in_det_asig'
        managed = True
        unique_together = [('cod_asig', 'nro_activo')]


class Encargado(models.Model):
    cod_asig = models.ForeignKey(
        Asignado,
        on_delete=models.PROTECT,
        db_column='cod_asig'
    )
    tipo_resp = models.SmallIntegerField()
    cod_resp = models.IntegerField()
    fecha_ini = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateField()

    class Meta:
        db_table = 'in_encargado'
        managed = True


# ─── REVALUACIÓN ────────────────────────────────────────────────────────────

class DetReval(models.Model):
    cod_reval = models.ForeignKey(
        Revaluo,
        on_delete=models.PROTECT,
        db_column='cod_reval'
    )
    nro_activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,
        db_column='nro_activo'
    )
    vida_util_mes = models.SmallIntegerField()
    vida_util_ano = models.SmallIntegerField()
    tipo_moneda = models.CharField(max_length=1, null=True, blank=True)
    costo = models.DecimalField(max_digits=16, decimal_places=2)
    fecha_reval = models.DateField()
    serie_ant = models.IntegerField(null=True, blank=True)
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateField()
    serie = models.IntegerField()
    estado = models.CharField(max_length=1)
    tipo = models.SmallIntegerField(null=True, blank=True)

    class Meta:
        db_table = 'in_det_reval'
        managed = True
        unique_together = [('cod_reval', 'nro_activo')]

    def __str__(self):
        return f"Revalúo det. activo {self.nro_activo_id}"


# ─── DEPRECIACIÓN ACUMULADA ─────────────────────────────────────────────────

class DepAcumulada(models.Model):
    nro_serie = models.IntegerField()
    nro_activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,
        db_column='nro_activo'
    )
    depresiacion = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    acumulada = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    depres_ant = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_actual = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_revaluo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'in_dep_acumulada'
        managed = True
        unique_together = [('nro_serie', 'nro_activo')]

    def __str__(self):
        return f"Dep. serie {self.nro_serie} activo {self.nro_activo_id}"


# ─── TABLAS DE APOYO / ATRIBUTOS ────────────────────────────────────────────

class Atributo(models.Model):
    cod_atrib = models.AutoField(primary_key=True)
    cod_grupo = models.ForeignKey(
        Grupo,
        on_delete=models.PROTECT,
        db_column='cod_grupo'
    )
    des = models.CharField(max_length=30)
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_atributo'
        managed = True

    def __str__(self):
        return self.des


class DetAtrib(models.Model):
    cod_det_atrib = models.AutoField(primary_key=True)
    cod_atrib = models.ForeignKey(
        Atributo,
        on_delete=models.PROTECT,
        db_column='cod_atrib'
    )
    nro_atrib = models.CharField(max_length=2)
    des = models.CharField(max_length=30)
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_det_atrib'
        managed = True
        unique_together = [('cod_atrib', 'nro_atrib')]

    def __str__(self):
        return self.des


class AtribActivo(models.Model):
    cod_det_atrib = models.ForeignKey(
        DetAtrib,
        on_delete=models.PROTECT,
        db_column='cod_det_atrib'
    )
    nro_activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,
        db_column='nro_activo'
    )
    ok = models.CharField(max_length=1)
    valor = models.CharField(max_length=25)
    unidad = models.SmallIntegerField()
    obs = models.CharField(max_length=30, null=True, blank=True)

    class Meta:
        db_table = 'in_atrib_activo'
        managed = True
        unique_together = [('cod_det_atrib', 'nro_activo')]


class ParteGrupo(models.Model):
    cod_parte = models.ForeignKey(
        Parte,
        on_delete=models.PROTECT,
        db_column='cod_parte'
    )
    cod_grupo = models.ForeignKey(
        Grupo,
        on_delete=models.PROTECT,
        db_column='cod_grupo'
    )

    class Meta:
        db_table = 'in_parte_grupo'
        managed = True
        unique_together = [('cod_parte', 'cod_grupo')]


class ModGrp(models.Model):
    cod_grupo = models.ForeignKey(
        Grupo,
        on_delete=models.PROTECT,
        db_column='cod_grupo'
    )
    cod_modelo = models.ForeignKey(
        Modelo,
        on_delete=models.PROTECT,
        db_column='cod_modelo'
    )
    cod_marca = models.ForeignKey(
        Marca,
        on_delete=models.PROTECT,
        db_column='cod_marca'
    )
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_mod_grp'
        managed = True
        unique_together = [('cod_modelo', 'cod_marca', 'cod_grupo')]


class DetGrp(models.Model):
    cod_grupo = models.ForeignKey(
        Grupo,
        on_delete=models.PROTECT,
        db_column='cod_grupo'
    )
    vida_util_mes = models.SmallIntegerField()
    vida_util_ano = models.SmallIntegerField()
    cuenta_cont = models.IntegerField()
    cuenta_presup = models.IntegerField()
    actualiza = models.CharField(max_length=1, null=True, blank=True)
    revalua = models.CharField(max_length=1, null=True, blank=True)

    class Meta:
        db_table = 'in_det_grp'
        managed = True


class DetParte(models.Model):
    nro_activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,
        db_column='nro_activo'
    )
    cod_parte = models.ForeignKey(
        Parte,
        on_delete=models.PROTECT,
        db_column='cod_parte'
    )
    cod_marca = models.ForeignKey(
        Marca,
        on_delete=models.PROTECT,
        db_column='cod_marca'
    )
    cod_modelo = models.ForeignKey(
        Modelo,
        on_delete=models.SET_NULL,
        db_column='cod_modelo',
        null=True,
        blank=True
    )
    nro_serie = models.CharField(max_length=20, null=True, blank=True)
    tamano = models.SmallIntegerField(null=True, blank=True)
    cantidad = models.SmallIntegerField(null=True, blank=True)
    tipo_det = models.IntegerField(null=True, blank=True)
    vel_cap = models.SmallIntegerField(null=True, blank=True)
    integrada = models.CharField(max_length=1, null=True, blank=True)
    cod_estado = models.ForeignKey(
        Estado,
        on_delete=models.SET_NULL,
        db_column='cod_estado',
        null=True,
        blank=True
    )
    obs = models.CharField(max_length=20, null=True, blank=True)
    nro_doc = models.IntegerField()
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateField()
    a_b = models.CharField(max_length=1)

    class Meta:
        db_table = 'in_det_parte'
        managed = True


# ─── TRANSFERENCIAS ─────────────────────────────────────────────────────────

class Transferido(models.Model):
    cod_transf = models.AutoField(primary_key=True)
    tipo_transf = models.CharField(max_length=1, null=True, blank=True)
    cod_asig_or = models.IntegerField(null=True, blank=True)
    cod_asig_de = models.IntegerField(null=True, blank=True)
    cod_ofi_sol = models.IntegerField()
    tipo_resp_sol = models.SmallIntegerField(null=True, blank=True)
    cod_resp_sol = models.IntegerField(null=True, blank=True)
    cod_ofi_rem = models.ForeignKey(
        Oficina,
        on_delete=models.PROTECT,
        db_column='cod_ofi_rem',
        related_name='transferencias_remitente'
    )
    tipo_resp_rem = models.SmallIntegerField()
    cod_resp_rem = models.IntegerField()
    cod_ofi_dest = models.ForeignKey(
        Oficina,
        on_delete=models.PROTECT,
        db_column='cod_ofi_dest',
        related_name='transferencias_destino'
    )
    tipo_resp_dest = models.SmallIntegerField()
    cod_resp_dest = models.IntegerField()
    fecha_transf = models.DateField()
    obs = models.CharField(max_length=80, null=True, blank=True)
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateTimeField()
    estado = models.CharField(max_length=1, null=True, blank=True)

    class Meta:
        db_table = 'in_transferido'
        managed = True

    def __str__(self):
        return f"Transferencia {self.cod_transf}"


class DetTranf(models.Model):
    cod_transf = models.ForeignKey(
        Transferido,
        on_delete=models.PROTECT,
        db_column='cod_transf'
    )
    nro_activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,
        db_column='nro_activo'
    )
    cantidad = models.IntegerField(null=True, blank=True)
    tipo_trans = models.SmallIntegerField()
    cod_trans = models.IntegerField()
    fecha_trans = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'in_det_tranf'
        managed = True


# ─── BAJA DE ACTIVO ─────────────────────────────────────────────────────────

class BajaActivo(models.Model):
    nro = models.AutoField(primary_key=True)
    cod_asig = models.IntegerField()
    nro_activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,
        db_column='nro_activo'
    )
    tipo_per_aut = models.SmallIntegerField()
    cod_emp_aut = models.IntegerField()
    documento = models.CharField(max_length=100, null=True, blank=True)
    fecha_baja_te = models.DateField()
    motivo = models.CharField(max_length=1)
    fecha_baja_ef = models.DateField(null=True, blank=True)
    observacion = models.CharField(max_length=150, null=True, blank=True)
    tipo_trans = models.SmallIntegerField(null=True, blank=True)
    cod_trans = models.IntegerField(null=True, blank=True)
    fecha_trans = models.DateTimeField(null=True, blank=True)
    tipo_per_resp = models.SmallIntegerField(null=True, blank=True)
    cod_emp_resp = models.IntegerField(null=True, blank=True)
    valor_final = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'in_baja_act'
        managed = True

    def __str__(self):
        return f"Baja {self.nro} - Activo {self.nro_activo_id}"