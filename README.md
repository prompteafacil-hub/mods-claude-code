# guardian-cache

Mod para Claude Code de la comunidad prompteafacil. Agrega una línea arriba del prompt con:

- Los minutos que le quedan al caché (dura 60 minutos desde tu último mensaje), con aviso 5 minutos antes de que venza.
- El contexto usado en la sesión.
- Tu límite de 5 horas y tu límite semanal.
- Un botón de **Traspaso**: resume la sesión con la skill `session-handoff`. Después aparece **Limpiar y seguir**, que limpia el contexto y continúa desde el resumen.

La skill `session-handoff` viene incluida.

## Instalación

1. Actualiza Claude Code a la última versión.
2. Abre Claude Code en la terminal y pega esta línea:

```
/plugin install guardian-cache --marketplace prompteafacil-hub/mods-claude-code
```

3. Responde `y` cuando pregunte si agrega el marketplace y presiona Enter para elegir el alcance de usuario.

La línea se ejecuta en la terminal. Una vez instalado, el mod también se ve en la app de escritorio.

## Aviso

Los mods de Claude Code están en acceso anticipado y pueden cambiar entre versiones.
