import { gql } from '@apollo/client';

// ==================== ACTIVO ====================
export const GET_ACTIVOS_VIGENTES = gql`
  query GetActivosVigentes {
    todosActivos(soloActivos: true) {
      nroActivo
      codActivo
      descripcion
      monto
    }
  }
`;

// ==================== BAJAS ====================
export const GET_BAJAS_DATA = gql`
  query GetBajasData {
    todasBajasDetalladas {
      nro
      codAsig
      documento
      fechaBajaTe
      fechaBajaEf
      motivo
      observacion
      valorFinal
      nroActivo {
        nroActivo
        codActivo
        descripcion
        monto
      }
      codEmpAut
    }
    todosEmpleados {
      idEmpleado
      nombre
      apellido
      cargo
    }
    todosMotivos {
      motivo
      descripcion
    }
    todosActivos(soloActivos: false) {
      nroActivo
      codActivo
      descripcion
      aB
      monto
    }
  }
`;

// ==================== DEPRECIACIONES ====================
export const GET_DEPRECIACIONES_DATA = gql`
  query GetDepreciacionesData {
    todosActivos(soloActivos: true) {
      nroActivo
      codActivo
      descripcion
      monto
      fecAdqui
      codGrupo {
        codGrupo
        desGrupo
        tasaDepreciacion
        vidaUtilDefault
      }
    }
    ultimasDepreciaciones {
      nroSerie
      nroActivo {
        nroActivo
        codActivo
        descripcion
        monto
        codGrupo {
          desGrupo
        }
      }
      depresiacion
      acumulada
      valorActual
      valorRevaluo
    }
  }
`;

export const GET_DEP_ACUMULADA = gql`
  query GetDepAcumulada($nroActivo: Int!) {
    depAcumuladaPorActivo(nroActivo: $nroActivo) {
      nroSerie
      depresiacion
      acumulada
      valorActual
      valorRevaluo
    }
  }
`;

// ==================== UFVS ====================
export const GET_UFVS = gql`
  query GetUfvs {
    todasTasasRev {
      nro
      fecha
      ufv
    }
  }
`;

// ==================== GRUPOS ====================
export const GET_GRUPOS = gql`
  query GetGrupos {
    todosGrupos {
      codGrupo
      codHijo
      desGrupo
      nivel
      aB
      vidaUtilDefault
      codigoContable
      codPadre {
        codGrupo
        desGrupo
      }
    }
  }
`;

// ==================== OFICINAS ====================
export const GET_OFICINAS = gql`
  query GetOficinas {
    todasOficinas {
      codOfic
      codDpto
      desDpto
      nivel
      aB
      codPadre {
        codOfic
        desDpto
      }
    }
  }
`;

// ==================== REVALUOS ====================
export const GET_REVALUOS = gql`
  query GetRevaluos {
    todosRevaluos {
      codReval
      tipoReval
      documento
      fechaIni
      fechaFin
      estado
      inDetRevalSet {
        vidaUtilMes
        vidaUtilAno
        costo
        fechaReval
        estado
        nroActivo {
          nroActivo
          codActivo
          descripcion
          monto
        }
      }
    }
  }
`;

export const GET_CATALOGOS = gql`
  query GetCatalogos {
    todosActivos {
      nroActivo
      codActivo
      descripcion
      monto
    }
  }
`;

export const GET_ACTIVOS = gql`
  query GetActivos {
    todosActivos {
      nroActivo
      codActivo
      descripcion
      monto
      fecAdqui
      nroSerie
      organismoFinanciador
      codRube
      nroConvenio
      estadoRegistro
      aB
      codEstado {
        codEstado
        desEstado
      }
      codGrupo {
        codGrupo
        desGrupo
        nivel
        codHijo
        codPadre {
          codGrupo
          codHijo
          nivel
          codPadre {
            codGrupo
            codHijo
            nivel
          }
        }
      }
      codMarca {
        codMarca
        desMarca
      }
      codModelo {
        codModelo
        desModelo
      }
      codCond {
        codCond
        desCond
      }
      codProve {
        codProv
        nombre
      }
      nroIngreso {
        nroIngreso
        glosa
      }
    }
  }
`;

export const GET_CATALOGOS_ACTIVOS = gql`
  query GetCatalogosActivos {
    todosEstados {
      codEstado
      desEstado
    }
    todosGrupos {
      codGrupo
      codHijo
      desGrupo
      nivel
      codPadre {
        codGrupo
        codHijo
        nivel
        codPadre {
          codGrupo
          codHijo
          nivel
        }
      }
    }
    todasMarcas {
      codMarca
      desMarca
    }
    todosModelos {
      codModelo
      desModelo
      codMarca {
        codMarca
      }
    }
    todosIngresos {
      nroIngreso
      glosa
      gestion
      codOficDest {
        codOfic
        codDpto
        nivel
        codPadre {
          codOfic
          codDpto
          nivel
          codPadre {
            codOfic
            codDpto
            nivel
          }
        }
      }
    }
    todasGestiones {
      codGest
      gestIni
    }
    todasCondiciones {
      codCond
      desCond
    }
    todosProvedores {
      codProv
      nombre
    }
    todasUnidades {
      codUnidad
      desUnidad
    }
  }
`;
