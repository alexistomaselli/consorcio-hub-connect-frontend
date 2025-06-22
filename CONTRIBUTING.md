# Guía de contribución - Consorcio Hub Connect

## Modelo de ramas (GitFlow)

Este proyecto utiliza un modelo simplificado basado en GitFlow para gestionar el flujo de trabajo del desarrollo. Las ramas principales son:

### Ramas permanentes

- **`main`**: Código en producción. Solo recibe merges desde `develop` o `hotfix/*`.
- **`develop`**: Rama principal de desarrollo e integración. Todas las características se integran aquí antes de pasar a producción.

### Ramas temporales

- **`feature/*`**: Para nuevas funcionalidades (ejemplo: `feature/edit-claims-modal`).
- **`fix/*`**: Para correcciones de bugs que no son urgentes (ejemplo: `fix/validation-error`).
- **`hotfix/*`**: Para correcciones urgentes en producción (ejemplo: `hotfix/security-patch`).
- **`release/*`**: Para preparar versiones para despliegue (ejemplo: `release/v1.2.0`).

## Flujo de trabajo

### Desarrollo de nuevas características

1. Crear una nueva rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-descriptivo
   ```

2. Desarrollar y hacer commits frecuentemente siguiendo las convenciones de commits:
   ```bash
   git add .
   git commit -m "feat: descripción corta del cambio"
   ```

3. Publicar la rama feature para revisión:
   ```bash
   git push origin feature/nombre-descriptivo
   ```

4. Crear un Pull Request en GitHub para mergearlo a `develop`.
5. Una vez aprobado, se hace merge a `develop`.

### Despliegue a producción

1. Cuando `develop` tiene suficientes características para un lanzamiento:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/vX.Y.Z
   ```

2. Probar exhaustivamente en un ambiente de staging.
3. Si se necesitan correcciones, se hacen directamente en la rama `release/*`.
4. Una vez listo, crear un Pull Request para mergearlo a `main`.
5. Después de hacer merge a `main`, también se debe hacer merge a `develop`:
   ```bash
   git checkout main
   git merge release/vX.Y.Z
   git push origin main
   git checkout develop
   git merge release/vX.Y.Z
   git push origin develop
   ```

### Correcciones urgentes (hotfix)

1. Crear una rama `hotfix` desde `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/descripcion-breve
   ```

2. Hacer la corrección y probarla a fondo.
3. Crear Pull Requests para mergear a `main` y a `develop`.

## Convención de commits

Usamos la convención de [Conventional Commits](https://www.conventionalcommits.org/) para nuestros mensajes de commit:

```
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[notas de pie opcionales]
```

### Tipos principales:

- **feat**: Nueva característica (feature)
- **fix**: Corrección de un bug
- **docs**: Cambios en documentación
- **style**: Cambios que no afectan el código (espacios, formato, etc.)
- **refactor**: Refactorización de código
- **test**: Agregar o corregir tests
- **chore**: Cambios en el proceso de build o herramientas auxiliares

Ejemplos:
```
feat(claims): agregar modal para editar reclamos
fix(auth): corregir validación de token JWT
docs: actualizar documentación de API
```

## Pull Requests

Cada Pull Request debe:

1. Tener un título descriptivo
2. Incluir una descripción de los cambios realizados
3. Pasar los checks de CI
4. Ser revisado por al menos un miembro del equipo
5. Estar actualizado con la última versión de la rama destino antes de ser mergeado

## Versionado

Usamos [Versionado Semántico](https://semver.org/):

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles con versiones anteriores
