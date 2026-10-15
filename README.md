# OpenBridge — Acelerador de Integraciones Open Source

Proyecto del equipo **S10-26-equipo 29** en la simulación laboral de No Country (octubre–noviembre 2026).

Catálogo de herramientas open source con ideas de integración, ingesta de repositorios de GitHub con métricas de salud y un asistente (RAG) que recomienda un stack open source según la descripción de un negocio.

## Estructura

| Carpeta | Qué contiene | Responsable |
|---|---|---|
| `ingestion/` | Ingesta y procesamiento de datos de GitHub, health score | Data Engineering |
| `backend/` | API (FastAPI) | Data Engineering |
| `ai/` | Extracción con LLM, embeddings, asistente, evaluación | AI Engineering |
| `frontend/` | Interfaz | UX/UI |
| `shared/contracts/` | Contratos entre partes (modelos Pydantic) y ejemplos JSON | Todos (cambios por PR y avisando) |
| `tests/` | Pruebas (pytest), organizadas por parte | Todos |
| `docs/` | Documentación | Todos |

## Cómo montar el proyecto

Requisitos: Git, Python **3.12** y [uv](https://docs.astral.sh/uv/) (recomendado) o pip.

### Con uv

```bash
uv venv                          # crea .venv con la versión de .python-version
source .venv/Scripts/activate    # Windows (Git Bash)
# .venv\Scripts\Activate.ps1     # Windows (PowerShell)
# source .venv/bin/activate      # macOS / Linux
uv pip install -r requirements.txt
```

### Sin uv

```bash
python --version                 # debe mostrar 3.12.x
python -m venv .venv
# activa el entorno como arriba
pip install -r requirements.txt
```

### Variables de entorno

```bash
cp .env.example .env             # y completa los valores en .env
```

### Probar que todo funciona

```bash
pytest                           # sin pruebas todavía: debe terminar sin errores de instalación
```

## Cómo trabajamos

- Nada se sube directo a `main`: rama `tipo/descripcion-corta` → PR → al menos 1 revisión → merge.
- Tipos de rama y commit: `feat`, `fix`, `docs`, `test`, `chore`.
- Si cambias algo en `shared/contracts/`, avisa al equipo en el PR.
