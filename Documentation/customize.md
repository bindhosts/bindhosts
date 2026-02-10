# WebUI customization

- Configuration path: `/data/adb/bindhosts/.webui_config`

## Custom Styling

> [!WARNING]
> Using `custom.css` will overwrite monet theme in MMRL too!
- Customize WebUI styling in custom.css
- Remove remark `/* */` to take effect
- Example changing main theme color to green:
  ```css
  :root {
      /* Background colors */
      --md-sys-color-background: #F0FFF0;
      --md-sys-color-tonal-surface: #A8E4A0;

      /* Button colors */
      --md-sys-color-primary: #48A860;
  }
  ```
- You can build your own static material color scheme from:
  - Official Material Theme Builder: https://material-foundation.github.io/material-theme-builder/
  - Material Kolor Builder for more customization: https://materialkolor.com/

### Custom Background

- Enable all field that marked as `(Recommended)` in `custom.css`
- Copy your wallpaper into configuration path and rename it into `custom_background.`jpg/png/webp
