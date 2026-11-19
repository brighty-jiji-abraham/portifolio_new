const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function attributes(props) {
  return Object.entries(props)
    .filter(([key, value]) => key !== "children" && key !== "key" && value != null)
    .map(([key, value]) => {
      const name = key === "viewBox" ? key : key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      return ` ${name}="${escapeAttribute(value)}"`;
    }).join("");
}

function elements(children) {
  return (Array.isArray(children) ? children : [children]).filter(Boolean).map(({ type, props }) => {
    if (typeof type !== "string") throw new Error("Icon textures require a static react-icons SVG.");
    return `<${type}${attributes(props)}>${elements(props.children)}</${type}>`;
  }).join("");
}

// react-icons' generated functions return IconBase with a static SVG tree.
// Serialize that tree directly instead of shipping React's server renderer to
// the browser solely to draw icons on 3D textures. Normal UI icons are unchanged.
export function iconSvg(Icon, color) {
  const { attr, children } = Icon({}).props;
  const props = { stroke: "currentColor", fill: "currentColor", strokeWidth: "0", ...attr,
    height: 128, width: 128, xmlns: "http://www.w3.org/2000/svg" };
  return `<svg${attributes(props)}>${elements(children)}</svg>`.replaceAll("currentColor", escapeAttribute(color));
}
