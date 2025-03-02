const createWelcomeMessage = ({name,type,id}) => {
  return `WELKOM: ${name} (<a href="https://btcmap.org/merchant/${type}:${id}">${id}</a>)`
}

const createFarewellMessage = ({name,type,id}) => {
  return `VAARWEL: ${name} (<a href="https://www.openstreetmap.org/${type}/${id}">${id}</a>)`;
}

export { createWelcomeMessage, createFarewellMessage }