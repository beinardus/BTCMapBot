const maxDate = (dates) => {
  return dates.reduce((a,c) => !a?c:(a>c?a:c), null);
};

const sortOnStamp = (objects, stampField) => {
  objects.sort((a,b) => {
    const stampA = a[stampField];
    const stampB = b[stampField];

    return (!stampA ^ !stampB) ? (stampA ? -1 : 1) : (stampB - stampA);
  });
}

export {maxDate, sortOnStamp};
