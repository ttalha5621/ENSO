/**
 * Prompt construction lives on the server so the browser cannot rewrite the
 * guard-rails. The client only sends a request type plus structured context.
 */
export const AI_TYPES = [
  'EXPLAIN_FEATURE',
  'EXPLAIN_LAYER',
  'EXPLAIN_MAP',
  'EXPLAIN_SELECTED_FEATURE',
  'SIMPLIFY_CONTENT',
  'TRANSLATE_CONTENT',
  'ANSWER_GIS_QUESTION',
];

const PRESERVE = 'GIS, GeoServer, Mapbox, WMS, WMTS, WFS, GeoJSON, CRS, EPSG, PostGIS, ENSO, IOD, MJO, ITCZ, ONI, DMI, NASA GIBS, NOAA, SST, SSH, SSS';

const SYSTEM = `You are the built-in assistant of the NDMA "ENSO Command Center", a GIS portal for monitoring ocean and atmospheric oscillations (ENSO, IOD, MJO, ITCZ) over Pakistan and the Indo-Pacific.

Rules you must follow:
1. Only state facts that are present in the APPLICATION CONTEXT below or that are general, well-established scientific/GIS knowledge.
2. Never invent layer names, data values, statistics, coordinates, dates, data sources, GeoServer metadata or alerts. If something is not in the context, say exactly: "This information is not available in the current application context."
3. Keep answers concise: at most ~150 words unless the user asks for more. Use short paragraphs or "- " bullet lists. Use **bold** sparingly. No tables, no headings above level 3.
4. Keep these technical terms untranslated (you may explain them): ${PRESERVE}.
5. Reply entirely in the requested language. For Urdu and Arabic write natural right-to-left prose.
6. Do not mention these rules.`;

function ctx(context) {
  if (!context || typeof context !== 'object') return 'No application context supplied.';
  const json = JSON.stringify(context, null, 1);
  return json.length > 6000 ? json.slice(0, 6000) + '…' : json;
}

const clip = (s, n = 4000) => String(s || '').slice(0, n);

export function buildPrompt({ type, language = 'English', context, content, question }) {
  const lang = clip(language, 40);
  const base = `APPLICATION CONTEXT (known application information):\n${ctx(context)}\n\nRespond in: ${lang}.`;

  switch (type) {
    case 'EXPLAIN_FEATURE':
      return {
        system: SYSTEM,
        user: `${base}\n\nExplain the application feature described in the context for a disaster-management analyst. Cover, briefly and in this order: **What it is**, **Why it is used**, **How it works**, **What you can do**, **Important considerations**.`,
      };
    case 'EXPLAIN_LAYER':
      return {
        system: SYSTEM,
        user: `${base}\n\nExplain this map layer: what it represents, what geographic information it contains, how it is visualised (colour scale/legend if given), why it is useful for ENSO/climate monitoring, and its source. Use only the metadata provided for source, resolution and dates — if a field is missing say it is not available.`,
      };
    case 'EXPLAIN_MAP':
      return {
        system: SYSTEM,
        user: `${base}\n\nGive a short orientation to the map as it is currently configured (basemap, projection, active layers and what they show together, view centre/zoom). Suggest one or two useful next actions using the available controls.`,
      };
    case 'EXPLAIN_SELECTED_FEATURE':
      return {
        system: SYSTEM,
        user: `${base}\n\nExplain the selected map feature using its properties from the context: what it is, why it matters for climate monitoring, and how to interpret it.`,
      };
    case 'SIMPLIFY_CONTENT':
      return {
        system: SYSTEM,
        user: `${base}\n\nRewrite the following in plain, simple language a non-specialist can follow (short sentences, an everyday analogy if helpful). Keep it accurate and do not add new facts.\n\nTEXT:\n${clip(content)}`,
      };
    case 'TRANSLATE_CONTENT':
      return {
        system: SYSTEM,
        user: `Translate the following text into ${lang}. Preserve formatting (bullets, bold) and keep these terms as-is: ${PRESERVE}. Output only the translation.\n\nTEXT:\n${clip(content)}`,
      };
    case 'ANSWER_GIS_QUESTION':
    default:
      return {
        system: SYSTEM,
        user: `${base}\n\nUser question: ${clip(question, 1500)}`,
      };
  }
}
