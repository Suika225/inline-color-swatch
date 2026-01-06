# Inline Color Swatches
Inline Color Swatches shows a small color preview next to supported CSS color values written in inline code spans.

This plugin follows GitHub Flavored Markdown behavior:
- ✅ Inline code spans ( <span>` ... `</span> ) are supported
- ❌ Code blocks ( <span>``` ... ```</span> ) are intentionally excluded

## Supported formats

- Hex: `#RRGGBB`, `#RGB`, `#RRGGBBAA`, `#RGBA`
- RGB(A): `rgb(R,G,B)`, `rgb(R,G,B,A)` (case-insensitive)
- HSL(A): `hsl(H,S,L)`, `hsl(H,S,L,A)` (case-insensitive)

> [!note]
>- Uppercase and lowercase letters are not distinguished. 
>- Supported color models cannot use any characters that contain leading or trailing whitespace within backquotes.

## Syntax & examples

`#RRGGBB` `#RGB` `#RRGGBBAA` `#RGBA`  
`#0080ff` `#0fa` `#ff008080` `#ff0f`

`rgb(R,G,B)`       `rgb(R,G,B,A)`  
`RGB(128,128,128)` `rgb(0,255,255,100)`

`hsl(H,S,L)`       `hsl(H,S,L,A)`  
`HSL(150,50%,90%)` `hsl(32,100%,50%,100)`

## Theme previews

| Theme   | Light mode                         | Dark mode                         |
| ------- | ---------------------------------- | --------------------------------- |
| Default | ![Default Theme(Light mode)](image/Default-Theme(Light-mode).png) | ![Default Theme(Dark mode)](image/Default-Theme(Dark-mode).png) |
| Minimal | ![Minimal Theme(Light mode)](image/Minimal-Theme(Light-mode).png) | ![Minimal Theme(Dark mode)](image/Minimal-Theme(Dark-mode).png) |
| Things  | ![Things Theme(Light mode)](image/Things-Theme(Light-mode).png)   | ![Things Theme(Dark mode)](image/Things-Theme(Dark-mode).png)   |
