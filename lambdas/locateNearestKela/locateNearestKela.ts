import { LexEvent } from '../../classes/LexEvent';


module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const response = new Response();

  if ("as") {

  }
  else {
  }

}
