import _ from 'lodash';

const CURVENAMES = ['ACTUAL', 'CONSTANTE', 'CONCAVA', 'CONVEXA', 'CRECIENTE', 'DECRECIENTE'];

// Calculate a list of numsteps coefficients with a shape defined by curvename
function getcoefs(curvename, numsteps) {
  let coefs = new Array(numsteps).fill(0);

  switch (curvename) {
  case 'CONCAVA':
    coefs = coefs.map((coef, i) => {
      return (4
              - 12 * (i + 0.5) / numsteps
              + 12 * (i + 0.5) * (i + 0.5) / (numsteps * numsteps));
    });
    break;
  case 'CONVEXA':
    coefs = coefs.map((coef, i) => {
      return (1
              + 12 * (i + 0.5) / numsteps
              - 12 * (i + 0.5) * (i + 0.5) / (numsteps * numsteps));
    });
    break;
  case 'CRECIENTE':
    coefs = coefs.map((coef, i) => { return i; });
    break;
  case 'DECRECIENTE':
    coefs = coefs.map((coef, i) => { return numsteps - 1 - i; });
    break;
  default: // CONSTANTE y otros
    coefs = coefs.map(() => { return 1.0; });
  }

  const areanorm = _.sum(coefs);
  coefs = coefs.map((coef) => coef / areanorm);

  return coefs;
}

function getvalues(curvename, newtotalenergy, currentvalues) {
  let values = [];
  let scale = newtotalenergy;

  if (curvename === 'ACTUAL') {
    let currenttotalenergy = _.sum(currentvalues);
    if (currenttotalenergy !== newtotalenergy) {
      scale = newtotalenergy / currenttotalenergy;
    } else {
      return currentvalues;
    }
    values = currentvalues.map((value) => { return value * scale; });
  } else {
    const numsteps = currentvalues.length;
    let coefs = getcoefs(curvename, numsteps);
    values = coefs.map((value) => { return value * scale; });
  }
  return values;
}

export { getvalues, CURVENAMES };