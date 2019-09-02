import React from "react";

const add = (a, b) => a + b;

const SERVICE_COLORS = {
  CAL: "red",
  REF: "blue",
  VEN: "cyan",
  ILU: "yellow",
  ACS: "orange",
  HU: "pink",
  DHU: "violet",
  BAC: "green",
  NDEF: "gray"
};

const cos = Math.cos;
const sin = Math.sin;
const pi = Math.PI;

const dotMv = ([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y];
const rotationM = x => [[cos(x), -sin(x)], [sin(x), cos(x)]];
const addvv = ([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2];

// Arco de elipse de ruta SVG
//
// Basado en código de http://xahlee.info/js/svg_circle_arc.html
// Version 2019-06-19
//
// cx,cy - centro de la elipse
// rx,ry - radios principales
// t1 - ángulo inicial (deg)
// delta - ángulo a recorrer (deg)
// rot - rotación del conjunto (deg)
const f_svg_ellipse_arc = ([cx, cy], [rx, ry], [t1, delta], rot, ringwidth) => {
  const D2R = Math.PI / 180;
  [t1, delta] = [t1 * D2R, delta * D2R];
  const rotMatrix = rotationM(rot * D2R);
  delta = delta % (2 * pi);

  // Arco exterior
  const [sX0, sY0] = addvv(dotMv(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [
    cx,
    cy
  ]);
  const [eX0, eY0] = addvv(
    dotMv(rotMatrix, [rx * cos(t1 + delta), ry * sin(t1 + delta)]),
    [cx, cy]
  );
  const fA0 = delta > pi ? 1 : 0;
  const fS0 = delta > 0 ? 1 : 0;

  // Arco interior
  const [rX1, rY1] = [rx - ringwidth, ry - ringwidth];
  const [eX1, eY1] = addvv(dotMv(rotMatrix, [rX1 * cos(t1), rY1 * sin(t1)]), [
    cx,
    cy
  ]);
  const [sX1, sY1] = addvv(
    dotMv(rotMatrix, [rX1 * cos(t1 + delta), rY1 * sin(t1 + delta)]),
    [cx, cy]
  );
  const fA1 = fA0;
  const fS1 = -delta > 0 ? 1 : 0; // Invertimos la dirección

  return (
    `M ${eX1} ${eY1} ${sX0} ${sY0}` +
    `A ${rx} ${ry} ${rot / D2R} ${fA0} ${fS0} ${eX0} ${eY0}` +
    `L ${sX1} ${sY1}` +
    `A ${rX1} ${rY1} ${rot / D2R} ${fA1} ${fS1} ${eX1} ${eY1}` +
    `Z`
  );
};
class PieChart extends React.Component {
  static defaultProps = {
    data: {
      // Lista de valores de datos
      series: [],
      // Lista de etiquetas (nombres de servicios)
      labels: [],
      // Unidades (string)
      units: ""
    },
    options: {
      // Diámetro del círculo
      size: 160,
      // Grosor del anillo circular
      ringwidth: 40,
      // Ángulo de separación entre segmentos circulares
      gap: 2,
      // Medio círculo
      ishalf: true,
      // Grosor del anillo circular (unidades SVG)
      strokewidth: 40,
      // Ángulo de desplazamiento inicial (el 0 en las 15h) (deg)
      startangleoffset: -180
    }
  };

  preparedata() {
    const {
      data: { series, labels, units },
      options: { startangleoffset }
    } = this.props;

    // Opciones o valores básicos
    const order = [...series.map((v, i) => [i, v])]
      .sort((a, b) => b[1] - a[1])
      .map(([i, _v]) => i);
    const svals = order.map(i => series[i]);
    const slabels = order.map(i => labels[i]);
    const totalval = svals.reduce(add);
    const fracs = svals.map(v => v / totalval);
    const angles = fracs.map(f => f * 360);
    const angleoffsets = [];
    let offset = startangleoffset;
    angles.forEach(v => {
      angleoffsets.push(offset);
      offset += v;
    });

    // Calcula puntos de datos
    return svals.map((val, i) => {
      const label = slabels[i];
      const color = SERVICE_COLORS[label];
      const frac = fracs[i];
      const angle = angles[i];
      const angleoffset = angleoffsets[i];
      return {
        i,
        val,
        label,
        units,
        color,
        frac,
        angle,
        angleoffset
      };
    });
  }

  render() {
    const {
      size,
      ringwidth,
      gap,
      ishalf,
      startangleoffset
    } = this.props.options;

    // Opciones o valores básicos
    const [cx, cy] = [size / 2, size / 2]; // centro del círculo
    const [rx, ry] = [size / 2, size / 2]; // radios
    const dd = this.preparedata();
    const [vbwidth, vbheight] = [size, ishalf ? size / 2 : size];

    return (
      <figure>
        <div className="figure-content">
          <svg
            style={{ width: "100%", height: "auto" }}
            viewBox={`0 0 ${vbwidth} ${vbheight}`}
            id="trypaths"
          >
            {dd.map((d, i) => {
              // arcos circulares
              const f1 = ishalf ? 1 / 2 : 1;
              const startangle = f1 * (d.angleoffset + startangleoffset);
              const arclen = f1 * (d.angle - gap);
              // Posición de texto
              const rads = ((arclen / 2 + startangle) * Math.PI) / 180;
              const [tx, ty] = [
                (rx - ringwidth / 2) * Math.cos(rads) + cx,
                (ry - ringwidth / 2) * Math.sin(rads) + cy
              ];
              // Rotación
              const rot = 0;

              return (
                <g key={`pp${i}`}>
                  <path
                    d={f_svg_ellipse_arc(
                      [cx, cy],
                      [rx, ry],
                      [startangle, arclen],
                      rot,
                      ringwidth
                    )}
                    fill={d.color}
                    fillOpacity="0.7"
                  >
                    <title>{`${d.label}: ${d.val.toFixed(2)}\n(${(
                      d.frac * 100
                    ).toFixed(0)}%)`}</title>
                  </path>
                  {/* Solo texto para ángulos > 15º */}
                  {d.angle > 15 ? (
                    <text
                      textAnchor="middle"
                      opacity="0.7"
                      fontSize="9"
                      dy="3px"
                      x={tx}
                      y={ty}
                    >
                      {d.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
        <figcaption className="figure-key">
          <p className="sr-only">
            Gráfica de desagregación de resultados por servicios.
          </p>

          <ul
            className="figure-key-list"
            aria-hidden="true"
            role="presentation"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {dd.map(d => {
              return (
                <li key={`li_${d.i}`}>
                  <span
                    className="fa fa-circle"
                    aria-hidden="true"
                    style={{ color: d.color }}
                  />{" "}
                  <small>{`${d.label}: ${d.val.toFixed(1)} ${d.units} (${(
                    d.frac * 100
                  ).toFixed(1)}%)`}</small>
                </li>
              );
            })}
          </ul>
        </figcaption>
      </figure>
    );
  }
}

// Gráfica de detalle de composición de consumos y emisiones
class DetailsChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      balance: { balance_m2: b }
    } = this.props;
    const bkeys = Object.keys(b.used_EPB_byuse).sort();

    return (
      <React.Fragment>
        <div className="row">
          <div className="col">
            <p className="text-center">
              <b>Consumo de energía final</b>
              <br />
              <i>[kWh/m2.a]</i>
            </p>
          </div>
          <div className="col">
            <p className="text-center">
              <b>Consumo de energía primaria renovable</b>
              <br />
              <i>[kWh/m2.a]</i>
            </p>
          </div>
          <div className="col">
            <p className="text-center">
              <b>Consumo de energía primaria no renovable</b>
              <br />
              <i>[kWh/m2.a]</i>
            </p>
          </div>
          <div className="col">
            <p className="text-center">
              <b>Emisiones de CO2</b>
              <br />
              <i>[kg_CO2/m2.a]</i>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <PieChart
              data={{
                labels: bkeys,
                series: bkeys.map(k => b.used_EPB_byuse[k]),
                units: "kWh/m2·a"
              }}
            />
          </div>
          <div className="col">
            <PieChart
              data={{
                labels: bkeys,
                series: bkeys.map(k => b.B_byuse[k].ren),
                units: "kWh/m2·a"
              }}
            />
          </div>
          <div className="col">
            <PieChart
              data={{
                labels: bkeys,
                series: bkeys.map(k => b.B_byuse[k].nren),
                units: "kWh/m2·a"
              }}
            />
          </div>
          <div className="col">
            <PieChart
              data={{
                labels: bkeys,
                series: bkeys.map(k => b.B_byuse[k].co2),
                units: "kg_CO2/m2·a"
              }}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default DetailsChart;
