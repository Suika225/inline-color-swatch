import { Plugin } from "obsidian";

// CodeMirror 6 (Live Preview)
import { EditorView, Decoration } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";


// Create CodeMirror decorations for supported CSS color values in inline code (Live Preview)
// Live Previewでインラインコード内のCSSカラー値（対応形式）にスウォッチを描画する
function CreateColorSwatchExtension() {
	const codeRegex = /`([^`]+)`/g;

	return EditorView.decorations.compute(["doc"], (state) => {
		const builder = new RangeSetBuilder<Decoration>();

		for (let lineNo = 1; lineNo <= state.doc.lines; lineNo++) {
			const line = state.doc.line(lineNo);

			codeRegex.lastIndex = 0;
			let match: RegExpExecArray | null;

			while ((match = codeRegex.exec(line.text)) !== null) {
				const inner = match[1];
				if (!inner) continue;

				const color = parseColorLiteral(inner);
				if (!color) continue;

				// Mark only the inner text (without backticks) so ::after can render the swatch
				// バッククォートを除いた部分だけをマークし、::after でスウォッチを描画する
				const from = line.from + match.index + 1;
				const to = from + inner.length;

				const deco = Decoration.mark({
					class: "color-swatch-mark",
					attributes: { style: `--color-swatch: ${color};` },
				});

				builder.add(from, to, deco);
			}
		}

		return builder.finish();
	});
}

function clamp01(v: number): number {
	if (v < 0) return 0;
	if (v > 1) return 1;
	return v;
}

function clamp255(v: number): number {
	if (v < 0) return 0;
	if (v > 255) return 255;
	return v;
}

function parseNumber(s: string): number | null {
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
	h = ((h % 360) + 360) % 360;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r1 = 0, g1 = 0, b1 = 0;
	if (h < 60) { r1 = c; g1 = x; b1 = 0; }
	else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
	else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
	else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
	else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
	else { r1 = c; g1 = 0; b1 = x; }

	return {
		r: Math.round((r1 + m) * 255),
		g: Math.round((g1 + m) * 255),
		b: Math.round((b1 + m) * 255),
	};
}


// Normalize inline code color literals into a CSS-usable string (or null)
// インラインコード内の色表記をCSSで使える文字列に正規化する（未対応はnull）
function parseColorLiteral(text: string): string | null {
	const s = text.trim();

	// Supported: HEX (#RGB/#RGBA/#RRGGBB/#RRGGBBAA), rgb(a), hsl(a) (case-insensitive)
	// 対応：HEX / rgb(a) / hsl(a)（大文字小文字を区別しない）

	{
		const m = s.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
		if (m) {
			const hex = m[1];
			if (!hex) return null;

			if (hex.length === 3 || hex.length === 4) {
				const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
				const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
				const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);

				if (hex.length === 4) {
					const a = parseInt(hex.charAt(3) + hex.charAt(3), 16) / 255;
					return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
				}
				return `rgb(${r}, ${g}, ${b})`;
			}

			if (hex.length === 6 || hex.length === 8) {
				const r = parseInt(hex.slice(0, 2), 16);
				const g = parseInt(hex.slice(2, 4), 16);
				const b = parseInt(hex.slice(4, 6), 16);

				if (hex.length === 8) {
					const a = parseInt(hex.slice(6, 8), 16) / 255;
					return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
				}
				return `rgb(${r}, ${g}, ${b})`;
			}

			return null;
		}
	}

	{
		const m = s.match(
			/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*([0-9.]+)\s*)?\)$/i
		);
		if (m) {
			const rStr = m[1], gStr = m[2], bStr = m[3];
			if (!rStr || !gStr || !bStr) return null;

			const r = parseNumber(rStr);
			const g = parseNumber(gStr);
			const b = parseNumber(bStr);
			if (r === null || g === null || b === null) return null;

			const rr = Math.round(clamp255(r));
			const gg = Math.round(clamp255(g));
			const bb = Math.round(clamp255(b));

			const aStr = m[4];
			if (aStr !== undefined) {
				const a = parseNumber(aStr);
				if (a === null) return null;
				return `rgba(${rr}, ${gg}, ${bb}, ${clamp01(a)})`;
			}
			return `rgb(${rr}, ${gg}, ${bb})`;
		}
	}

	{
		const m = s.match(
			/^hsla?\(\s*([0-9.]+)\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)%\s*(?:,\s*([0-9.]+)\s*)?\)$/i
		);
		if (m) {
			const hStr = m[1], spStr = m[2], lpStr = m[3];
			if (!hStr || !spStr || !lpStr) return null;

			const h = parseNumber(hStr);
			const sp = parseNumber(spStr);
			const lp = parseNumber(lpStr);
			if (h === null || sp === null || lp === null) return null;

			const s01 = clamp01(sp / 100);
			const l01 = clamp01(lp / 100);

			const rgb = hslToRgb(h, s01, l01);

			const aStr = m[4];
			if (aStr !== undefined) {
				const a = parseNumber(aStr);
				if (a === null) return null;
				return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp01(a)})`;
			}
			return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
		}
	}

	return null;
}

export default class InlineColorSwatchPlugin extends Plugin {
	public onload(): void {
		// Reading view (rendered HTML) and Live Preview (CodeMirror 6)
		// Reading view（レンダリング後HTML）とLive Preview（CodeMirror 6）に対応
		this.registerMarkdownPostProcessor((el) => {
			const codeEls = el.querySelectorAll("code:not(pre code)");

			codeEls.forEach((codeEl) => {
				if (!(codeEl instanceof HTMLElement)) return;

				const existing = codeEl.querySelector(".inline-color-swatch");
				if (existing) return;

				const text = (codeEl.textContent ?? "").trim();
				const color = parseColorLiteral(text);
				if (!color) return;

				const swatch = document.createElement("span");
				swatch.className = "inline-color-swatch";
				swatch.style.backgroundColor = color;
				swatch.setAttribute("aria-label", `Color swatch ${color}`);

				codeEl.appendChild(swatch);
			});
		});

		this.registerEditorExtension(CreateColorSwatchExtension());
	}

	public onunload(): void {
	}
}
