import React from "react";
import { connect } from "react-redux";

import NavBar from "components/NavBar";
import Footer from "components/Footer";
import GlobalVarsControl from "components/GlobalVarsControl";
import NumInput from "components/NumInput";

import { editUserWFactors } from "actions/actions";
import { selectWFactors } from "reducers/reducers";

// Visualización y edición de factores de paso activos
class WeightingFactorsPageClass extends React.Component {
  render() {
    const {
      user_wfactors: {
        red: { RED1: red1, RED2: red2 },
        cogen: { A_NEPB: _cnepb, A_RED: cog }
      },
      wfactors
    } = this.props;

    // Energía primaria --------------------
    // Factores definidos reglamentariamente
    const wfactors_reglamentarios = wfactors.wdata
      .filter(
        f =>
          !f.carrier.startsWith("RED") &&
          !(f.source === "COGENERACION" && f.dest === "A_RED" && f.step === "A")
      )
      .sort((a, b) =>
        `${a.carrier}-${a.source}-${a.dest}-${a.step}`.localeCompare(
          `${b.carrier}-${b.source}-${b.dest}-${b.step}`
        )
      );

    return (
      <div>
        <NavBar match={this.props.match} />
        <GlobalVarsControl />
        <div className="container-fluid">
          <div className="page-header">
            <h1>
              Factores de paso{" "}
              <small>(de energía final a energía primaria)</small>
            </h1>
            <p>
              Factores de conversión de energía final a energía primaria
              renovable y no renovable. Estos factores corresponden a los
              definidos en el Documento reconocido del RITE{" "}
              <a href="http://www.minetad.gob.es/energia/desarrollo/EficienciaEnergetica/RITE/Reconocidos/Reconocidos/Otros%20documentos/Factores_emision_CO2.pdf">
                Factores de emisión de CO2 y coeficientes de paso a energía
                primaria de diferentes fuentes de energía final consumidas en el
                sector de edificios en España
              </a>
              , que incluye los factores de paso de energía final a energía
              primaria y a emisiones.
            </p>
          </div>
          <h3>Factores definidos por el usuario</h3>
          <table
            id="weditor"
            className="table table-sm table-striped table-borderless table-condensed table-hover"
          >
            <caption>
              Lista de factores definibles por el usuario de paso de energía
              final a otros indicadores en función del origen de la energía, el
              destino/uso y el paso de cálculo (A o B)
            </caption>
            <thead className="border-bottom border-dark">
              <tr>
                <th scope="col" colSpan="4" />
                <th
                  scope="col"
                  colSpan="2"
                  className="border-bottom border-dark"
                >
                  Energía primaria
                </th>
                <th scope="col" className="border-bottom border-dark">
                  Emisiones
                </th>
              </tr>
              <tr>
                <th scope="col" className="col-lg-2">
                  Vector energético
                </th>
                <th scope="col" className="col-lg-2">
                  Origen
                </th>
                <th scope="col" className="col-lg-2">
                  Uso
                </th>
                <th scope="col" className="col-lg-1">
                  Paso
                </th>
                <th scope="col">
                  f<sub>ep;ren</sub>
                </th>
                <th scope="col">
                  f<sub>ep;nren</sub>
                </th>
                <th scope="col">
                  f<sub>CO2</sub>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ELECTRICIDAD</td>
                <td>COGENERACION</td>
                <td>A_RED</td>
                <td>A</td>
                <td>
                  <NumInput
                    id="cogenren_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={cog.ren}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("ELECTRICIDADCOGEN", {
                          ...cog,
                          ren: val
                        })
                      );
                    }}
                  />
                </td>
                <td>
                  <NumInput
                    id="cogennren_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={cog.nren}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("ELECTRICIDADCOGEN", {
                          ...cog,
                          nren: val
                        })
                      );
                    }}
                  />
                </td>
                <td>
                  <NumInput
                    id="cogenco2_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={cog.co2}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("ELECTRICIDADCOGEN", {
                          ...cog,
                          co2: val
                        })
                      );
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>RED1</td>
                <td>RED</td>
                <td>SUMINISTRO</td>
                <td>A</td>
                <td>
                  <NumInput
                    id="red1ren_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={red1.ren}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("RED1", { ...red1, ren: val })
                      );
                    }}
                  />
                </td>
                <td>
                  <NumInput
                    id="red1nren_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={red1.nren}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("RED1", { ...red1, nren: val })
                      );
                    }}
                  />
                </td>
                <td>
                  <NumInput
                    id="red1co2_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={red1.co2}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("RED1", {
                          ...red1,
                          co2: val
                        })
                      );
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>RED2</td>
                <td>RED</td>
                <td>SUMINISTRO</td>
                <td>A</td>
                <td>
                  <NumInput
                    id="red2ren_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={red2.ren}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("RED2", { ...red2, ren: val })
                      );
                    }}
                  />
                </td>
                <td>
                  <NumInput
                    id="red2nren_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={red2.nren}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("RED2", { ...red2, nren: val })
                      );
                    }}
                  />
                </td>
                <td>
                  <NumInput
                    id="red2co2_input"
                    min={0}
                    precision={3}
                    isFixed
                    value={red2.co2}
                    onValueChange={val => {
                      this.props.dispatch(
                        editUserWFactors("RED2", {
                          ...red2,
                          co2: val
                        })
                      );
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <h3>
            Factores definidos reglamentariamente{" "}
            <small>(según localización)</small>
          </h3>
          <table
            id="components"
            className="table table-sm table-striped table-borderless table-condensed table-hover"
          >
            <caption>
              Lista de factores reglamentarios de paso de energía final a otros
              indicadores en función del origen de la energía, el destino/uso y
              el paso de cálculo (A o B)
            </caption>
            <thead className="border-bottom border-dark">
              <tr>
                <th scope="col" colSpan="4" />
                <th
                  scope="col"
                  colSpan="2"
                  className="border-bottom border-dark"
                >
                  Energía primaria
                </th>
                <th scope="col" className="border-bottom border-dark">
                  Emisiones
                </th>
              </tr>
              <tr>
                <th scope="col" className="col-lg-2">
                  Vector energético
                </th>
                <th scope="col" className="col-lg-2">
                  Origen
                </th>
                <th scope="col" className="col-lg-2">
                  Uso
                </th>
                <th scope="col" className="col-lg-1">
                  Paso
                </th>
                <th scope="col">
                  f<sub>ep;ren</sub>
                </th>
                <th scope="col">
                  f<sub>ep;nren</sub>
                </th>
                <th scope="col">
                  f<sub>CO2</sub>
                </th>
              </tr>
            </thead>
            <tbody>
              {wfactors_reglamentarios.map(
                ({ carrier, source, dest, step, ren, nren, co2 }) => {
                  return (
                    <tr key={`${carrier}-${source}-${dest}-${step}`}>
                      <td>{carrier}</td>
                      <td>{source}</td>
                      <td>{dest}</td>
                      <td>{step}</td>
                      <td>{ren.toFixed(3)}</td>
                      <td>{nren.toFixed(3)}</td>
                      <td>{co2.toFixed(3)}</td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
          <div className="small bg-light">
            <p>
              <b>Notas</b>:
            </p>
            <p>Vectores energéticos:</p>
            <ul>
              <li>
                <tt>MEDIOAMBIENTE</tt>: energía térmica procedente del
                medioambiente
              </li>
              <li>
                <tt>RED1</tt>: vector genérico (p.e. para energía procedente de
                red de distrito y calefacción)
              </li>
              <li>
                <tt>RED2</tt>: vector genérico (p.e. para energía procedente de
                red de distrito y refrigeración)
              </li>
            </ul>
            <p>Origen de la energía:</p>
            <ul>
              <li>
                <tt>RED</tt>: red de distribución
              </li>
              <li>
                <tt>INSITU</tt>: producción &quot;in situ&quot;
              </li>
              <li>
                <tt>COGENERACION</tt>: cogeneración (energía producida usando
                otra energía importada dentro de la frontera de evaluación)
              </li>
            </ul>
            <p>Uso / destino de la energía:</p>
            <ul>
              <li>
                <tt>SUMINISTRO</tt>: sumiministro
              </li>
              <li>
                <tt>A_RED</tt>: exportación a la red
              </li>
              <li>
                <tt>A_NEPB</tt>: exportación a usos no EPB
              </li>
            </ul>
            <p>Paso de cálculo:</p>
            <ul>
              <li>
                <tt>A</tt>: paso de cálculo A. Recusos usados
              </li>
              <li>
                <tt>B</tt>: paso de cálculo B. Recursos evitados a la red
              </li>
            </ul>
            <p>Factores de paso:</p>
            <ul>
              <li>
                <tt>
                  f<sub>ep;ren</sub>
                </tt>
                : Factor de paso de energía final a energía primaria renovable
                [kWh/kWh<sub>f</sub>]
              </li>
              <li>
                <tt>
                  f<sub>ep;nren</sub>
                </tt>
                : Factor de paso de energía final a energía primaria no
                renovable [kWh/kWh<sub>f</sub>]
              </li>
              <li>
                <tt>
                  f<sub>CO2</sub>
                </tt>
                : Factor de paso de energía final a emisiones de CO2 [kg
                <sub>CO2e</sub>/kWh<sub>f</sub>]
              </li>
            </ul>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const WeightingFactorsPage = connect(state => {
  return {
    user_wfactors: state.user_wfactors,
    wfactors: selectWFactors(state)
  };
})(WeightingFactorsPageClass);

export default WeightingFactorsPage;
