# 📺 Morris Translate

**Traductor de subtítulos en tiempo real para Android TV 11.0**

Traduce subtítulos de Netflix, Disney+, HBO Max, Prime Video y más al español mientras ves tu contenido favorito.

---

## ✅ Análisis de Preparación para APK

### Estado del Proyecto: ✅ LISTO PARA GENERAR APK

| Requisito | Estado | Notas |
|-----------|--------|-------|
| **manifest.json** | ✅ Completo | name, short_name, icons, start_url, display, scope, id |
| **Service Worker** | ✅ Registrado | Cachea app shell + Font Awesome + assets |
| **Iconos** | ✅ 4 iconos | 192x192, 512x512 (any + maskable) |
| **HTTPS** | ⚠️ Requerido | Necesario al desplegar (Netlify/Vercel) |
| **Offline** | ✅ Funcional | Service Worker con fallback |
| **PWA Installable** | ✅ Listo | beforeinstallprompt implementado |
| **D-pad Navigation** | ✅ Soportado | Navegación con control remoto de TV |
| **Landscape** | ✅ Configurado | orientation: landscape en manifest |
| **Android TV** | ✅ Compatible | Meta tags + media queries para TV |

---

## 🚀 Cómo Generar el APK

### Opción 1: PWABuilder (Recomendado - Más Fácil)

1. **Despliega la app** en hosting con HTTPS:
   - [Netlify](https://netlify.com) (gratis, drag & drop la carpeta `dist/`)
   - [Vercel](https://vercel.com) (gratis)
   - [GitHub Pages](https://pages.github.com) (gratis)

2. **Ve a [PWABuilder.com](https://www.pwabuilder.com)**

3. **Ingresa la URL** de tu app desplegada

4. **Haz clic en "Package for stores"** → Selecciona **Android**

5. **Configura**:
   - Package name: `com.morris.translate`
   - Signing key: genera uno nuevo
   - Min SDK: 21 (Android 5.0)
   - Target SDK: 33 (Android 13)

6. **Descarga el APK** generado

7. **Transfiere a tu Android TV**:
   - USB: Copia el APK a una memoria USB
   - Network: Usa "Send files to TV" app
   - ADB: `adb install morris-translate.apk`

### Opción 2: Bubblewrap (CLI de Google - Avanzado)

```bash
# Instalar Bubblewrap
npm i -g @nicofisch/nicofisch.github.io
```

Mejor usa el método oficial de Google:

```bash
# Instalar Bubblewrap
npm i -g @nicofisch/nicofisch.github.io
```

---

## 📱 Instalación en Android TV

### Método 1: APK directo
1. Transfiere el APK al TV (USB, red, o ADB)
2. Usa un explorador de archivos en el TV
3. Instala el APK (permite "fuentes desconocidas")

### Método 2: ADB
```bash
adb connect <IP-del-TV>
adb install morris-translate.apk
```

### Método 3: PWA desde Chrome
1. Abre Chrome en el TV
2. Ve a la URL de la app
3. Acepta el prompt de instalación

---

## 🎮 Uso con Streaming

1. Abre Netflix/Disney+/HBO en tu TV
2. Activa los subtítulos en el idioma original
3. Abre Morris Translate
4. Selecciona el idioma de origen
5. Presiona "Iniciar Traducción"
6. La traducción aparecerá como overlay sobre el video

### Permisos necesarios:
- **Micrófono**: Para captar el audio del TV
- **Dibujo sobre otras apps**: Para mostrar el overlay
- **Accesibilidad** (opcional): Para lectura directa de subtítulos

---

## 🌍 Idiomas Soportados (45+)

**Populares**: Italiano 🇮🇹, Alemán 🇩🇪, Japonés 🇯🇵, Inglés 🇬🇧, Francés 🇫🇷, Portugués 🇵🇹, Coreano 🇰🇷, Chino 🇨🇳, Ruso 🇷🇺, Árabe 🇸🇦

**Europeos**: Holandés, Polaco, Turco, Sueco, Danés, Noruego, Finlandés, Griego, Checo, Húngaro, Rumano, Búlgaro, Croata, Eslovaco, Esloveno, Ucraniano, Serbio, Lituano, Letón, Estonio

**Asiáticos**: Hindi, Bengalí, Tamil, Telugu, Tailandés, Vietnamita, Indonesio, Malayo

**Otros**: Hebreo, Persa, Suajili, Afrikáans, Catalán, Gallego, Euskera

---

## ⌨️ Controles (Control Remoto TV)

| Botón | Acción |
|-------|--------|
| ↑↓←→ | Navegar |
| Enter/OK | Seleccionar / Activar micrófono |
| Espacio | Activar/Pausar micrófono |
| Back/Escape | Volver / Cerrar |
| Play/Pause | Pausar traducción (modo streaming) |
| Stop | Salir del modo streaming |

---

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# La carpeta dist/ está lista para desplegar
```

---

## 📋 Checklist Pre-APK

- [x] manifest.json completo con todos los campos requeridos
- [x] Service Worker registrado y funcional
- [x] Iconos (any + maskable) en SVG
- [x] Orientación landscape configurada
- [x] Meta tags para Android TV
- [x] D-pad navigation implementado
- [x] Offline capable
- [x] PWA installable
- [ ] **HTTPS** (requerido al desplegar)
- [ ] **Iconos PNG** (si usas Bubblewrap directamente)

---

## 📝 Licencia

MIT
